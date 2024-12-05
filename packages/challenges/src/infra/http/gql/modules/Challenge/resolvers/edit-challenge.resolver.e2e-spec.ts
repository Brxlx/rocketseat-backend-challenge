import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ChallengeFactory } from 'test/factories/make-challenge.factory';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

suite('[Challenge] (E2E)', () => {
  describe('Edit challenge', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let challengeFactory: ChallengeFactory;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule, DatabaseModule],
        providers: [ChallengeFactory],
      }).compile();

      app = moduleRef.createNestApplication();
      prisma = moduleRef.get(PrismaService);
      challengeFactory = moduleRef.get(ChallengeFactory);

      await app.init();
    });

    test('Edit Challenge Mutation', async () => {
      const challenge = await challengeFactory.makePrismaChallenge({
        title: 'Desafio Teste',
        description: 'Desafio Teste',
      });

      const response = await request(app.getHttpServer())
        .post('/gql')
        .send({
          query: `
            mutation UpdateChallenge($editChallengeInput: EditChallengeInput!) {
              updateChallenge(editChallengeInput: $editChallengeInput) {
                challenge {
                  id
                  title
                  description
                  createdAt
                }
              }
            }`,
          variables: {
            editChallengeInput: {
              id: challenge.id.toString(),
              description: 'Atualizada *',
            },
          },
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.updateChallenge.challenge).toBeTruthy();

      const challengeOnDB = await prisma.challenge.findFirst({ where: { title: challenge.title } });

      expect(challengeOnDB).toBeTruthy();
      expect(challengeOnDB?.title).toEqual(response.body.data.updateChallenge.challenge.title);
      expect(challengeOnDB?.description).toEqual(
        response.body.data.updateChallenge.challenge.description,
      );
    });
  });
});
