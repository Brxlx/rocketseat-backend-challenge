import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ChallengeFactory } from 'test/factories/make-challenge.factory';

import { AppModule } from '@/infra/app.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

suite('[Challenge] (E2E)', () => {
  describe('Delete challenge', () => {
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

    test('Delete Challenge Mutation', async () => {
      const challenge = await challengeFactory.makePrismaChallenge({
        title: 'Desafio Teste para deletar',
        description: 'Desafio Teste para deletar',
      });

      const response = await request(app.getHttpServer())
        .post('/gql')
        .send({
          query: `
           mutation DeleteChallenge($deleteInput: DeleteChallengeInput!) {
            deleteChallenge(deleteInput: $deleteInput)
          }`,
          variables: {
            deleteInput: {
              id: challenge.id.toString(),
            },
          },
        });

      console.log(response.body);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.deleteChallenge).toBeNull();

      const challengeOnDB = await prisma.challenge.findFirst({
        where: { id: challenge.id.toString() },
      });

      expect(challengeOnDB).toBeNull();
    });
  });
});
