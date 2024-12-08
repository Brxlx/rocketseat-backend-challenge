import { Producer } from '@/domain/application/gateways/Messaging/producer';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../database/prisma/prisma.service';
import { ANSWER_STATUS } from '@/core/consts/answer-status';

interface CorrectLessonResponse {
  grade: number;
  status: string;
}

@Injectable()
export class KafkaMessagingProducer implements Producer, OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('challenge.correction');
    // await this.kafkaClient.connect();
  }

  async produce(topic: string, message: Answer) {
    try {
      const messageToSend = {
        value: {
          submissionId: message.id.toString(),
          repositoryUrl: message.repositoryUrl,
        },
      };
      console.log('Sending message topic', messageToSend);

      const { grade, status }: CorrectLessonResponse = await lastValueFrom(
        this.kafkaClient.send(topic, {
          value: messageToSend,
        }),
      );

      await this.updateAnswerOnDB(message.id.toString(), grade, this.tranformStatus(status));
      message.grade = grade;
      message.status = this.tranformStatus(status)!;

      return message;
    } catch (err: any) {
      console.log(`Error prodcucing message at topic ${topic}`, err);

      // Update answer status to error and finalize the process
      await this.prisma.answer.update({
        where: {
          id: message.id.toString(),
        },
        data: {
          status: ANSWER_STATUS.ERROR,
        },
      });
    }
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

  private async updateAnswerOnDB(submissionId: string, grade: number, status: ANSWER_STATUS) {
    await this.prisma.answer.update({
      where: {
        id: submissionId,
      },
      data: {
        grade,
        status,
      },
    });
  }
}
