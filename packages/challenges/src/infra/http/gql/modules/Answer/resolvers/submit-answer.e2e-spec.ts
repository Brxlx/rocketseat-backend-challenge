import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { ChallengeFactory } from 'test/factories/make-challenge.factory';
import { AnswerFactory } from 'test/factories/make-answer.factory';
import { LoadTester } from 'test/e2e/load-tester';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { BatchConfig } from 'test/e2e/types';

suite('[Answer] (E2E)', () => {
  describe('Submit answer', () => {
    let app: INestApplication;
    let challengeFactory: ChallengeFactory;
    let loadTester: LoadTester;
    let kafkaService: ClientKafka;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule, DatabaseModule],
        providers: [ChallengeFactory, AnswerFactory],
      })
        // .overrideProvider('KAFKA_SERVICE')
        // .useValue({
        //   connect: vi.fn(),
        //   emit: vi.fn().mockReturnValue({
        //     pipe: vi.fn(),
        //     toPromise: vi.fn().mockResolvedValue(true),
        //   }),
        //   send: vi.fn().mockReturnValue({
        //     pipe: vi.fn(),
        //     toPromise: vi.fn().mockResolvedValue(true),
        //   }),
        //   close: vi.fn(),
        //   onModuleInit: vi.fn(),
        //   onModuleDestroy: vi.fn(),
        // })
        .compile();

      app = moduleRef.createNestApplication();
      challengeFactory = moduleRef.get(ChallengeFactory);
      kafkaService = app.get('KAFKA_SERVICE');

      await app.init();
      await kafkaService.connect();
    });

    afterAll(async () => {
      await kafkaService.close();
      await app.close();
    });

    test.skip('Submit Answers Mutation', async () => {
      const challenge = await challengeFactory.makePrismaChallenge({
        title: 'Desafio Teste 01',
        description: 'Desafio Teste',
      });

      const response = await request(app.getHttpServer())
        .post('/gql')
        .send({
          query: `
            mutation SubmitAnswer($submitAnswerInput: SubmitAnswerInput!) {
              submitAnswer(submitAnswerInput: $submitAnswerInput) {
                id
                challengeId
                repositoryUrl
                status
                grade
                createdAt
              }
            }`,
          variables: {
            submitAnswerInput: {
              challengeId: challenge.id.toString(),
              repositoryUrl: 'https://github.com/usr/repo-04',
            },
          },
        });

      console.log(response.body.data);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.submitAnswer).toBeTruthy();
      expect(response.body.data.submitAnswer.challengeId).toEqual(challenge.id.toString());
      expect(response.body.data.submitAnswer.status).toEqual('PENDING');
    });

    test('Should handle multiple answer submissions in batches', async () => {
      // Criar desafio para teste
      const challenge = await challengeFactory.makePrismaChallenge({
        title: 'Desafio Load Test',
        description: 'Desafio para teste de carga',
      });

      loadTester = new LoadTester(app, challenge.id.toString());

      const config: BatchConfig = {
        totalMessages: 10, // Total de mensagens
        batchSize: 10, // Tamanho do batch
        delayBetweenBatches: 500, // 1 segundo entre batches
        concurrentRequests: 5, // Máximo de requisições concorrentes
      };

      const metrics = await loadTester.runTest(config);
      await new Promise((resolve) => setTimeout(resolve, config.delayBetweenBatches));

      // Verify final status of submissions
      const prisma = app.get(PrismaService);
      const answers = await prisma.answer.findMany({
        where: { challengeId: challenge.id.toString(), status: ANSWER_STATUS.DONE },
      });

      console.log(
        'Final answer statuses:',
        answers.map((a) => ({ id: a.id, status: a.status })),
      );

      // Logs dos resultados
      console.log('Métricas do teste:');
      console.log(`Tempo total: ${metrics.totalTime}ms`);
      console.log(`Requisições com sucesso: ${metrics.successfulRequests}`);
      console.log(`Requisições com falha: ${metrics.failedRequests}`);
      console.log(`Tempo médio de resposta: ${metrics.averageResponseTime}ms`);

      // Asserções básicas
      expect(answers.length).toEqual(metrics.successfulRequests);
      expect(metrics.successfulRequests).toBeGreaterThan(0);
      expect(metrics.failedRequests).toBeLessThan(config.totalMessages * 0.15); // Máximo 15% de falhas
    }, 300000); // 5 minutos de timeout
  });
});
