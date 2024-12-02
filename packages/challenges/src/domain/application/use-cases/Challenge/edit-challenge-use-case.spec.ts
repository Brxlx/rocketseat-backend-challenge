import { InMemoryChallengesRepository } from 'test/repositories/in-memory-challenges.repository';
import { EditChallengeUseCase } from './edit-challenge-use-case';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeChallenge } from 'test/factories/make-challenge.factory';

let inMemoryChallengesRepository: InMemoryChallengesRepository;
let sut: EditChallengeUseCase; // system under test
suite('[Challenge]', () => {
  describe('Edit Challenge', () => {
    beforeEach(() => {
      inMemoryChallengesRepository = new InMemoryChallengesRepository();
      sut = new EditChallengeUseCase(inMemoryChallengesRepository);
    });
    it('should be able to edit a challenge', async () => {
      const newChallenge = await makeChallenge(
        {
          title: 'Desafio 01',
          description: 'Descrição do desafio 01',
        },
        new UniqueEntityID('challenge-01'),
      );

      await inMemoryChallengesRepository.create(newChallenge);

      const { challenge } = await sut.execute({
        id: newChallenge.id.toString(),
        description: 'Updated Description',
      });

      expect(inMemoryChallengesRepository.items).toHaveLength(1);
      expect(challenge.id.toString()).toEqual(newChallenge.id.toString());
      expect(challenge.description).toEqual(inMemoryChallengesRepository.items[0].description);
    });

    it('should not be able to edit a challenge with invalid id', async () => {
      const challenge = await makeChallenge(
        {
          title: 'Desafio 01',
          description: 'Descrição do desafio 01',
        },
        new UniqueEntityID('challenge-01'),
      );

      await inMemoryChallengesRepository.create(challenge);

      await expect(async () => {
        await sut.execute({ id: 'another-id', description: challenge.description });
      }).rejects.toThrowError('Challenge not found');
    });
  });
});
