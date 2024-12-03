import { InMemoryChallengesRepository } from 'test/repositories/in-memory-challenges.repository';
import { SubmitAnswerUseCase } from './submit-answer-use-case';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

import { makeAnswer } from 'test/factories/make-answer.factory';
import { makeChallenge } from 'test/factories/make-challenge.factory';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers.repository';
import { ANSWER_STATUS } from '@/core/consts';

let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryChallengesRepository: InMemoryChallengesRepository;
let sut: SubmitAnswerUseCase; // system under test
suite('[Answer]', () => {
  describe('Submit Answer', () => {
    beforeEach(() => {
      inMemoryAnswersRepository = new InMemoryAnswersRepository();
      inMemoryChallengesRepository = new InMemoryChallengesRepository();
      sut = new SubmitAnswerUseCase(inMemoryAnswersRepository, inMemoryChallengesRepository);
    });
    it('should be able to create a new answer submission', async () => {
      const newChallenge = await makeChallenge(
        {
          title: 'Desafio Teste',
          description: 'Desafio Teste',
        },
        new UniqueEntityID('challenge-1'),
      );

      await inMemoryChallengesRepository.create(newChallenge);
      const newAnswer = await makeAnswer({ challengeId: newChallenge.id });

      // await inMemoryAnswersRepository.create(newAnswer);

      const result = await sut.execute({
        challengeId: newAnswer.challengeId.toString(),
        repositoryUrl: newAnswer.repositoryUrl,
        grade: newAnswer.grade,
        status: newAnswer.status,
      });

      expect(result).toBeTruthy();
      expect(newAnswer.id).toBeInstanceOf(UniqueEntityID);
      expect(newAnswer.id.isValid()).toBeTruthy();
      expect(result).toEqual({
        answer: inMemoryAnswersRepository.items[0],
      });
      expect(result.answer.id.toString()).toEqual(inMemoryAnswersRepository.items[0].id.toString());
      expect(result.answer.status).toEqual(ANSWER_STATUS.PENDING);
    });

    it('should not be able to create an answer submission with invalid challenge id', async () => {
      const newChallenge = await makeChallenge(
        {
          title: 'Desafio Teste',
          description: 'Desafio Teste',
        },
        new UniqueEntityID('challenge-1'),
      );

      await inMemoryChallengesRepository.create(newChallenge);

      const answer1 = await makeAnswer({ challengeId: new UniqueEntityID('another-challenge-id') });

      await expect(async () => {
        await sut.execute({
          challengeId: answer1.challengeId.toString(),
          repositoryUrl: answer1.repositoryUrl,
          grade: answer1.grade,
          status: answer1.status,
        });
      }).rejects.toThrowError('Challenge not found');
    });
  });
});
