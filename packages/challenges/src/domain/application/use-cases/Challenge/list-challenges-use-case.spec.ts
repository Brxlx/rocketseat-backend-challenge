import { InMemoryChallengesRepository } from 'test/repositories/in-memory-challenges.repository';
import { ListChallengesUseCase } from './list-challenges-use-case';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeChallenge } from 'test/factories/make-challenge.factory';

let inMemoryChallengesRepository: InMemoryChallengesRepository;
let sut: ListChallengesUseCase; // system under test
suite('[Challenge]', () => {
  describe('List Challenges', () => {
    beforeEach(() => {
      inMemoryChallengesRepository = new InMemoryChallengesRepository();
      sut = new ListChallengesUseCase(inMemoryChallengesRepository);
    });
    it('should be able to list recent challenges', async () => {
      const challenge1 = await makeChallenge(
        {
          title: 'Desafio 01',
          description: 'Descrição do desafio 01',
        },
        new UniqueEntityID('challenge-01'),
      );

      const challenge2 = await makeChallenge({
        title: 'Desafio Node',
        description: 'Desafio de Node',
      });

      await inMemoryChallengesRepository.create(challenge1);
      await inMemoryChallengesRepository.create(challenge2);

      const { challenges } = await sut.execute({
        titleOrDescription: 'desafio',
        params: { page: 1, itemsPerPage: 10 },
      });

      expect(inMemoryChallengesRepository.items).toHaveLength(2);
      expect(challenges.length).toEqual(2);
    });

    it('should be able to fetch paginated answers from challenges', async () => {
      for (let i = 1; i <= 15; i++) {
        await inMemoryChallengesRepository.create(
          await makeChallenge({ description: `desafio ${i}` }),
        );
      }

      const { challenges } = await sut.execute({
        titleOrDescription: 'desafio',
        params: { page: 1, itemsPerPage: 15 },
      });

      expect(challenges.length).toBe(15);
    });
  });
});
