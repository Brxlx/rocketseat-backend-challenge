import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ChallengeFactory, makeChallenge } from 'test/factories/make-challenge.factory';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

suite('[Challenge] (E2E)', () => {
  describe('Create challenge', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    // let challengeFactory: ChallengeFactory;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule, DatabaseModule],
        providers: [ChallengeFactory],
      }).compile();

      app = moduleRef.createNestApplication();
      prisma = moduleRef.get(PrismaService);
      // challengeFactory = moduleRef.get(ChallengeFactory);

      await app.init();
    });

    test('Create Challenge Mutation', async () => {
      const challenge = await makeChallenge({
        title: 'Desafio Teste',
        description: 'Desafio Teste',
      });

      const response = await request(app.getHttpServer())
        .post('/gql')
        .send({
          query: `
            mutation CreateChallenge($createChallengeInput: CreateChallengeInput!) {
             createChallenge(createChallengeInput: $createChallengeInput)
            }`,
          variables: {
            createChallengeInput: {
              title: challenge.title,
              description: challenge.description,
            },
          },
        });
      console.log('body', response.body);
      expect(response.statusCode).toBe(200);
      expect(response.body.data.createChallenge).toBeTruthy();

      const challengeOnDB = await prisma.challenge.findFirst({ where: { title: challenge.title } });

      expect(challengeOnDB).toBeTruthy();
      expect(challengeOnDB?.title).toEqual(challenge.title);
      expect(challengeOnDB?.description).toEqual(challenge.description);
    });
  });
});
