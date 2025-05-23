import { Producer } from '@/domain/application/gateways/Messaging/producer';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { Observable, of, timer } from 'rxjs';
import { catchError, retry, timeout, tap } from 'rxjs/operators';
import {
  CorrectLessonResponse,
  KafkaProducerConfig,
  MessagePayload,
  ProducerErrorType,
  ProducerMetrics,
} from './types/message.types';
import { AnswersRepository } from '@/domain/application/repositories/answers.repository';
import { EnvService } from '../env/env.service';
import { ProducerError } from '@/domain/application/gateways/Messaging/errors/producer-error';
import { StatusTransformer } from '@/domain/application/gateways/Messaging/status-transformer';
import {
  CircuitBreaker,
  CircuitBreakerGetState,
} from '@/domain/application/gateways/Circuit Breaker/circuit-breaker';

@Injectable()
export class KafkaMessagingProducer implements Producer, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaMessagingProducer.name);
  private readonly config: KafkaProducerConfig;
  private readonly metrics: ProducerMetrics;

  private isConnected = false;

  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
    private readonly answersRepository: AnswersRepository,
    private readonly envService: EnvService,
    private readonly statusTransformer: StatusTransformer,
    private readonly circuitBreaker: CircuitBreaker,
  ) {
    // Configuração centralizada com valores padrão
    this.config = {
      maxRetries: Number(this.envService.get('KAFKA_BASE_RETRY')) || 3,
      baseTimeout: Number(this.envService.get('KAFKA_BASE_TIMEOUT')) || 500,
      exponentialBackoffBase: 2,
      circuitBreakerThreshold: Number(this.envService.get('KAFKA_CIRCUIT_BREAKER_THRESHOLD')) || 5,
    };

    // Inicialização de dependências
    this.metrics = {
      messagesSent: 0,
      messagesFailures: 0,
      consecutiveFailures: 0,
    };
  }

  async onModuleInit(): Promise<void> {
    try {
      this.kafkaClient.subscribeToResponseOf('challenge.correction');
      // await this.kafkaClient.connect();
      this.isConnected = true;

      this.logger.log('Kafka Producer inicializado com sucesso');
      this.logConfiguration();
    } catch (error) {
      const producerError = new ProducerError(
        'Falha ao conectar com Kafka',
        ProducerErrorType.CONNECTION_ERROR,
        error as Error,
      );

      this.logger.error('Falha na inicialização do Kafka Producer', {
        error: producerError.message,
        originalError: producerError.originalError?.message,
        stack: producerError.stack,
      });

      throw producerError;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.kafkaClient.close();
        this.logger.log('Kafka Producer desconectado com sucesso');
      } catch (error) {
        this.logger.error('Erro ao desconectar Kafka Producer', {
          error: (error as Error).message,
        });
      }
    }

    // Log de métricas finais
    this.logFinalMetrics();
  }

  /**
   * Método principal para produção de mensagens com otimizações
   * @param topic - Tópico Kafka de destino
   * @param message - Mensagem Answer a ser enviada
   * @returns Promise<Answer> - Mensagem processada
   */
  async produce(topic: string, message: Answer): Promise<Answer> {
    const startTime = Date.now();

    try {
      // Validação de entrada
      this.validateInput(topic, message);

      // Verificação do circuit breaker
      if (this.circuitBreaker.isCircuitOpen()) {
        throw new ProducerError(
          'Circuit breaker aberto - muitas falhas consecutivas',
          ProducerErrorType.CIRCUIT_BREAKER_OPEN,
        );
      }

      // Preparação da mensagem
      const messagePayload = this.prepareMessagePayload(message);

      // Armazenamento inicial no banco de dados
      await this.storeInitialMessageState(message);

      // Envio assíncrono da mensagem
      this.sendMessageAsync(topic, messagePayload, message, startTime);
      // Retorna imediatamente sem aguardar a resposta
      return message;
    } catch (error) {
      await this.handleProduceError(error as Error, message);
      throw error;
    }
  }

  private validateInput(topic: string, message: Answer): void {
    if (!topic?.trim()) {
      throw new ProducerError('O tópico não pode ser vazio', ProducerErrorType.SERIALIZATION_ERROR);
    }

    if (!message?.id) {
      throw new ProducerError(
        'A mensagem deve conter ID válido',
        ProducerErrorType.SERIALIZATION_ERROR,
      );
    }

    if (!message?.repositoryUrl?.trim()) {
      throw new ProducerError(
        'A URL do repositório é obrigatória',
        ProducerErrorType.SERIALIZATION_ERROR,
      );
    }
  }

  private prepareMessagePayload(message: Answer): MessagePayload {
    return {
      value: {
        submissionId: message.id.toString(),
        repositoryUrl: message.repositoryUrl,
        // timestamp: new Date().toISOString(),
        // version: '1.0', // Versionamento para compatibilidade futura
      },
    };
  }

  private async storeInitialMessageState(message: Answer): Promise<void> {
    try {
      await this.answersRepository.updateMessageStatus(
        message.id.toString(),
        ANSWER_STATUS.PENDING,
      );
    } catch (error) {
      throw new ProducerError(
        'Falha ao armazenar estado inicial no banco de dados',
        ProducerErrorType.DATABASE_ERROR,
        error as Error,
      );
    }
  }

  private sendMessageAsync(
    topic: string,
    messagePayload: MessagePayload,
    originalMessage: Answer,
    startTime: number,
  ): void {
    this.sendMessageToKafka(topic, messagePayload).subscribe({
      next: async (response) => {
        const duration = Date.now() - startTime;

        if (response) {
          await this.handleSuccessfulResponse(originalMessage, response, duration);
          this.circuitBreaker.recordSuccess();
          this.metrics.messagesSent++;
        } else {
          await this.handleFailedResponse(originalMessage, 'Resposta vazia do Kafka');
        }
      },
      error: async (error) => {
        const duration = Date.now() - startTime;
        await this.handleFailedResponse(originalMessage, error, duration);
        this.circuitBreaker.recordFailure();
        this.metrics.messagesFailures++;
        this.metrics.consecutiveFailures++;
      },
    });
  }

  private sendMessageToKafka(
    topic: string,
    messagePayload: MessagePayload,
  ): Observable<CorrectLessonResponse | null> {
    return this.kafkaClient
      .send<CorrectLessonResponse, { value: MessagePayload }>(topic, { value: messagePayload })
      .pipe(
        timeout(this.config.baseTimeout),
        tap(() => this.logger.debug(`Mensagem enviada para tópico: ${topic}`)),
        retry({
          count: this.config.maxRetries,
          delay: (error, retryCount) => {
            const delayMs = this.calculateExponentialBackoff(retryCount);

            this.logger.warn(`Tentativa ${retryCount}: Retry em ${delayMs}ms`, {
              topic,
              error: error.message,
              retryCount,
            });

            return timer(delayMs);
          },
        }),
        catchError((error) => {
          this.logger.error('Erro no envio após todas as tentativas', {
            topic,
            error: error.message,
            maxRetries: this.config.maxRetries,
          });
          return of(null);
        }),
      );
  }

  private calculateExponentialBackoff(retryCount: number): number {
    return this.config.baseTimeout * Math.pow(this.config.exponentialBackoffBase, retryCount);
  }

  private async handleSuccessfulResponse(
    originalMessage: Answer,
    response: CorrectLessonResponse,
    duration: number,
  ): Promise<void> {
    try {
      const { grade, status } = response;

      const transformedStatus = this.statusTransformer.transform(status);
      // Atualiza mensagem com novos dados
      originalMessage.grade = grade;
      originalMessage.status = transformedStatus as ANSWER_STATUS;

      await this.answersRepository.updateAnswerDetails(originalMessage);

      this.logger.log('Mensagem processada com sucesso', {
        submissionId: originalMessage.id.toString(),
        grade,
        status: transformedStatus,
        duration,
      });
    } catch (error) {
      throw new ProducerError(
        'Falha ao processar resposta do Kafka',
        ProducerErrorType.DATABASE_ERROR,
        error as Error,
      );
    }
  }

  private async handleFailedResponse(
    originalMessage: Answer,
    error: Error | string,
    duration?: number,
  ): Promise<void> {
    try {
      await this.answersRepository.updateMessageStatus(
        originalMessage.id.toString(),
        ANSWER_STATUS.ERROR,
      );

      const errorMessage = typeof error === 'string' ? error : error.message;

      this.logger.error('Falha no processamento da mensagem', {
        submissionId: originalMessage.id.toString(),
        error: errorMessage,
        duration,
      });
    } catch (dbError) {
      this.logger.error('Falha crítica: Erro ao atualizar status no banco', {
        submissionId: originalMessage.id.toString(),
        originalError: typeof error === 'string' ? error : error.message,
        dbError: (dbError as Error).message,
      });
    }
  }

  private async handleProduceError(error: Error, message: Answer): Promise<void> {
    this.logger.error('Erro no método produce', {
      submissionId: message.id.toString(),
      error: error.message,
      type: error.constructor.name,
    });

    // Tenta atualizar status mesmo em caso de erro geral
    try {
      await this.answersRepository.updateMessageStatus(message.id.toString(), ANSWER_STATUS.ERROR);
    } catch (dbError) {
      this.logger.error('Falha ao atualizar status após erro geral', {
        submissionId: message.id.toString(),
        dbError: (dbError as Error).message,
      });
    }
  }

  private logConfiguration(): void {
    this.logger.log('Configuração do Kafka Producer', {
      maxRetries: this.config.maxRetries,
      baseTimeout: this.config.baseTimeout,
      circuitBreakerThreshold: this.config.circuitBreakerThreshold,
    });
  }

  private logFinalMetrics(): void {
    this.logger.log('Métricas do Kafka Producer', {
      messagesSent: this.metrics.messagesSent,
      messagesFailures: this.metrics.messagesFailures,
      circuitBreakerState: this.circuitBreaker.getState(),
    });
  }

  public getMetrics(): ProducerMetrics & { circuitBreaker: CircuitBreakerGetState } {
    return {
      ...this.metrics,
      circuitBreaker: this.circuitBreaker.getState(),
    };
  }
}
