import { InMemoryChallengesRepository } from 'test/repositories/in-memory-challenges.repository';
import { FetchAnswersUseCase } from './fetch-answers-use.case';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';

import { makeAnswer } from 'test/factories/make-answer.factory';
import { makeChallenge } from 'test/factories/make-challenge.factory';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers.repository';

let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryChallengesRepository: InMemoryChallengesRepository;
let sut: FetchAnswersUseCase; // system under test
suite('[Answer]', () => {
  describe('Fetch Answer', () => {
    beforeEach(() => {
      inMemoryAnswersRepository = new InMemoryAnswersRepository();
      inMemoryChallengesRepository = new InMemoryChallengesRepository();
      sut = new FetchAnswersUseCase(inMemoryAnswersRepository, inMemoryChallengesRepository);
    });
    it('should be able to fetch answers submissions for same challenge', async () => {
      const newChallenge = await makeChallenge(
        {
          title: 'Desafio 01',
          description: 'Desafio 01',
        },
        new UniqueEntityID('challenge-01'),
      );

      await inMemoryChallengesRepository.create(newChallenge);

      const answer1 = await makeAnswer({ challengeId: newChallenge.id });
      const answer2 = await makeAnswer({ challengeId: newChallenge.id });

      await inMemoryAnswersRepository.create(answer1);
      await inMemoryAnswersRepository.create(answer2);

      const result = await sut.execute({
        filters: {
          challengeId: newChallenge.id.toString(),
        },
        params: { page: 1 },
      });

      console.log('dados ->', result);

      expect(result).toBeTruthy();
      expect(result.answers).toHaveLength(2);
      expect(result.answers).toEqual([answer1, answer2]);
      expect(result.answers[0].challengeId.toString()).toEqual(newChallenge.id.toString());
    });
  });
});
