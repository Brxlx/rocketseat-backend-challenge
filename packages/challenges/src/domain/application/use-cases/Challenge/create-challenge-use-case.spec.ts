import { InMemoryChallengesRepository } from 'test/repositories/in-memory-challenges.repository';
import { CreateChallengeUseCase } from './create-challenge-use-case';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeChallenge } from 'test/factories/make-challenge.factory';

let inMemoryChallengesRepository: InMemoryChallengesRepository;
let sut: CreateChallengeUseCase; // system under test
suite('[Challenge]', () => {
  describe('Create Challenge', () => {
    beforeEach(() => {
      inMemoryChallengesRepository = new InMemoryChallengesRepository();
      sut = new CreateChallengeUseCase(inMemoryChallengesRepository);
    });
    it('should be able to create a new challenge', async () => {
      const newOrder = await makeChallenge({
        title: 'Desafio 01',
        description: 'Descrição do desafio 01',
      });

      const result = await sut.execute(newOrder);

      expect(result).toBeTruthy();
      expect(newOrder.id).toBeInstanceOf(UniqueEntityID);
      expect(newOrder.id.isValid()).toBeTruthy();
      expect(result).toEqual({
        challenge: inMemoryChallengesRepository.items[0],
      });
      expect(result.challenge.id.toString()).toEqual(
        inMemoryChallengesRepository.items[0].id.toString(),
      );
    });

    it('should not be able to create a new challenge with same title', async () => {
      const order1 = await makeChallenge({
        title: 'Desafio 01',
        description: 'Descrição do desafio 01',
      });

      const order2 = await makeChallenge({
        title: 'Desafio 01',
        description: 'Descrição do desafio 02',
      });

      await sut.execute(order1);

      await expect(async () => {
        await sut.execute(order2);
      }).rejects.toThrowError('Title already exists');
    });
  });
});
