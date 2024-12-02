import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Challenge, ChallengeProps } from '@/domain/enterprise/entities/Challenge';
import { faker } from '@faker-js/faker/locale/pt_BR';

export async function makeChallenge(override: Partial<ChallengeProps> = {}, id?: UniqueEntityID) {
  return Challenge.create(
    {
      title: faker.lorem.words({ min: 2, max: 4 }),
      description: faker.lorem.sentences({ min: 2, max: 5 }),
      ...override,
    },
    id,
  );
}
