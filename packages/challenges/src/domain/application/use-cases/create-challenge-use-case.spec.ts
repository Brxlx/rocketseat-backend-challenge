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
  });
});
