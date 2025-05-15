import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ChallengeFactory } from 'test/factories/make-challenge.factory';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { TestMessagingModule } from 'test/Messaging/test-messaging.module';
import { ClientKafka } from '@nestjs/microservices';
import { LoadTestService } from 'test/load/load-test.service';
import { TestKafkaMessagingProducer } from 'test/Messaging/test-messaging-producer';
import { EnvModule } from '@/infra/env/env.module';
import { AppModule } from '@/infra/app.module';
import { LoadTestConfig } from './load-test.types';

/**
 * Load test suite
 * @!IMPORTANT - This test suite is for load testing only.
 * @!!IMPORTANT - Run corrections app first.
 */

suite('[Load Test]', () => {
  const TIMEOUT = 60000;
  describe('[Answer] Submit Answer Load Test', () => {
    let app: INestApplication;
    let challengeFactory: ChallengeFactory;
    let prisma: PrismaService;
    let kafkaClient: ClientKafka;
    let messagingProducer: TestKafkaMessagingProducer;
    let loadTestService: LoadTestService;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule, EnvModule, DatabaseModule, TestMessagingModule],
        providers: [ChallengeFactory, LoadTestService],
      }).compile();

      app = moduleRef.createNestApplication();

      loadTestService = moduleRef.get(LoadTestService);

      challengeFactory = moduleRef.get(ChallengeFactory);
      prisma = moduleRef.get(PrismaService);
      messagingProducer = moduleRef.get(TestKafkaMessagingProducer);
      kafkaClient = moduleRef.get('KAFKA_SERVICE');

      loadTestService.setApp(app);

      await app.init();
      await kafkaClient.connect();

      await prisma.$queryRaw`SELECT 1`;
    });
    beforeEach(() => {
      messagingProducer.clearMessages();
    });

    afterAll(async () => {
      await kafkaClient.close();
      await app.close();
    });
    it(
      'should process multiple submissions under load',
      async () => {
        const challenge = await challengeFactory.makePrismaChallenge({
          title: `Load Test Challenge ${Date.now()}`,
          description: 'Test Description',
        });

        const config: LoadTestConfig = {
          parallelMessages: 10,
          batchSize: 10,
          numOfBatches: 10,
          maxAttempts: 1,
          pollInterval: 500,
          delayBetweenMessages: 50,
        };

        const results = await loadTestService.executeLoadTest(challenge, config);

        expect(results.totalSubmissions).toBe(config.batchSize * config.numOfBatches);
        expect(results.successRate).not.toBe('0.00%');
        expect(results.averageProcessingTime).toBeLessThan(TIMEOUT);
        expect(results.failedSubmissions).toBeLessThan(results.totalSubmissions);
      },
      TIMEOUT,
    );
  });
});
