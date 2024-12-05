import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { ChallengeFactory } from 'test/factories/make-challenge.factory';
import { AnswerFactory } from 'test/factories/make-answer.factory';

suite('[Answer] (E2E)', () => {
  describe('List answer', () => {
    let app: INestApplication;
    let answerFactory: AnswerFactory;
    let challengeFactory: ChallengeFactory;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule, DatabaseModule],
        providers: [ChallengeFactory, AnswerFactory],
      }).compile();

      app = moduleRef.createNestApplication();
      challengeFactory = moduleRef.get(ChallengeFactory);
      answerFactory = moduleRef.get(AnswerFactory);

      await app.init();
    });

    test('List Answers Query', async () => {
      const challenge = await challengeFactory.makePrismaChallenge({
        title: 'Desafio Teste 01',
        description: 'Desafio Teste',
      });

      await Promise.all([
        answerFactory.makePrismaAnswer({
          challengeId: challenge.id,
          repositoryUrl: 'https://github.com/user/answer-01',
        }),
        answerFactory.makePrismaAnswer({
          challengeId: challenge.id,
          repositoryUrl: 'https://github.com/user/answer-02',
        }),
      ]);

      const response = await request(app.getHttpServer())
        .post('/gql')
        .send({
          query: `
            query ListAnswers($listAnswesInput: ListAnswersInput!) {
            listAnswers(listAnswesInput: $listAnswesInput) {
              answers {
                id
                challengeId
                repositoryUrl
                grade
                status
                createdAt
              }
              total
              page
              itemsPerPage
            }
          }`,
          variables: {
            listAnswesInput: {
              filters: {},
              params: {
                page: 1,
                itemsPerPage: 1,
              },
            },
          },
        });

      console.log(response.body.data);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.listAnswers.answers).toBeTruthy();
      expect(response.body.data.listAnswers.page).toBe(1);
      expect(response.body.data.listAnswers.itemsPerPage).toBe(1);
      expect(response.body.data.listAnswers.total).toBe(2);
    });
  });
});
