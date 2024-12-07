import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { ChallengeFactory } from 'test/factories/make-challenge.factory';
import { AnswerFactory } from 'test/factories/make-answer.factory';

suite('[Answer] (E2E)', () => {
  describe('Submit answer', () => {
    let app: INestApplication;
    let challengeFactory: ChallengeFactory;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule, DatabaseModule],
        providers: [ChallengeFactory, AnswerFactory],
      }).compile();

      app = moduleRef.createNestApplication();
      challengeFactory = moduleRef.get(ChallengeFactory);

      await app.init();
    });

    test('Submit Answers Mutation', async () => {
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
      expect(response.body.data.submitAnswer.status).toEqual('DONE');
    });
  });
});
