import { InMemoryChallengesRepository } from 'test/repositories/in-memory-challenges.repository';
import { DeleteChallengeUseCase } from './delete-challenge-use-case';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeChallenge } from 'test/factories/make-challenge.factory';

let inMemoryChallengesRepository: InMemoryChallengesRepository;
let sut: DeleteChallengeUseCase; // system under test
suite('[Challenge]', () => {
  describe('Delete Challenge', () => {
    beforeEach(() => {
      inMemoryChallengesRepository = new InMemoryChallengesRepository();
      sut = new DeleteChallengeUseCase(inMemoryChallengesRepository);
    });
    it('should be able to delete a challenge', async () => {
      const newChallenge = await makeChallenge(
        {
          title: 'Desafio 01',
          description: 'Descrição do desafio 01',
        },
        new UniqueEntityID('challenge-01'),
      );
      await inMemoryChallengesRepository.create(newChallenge);

      await sut.execute({ id: newChallenge.id.toString() });

      expect(inMemoryChallengesRepository.items).toHaveLength(0);
      expect(inMemoryChallengesRepository.items).toHaveLength(0);
    });

    it('should not be able to delete a challenge with invalid id', async () => {
      const order1 = await makeChallenge(
        {
          title: 'Desafio 01',
          description: 'Descrição do desafio 01',
        },
        new UniqueEntityID('challenge-01'),
      );

      await inMemoryChallengesRepository.create(order1);

      await expect(async () => {
        await sut.execute({ id: 'another-id' });
      }).rejects.toThrowError('Challenge not found');
    });
  });
});
