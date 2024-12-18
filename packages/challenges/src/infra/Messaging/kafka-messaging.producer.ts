import { Producer } from '@/domain/application/gateways/Messaging/producer';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '../database/prisma/prisma.service';
import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { Observable, of, timer } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { CorrectLessonResponse, MessagePayload } from './types/message.types';

@Injectable()
export class KafkaMessagingProducer implements Producer, OnModuleInit, OnModuleDestroy {
  private readonly MAX_RETRIES = 3;
  private readonly BASE_TIMEOUT = 30000; // 30 seconds

  private logger: Logger = new Logger(KafkaMessagingProducer.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    try {
      // await this.kafkaClient.connect();
      this.kafkaClient.subscribeToResponseOf('challenge.correction');
    } catch (error: any) {
      this.logger.error('Failed to connect to Kafka:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
  }

  async produce(topic: string, message: Answer): Promise<Answer> {
    const messageToSend: MessagePayload = {
      value: {
        submissionId: message.id.toString(),
        repositoryUrl: message.repositoryUrl,
      },
    };

    try {
      // Store message in DB
      await this.storeMessageInDB(message);

      // Sends the message asynchronously
      this.sendMessageToKafka(topic, messageToSend).subscribe({
        next: async (response) => {
          if (response) {
            const { grade, status }: CorrectLessonResponse = response;
            await this.processSuccessResponse(message, grade, status);
            this.logger.log('Message sent:', JSON.stringify(message));
          } else {
            await this.handleMessageSendingFailure(message);
          }
        },
        error: async (error) => {
          this.logger.error('Failed to send message to topic:', error);
          await this.handleMessageSendingFailure(message);
        },
      });

      // Returns immediately to avoid blocking the API
      return message;
    } catch (error: any) {
      this.logger.error('Error in produce method:', error.message);
      await this.handleMessageSendingFailure(message);
      return message;
    }
  }

  private sendMessageToKafka(
    topic: string,
    message: MessagePayload,
  ): Observable<CorrectLessonResponse | null> {
    try {
      return this.kafkaClient
        .send<CorrectLessonResponse, { value: MessagePayload }>(topic, { value: message })
        .pipe(
          timeout(this.BASE_TIMEOUT),
          retry({
            count: this.MAX_RETRIES,
            delay: (error, retryCount) => {
              // Calculates exponential delay time
              const delay_ms = this.BASE_TIMEOUT * Math.pow(2, retryCount);

              this.logger.warn(
                `Attempt ${retryCount}: Retry in ${delay_ms}ms due to: ${error.message}`,
              );

              return timer(delay_ms);
            },
          }),
          catchError((error) => {
            this.logger.error('Kafka sending error after retries:', error.message);
            return of(null);
          }),
        );
    } catch (error: any) {
      this.logger.error('Unexpected error in sendMessageToKafka:', error.message);
      return of(null);
    }
  }

  // TODO: use repository methods
  private async storeMessageInDB(message: Answer) {
    await this.prisma.answer.update({
      where: { id: message.id.toString() },
      data: {
        status: ANSWER_STATUS.PENDING,
      },
    });
  }

  // TODO: use repository methods
  private async processSuccessResponse(message: Answer, grade: number, status: string) {
    const transformedStatus = this.tranformStatus(status);

    await this.prisma.answer.update({
      where: { id: message.id.toString() },
      data: {
        grade,
        status: transformedStatus,
      },
    });

    message.grade = grade;
    message.status = transformedStatus;
  }

  // TODO: use repository methods
  private async handleMessageSendingFailure(message: Answer) {
    await this.prisma.answer.update({
      where: { id: message.id.toString() },
      data: {
        status: ANSWER_STATUS.ERROR,
      },
    });
  }

  private tranformStatus(status: string) {
    switch (status) {
      case 'Pending':
        return ANSWER_STATUS.PENDING;
      case 'Done':
        return ANSWER_STATUS.DONE;
      case 'Error':
        return ANSWER_STATUS.ERROR;
      default:
        return ANSWER_STATUS.PENDING;
    }
  }
}
