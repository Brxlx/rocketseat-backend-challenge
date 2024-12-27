import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/infra/app.module';
import { ChallengeFactory } from 'test/factories/make-challenge.factory';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { DatabaseModule } from '@/infra/database/database.module';
import { TestKafkaMessagingProducer } from 'test/Messaging/test-messaging-producer';
import { TestMessagingModule } from 'test/Messaging/test-messaging.module';
import { ClientKafka } from '@nestjs/microservices';
import { Answer } from '../models/Answer';

/**
 * Utilitário para logs formatados nos testes
 * Utiliza recursos do Vitest para melhor visualização
 */
const testLogger = {
  group: (name: string) => {
    console.log('\n' + '━'.repeat(80));
    console.log(`🔍 ${name}`);
    console.log('━'.repeat(80));
  },

  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString().split('T')[1];
    console.log(`\n[${timestamp}] ℹ️ ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  },

  success: (message: string) => {
    console.log(`\n✅ ${message}`);
  },

  error: (message: string, error?: any) => {
    console.log(`\n❌ ${message}`);
    if (error) {
      console.error(error);
    }
  },
};

suite('[Answer] (E2E)', () => {
  describe('Submit Answer (E2E)', () => {
    let app: INestApplication;
    let challengeFactory: ChallengeFactory;
    let prisma: PrismaService;
    let kafkaClient: ClientKafka;
    let messagingProducer: TestKafkaMessagingProducer;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule, DatabaseModule, TestMessagingModule],
        providers: [ChallengeFactory],
      }).compile();

      app = moduleRef.createNestApplication();
      challengeFactory = moduleRef.get(ChallengeFactory);
      prisma = moduleRef.get(PrismaService);
      messagingProducer = moduleRef.get(TestKafkaMessagingProducer);
      kafkaClient = moduleRef.get('KAFKA_SERVICE');

      await app.init();
      await kafkaClient.connect();
    });

    beforeEach(() => {
      messagingProducer.clearMessages();
    });

    afterAll(async () => {
      await kafkaClient.close();
      await app.close();
    });

    it('should submit answer and confirm topic message delivery', async () => {
      const challenge = await challengeFactory.makePrismaChallenge({
        title: 'Test Challenge',
        description: 'Test Description',
      });

      const response = await request(app.getHttpServer())
        .post('/gql')
        .send({
          query: `
          mutation SubmitAnswer($input: SubmitAnswerInput!) {
            submitAnswer(submitAnswerInput: $input) {
              id
              challengeId
              status
            }
          }
        `,
          variables: {
            input: {
              challengeId: challenge.id.toString(),
              repositoryUrl: 'https://github.com/user/repo-test',
            },
          },
        });

      const answer = await prisma.answer.findFirst({
        where: {
          challengeId: challenge.id.toString(),
          status: ANSWER_STATUS.PENDING,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.data.submitAnswer).toBeTruthy();
      expect(answer).toBeTruthy();
      expect(answer?.status).toBe(ANSWER_STATUS.PENDING);
    });
    it.skip('should submit answer and wait for final processing status', async () => {
      const challenge = await challengeFactory.makePrismaChallenge({
        title: 'Test Challenge 2',
        description: 'Test Description',
      });

      const response = await request(app.getHttpServer())
        .post('/gql')
        .send({
          query: `
          mutation SubmitAnswer($input: SubmitAnswerInput!) {
            submitAnswer(submitAnswerInput: $input) {
              id
              challengeId
              status
            }
          }
        `,
          variables: {
            input: {
              challengeId: challenge.id.toString(),
              repositoryUrl: `https://github.com/user/repo-${Date.now()}`,
            },
          },
        });
      const answerId = response.body.data.submitAnswer.id;

      // Wait for status change (timeout after 5 seconds)
      const maxAttempts = 10;
      const delayBetweenAttempts = 500;
      let finalAnswer: Answer | null = null;

      for (let i = 0; i < maxAttempts; i++) {
        const answer = await prisma.answer.findUnique({
          where: { id: answerId },
        });

        if (answer?.status !== ANSWER_STATUS.PENDING) {
          finalAnswer = answer as unknown as Answer;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, delayBetweenAttempts));
      }

      console.log(finalAnswer);
      expect(response.status).toBe(200);
      expect(finalAnswer).toBeTruthy();
      expect(finalAnswer?.status).toMatch(/DONE|ERROR/);
    });

    it.only('should process multiple submissions and verify final status', async () => {
      const challenge = await challengeFactory.makePrismaChallenge({
        title: `Test Challenge ${Date.now()}`,
        description: 'Test Description',
      });

      const answerIds: string[] = [];

      // Submit 10 answers
      for (let i = 0; i < 10; i++) {
        const response = await request(app.getHttpServer())
          .post('/gql')
          .send({
            query: `
            mutation SubmitAnswer($input: SubmitAnswerInput!) {
              submitAnswer(submitAnswerInput: $input) {
                id
                challengeId
                status
              }
            }
          `,
            variables: {
              input: {
                challengeId: challenge.id.toString(),
                repositoryUrl: `https://github.com/user/repo-${Date.now()}-${i}`,
              },
            },
          });

        answerIds.push(response.body.data.submitAnswer.id);
      }

      // Wait for all messages to be processed
      const maxAttempts = 3;
      const delayBetweenAttempts = 500;
      const finalAnswers: Answer[] = [];

      for (const answerId of answerIds) {
        let processed = false;

        for (let i = 0; i < maxAttempts && !processed; i++) {
          const answer = await prisma.answer.findUnique({
            where: { id: answerId },
          });

          if (answer?.status !== ANSWER_STATUS.PENDING) {
            finalAnswers.push(answer as unknown as Answer);
            processed = true;
          } else {
            answer.status = ANSWER_STATUS.ERROR;
            await new Promise((resolve) => setTimeout(resolve, delayBetweenAttempts));
          }
        }
      }

      const sucessAnswers = finalAnswers.filter(
        (answer) => (answer.status as unknown as ANSWER_STATUS) === ANSWER_STATUS.DONE,
      );

      const errorAnswers = finalAnswers.filter(
        (answer) => (answer.status as unknown as ANSWER_STATUS) === ANSWER_STATUS.ERROR,
      );

      testLogger.group('*** Stats: ***');
      testLogger.log('Sucess answers: ', sucessAnswers.length);
      testLogger.log('Error answers: ', errorAnswers.length);

      expect(finalAnswers).toHaveLength(10);
      finalAnswers.forEach((answer) => {
        expect(answer.status).toMatch(/DONE|ERROR/);
        expect(answer.status).not.toBe(ANSWER_STATUS.PENDING);
      });
    }, 30000);
  });
});
