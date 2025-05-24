import { Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaMessagingProducer } from '@/infra/Messaging/kafka-messaging.producer';
import { AnswersRepository } from '@/domain/application/repositories/answers.repository';
import { EnvService } from '@/infra/env/env.service';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { StatusTransformer } from '@/domain/application/gateways/Messaging/status-transformer';
import { CircuitBreaker } from '@/domain/application/gateways/Circuit Breaker/circuit-breaker';

/**
 * Interface que define a estrutura de uma mensagem enviada para o Kafka
 * @property topic - Tópico Kafka para onde a mensagem foi enviada
 * @property message - Conteúdo da mensagem
 * @property timestamp - Momento em que a mensagem foi enviada
 */
interface SentMessage {
  topic: string;
  message: any;
  timestamp: Date;
}

/**
 * Producer Kafka instrumentado para testes E2E
 * Estende o producer base e adiciona funcionalidades de rastreamento
 */
@Injectable()
export class TestKafkaMessagingProducer extends KafkaMessagingProducer {
  private sentMessages: SentMessage[] = [];

  constructor(
    kafkaClient: ClientKafka,
    answersRepository: AnswersRepository,
    envService: EnvService,
    statusTransformer: StatusTransformer,
    circuitBreaker: CircuitBreaker,
  ) {
    super(kafkaClient, answersRepository, envService, statusTransformer, circuitBreaker);
  }

  /**
   * Sobrescreve o método emit do producer base para capturar as mensagens
   * @param topic - Tópico Kafka
   * @param message - Mensagem a ser enviada
   */
  override async produce(topic: string, message: Answer): Promise<Answer> {
    // Registra a mensagem antes de enviá-la
    this.sentMessages.push({
      topic,
      message,
      timestamp: new Date(),
    });

    // Envia a mensagem usando a implementação base
    await super.produce(topic, message);
    return Answer.create(message);
  }

  /**
   * Retorna todas as mensagens enviadas
   */
  getEmittedMessages(): SentMessage[] {
    return [...this.sentMessages];
  }

  /**
   * Retorna mensagens enviadas para um tópico específico
   * @param topic - Tópico Kafka
   */
  getMessagesByTopic(topic: string): SentMessage[] {
    return this.sentMessages.filter((msg) => msg.topic === topic);
  }

  /**
   * Limpa o histórico de mensagens
   */
  clearMessages(): void {
    this.sentMessages = [];
  }
}
