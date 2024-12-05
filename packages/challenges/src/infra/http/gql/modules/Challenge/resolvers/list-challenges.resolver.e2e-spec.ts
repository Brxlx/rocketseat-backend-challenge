import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ChallengeFactory } from 'test/factories/make-challenge.factory';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

suite('[Challenge] (E2E)', () => {
  describe('List challenge', () => {
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

    test('List Challenges Query', async () => {
      await Promise.all([
        challengeFactory.makePrismaChallenge({
          title: 'Desafio Teste 1',
          description: 'Desafio Teste',
        }),
        challengeFactory.makePrismaChallenge({
          title: 'Desafio Teste 2',
          description: 'Desafio Teste',
        }),
      ]);

      const response = await request(app.getHttpServer())
        .post('/gql')
        .send({
          query: `
            query ListChallenges($listChallengesFiltersInput: ListChallengesFiltersInput!) {
              listChallenges(listChallengesFiltersInput: $listChallengesFiltersInput) {
                challenges {
                  id
                  title
                  description
                  createdAt
                }
                total
                page
                itemsPerPage
              }
            }`,
          variables: {
            listChallengesFiltersInput: {
              page: 1,
              itemsPerPage: 1,
            },
          },
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.listChallenges.challenges).toBeTruthy();
      expect(response.body.data.listChallenges.page).toBe(1);
      expect(response.body.data.listChallenges.itemsPerPage).toBe(1);
      expect(response.body.data.listChallenges.total).toBe(2);
    });
  });
});
