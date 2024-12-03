import { ANSWER_STATUS } from '@/core/consts';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Answer, AnswerProps } from '@/domain/enterprise/entities/Answer';
import { faker } from '@faker-js/faker/locale/pt_BR';

export async function makeAnswer(override: Partial<AnswerProps> = {}, id?: UniqueEntityID) {
  return Answer.create(
    {
      challengeId: override.challengeId ?? new UniqueEntityID(),
      repositoryUrl: `https://github.com/${faker.internet.username()}/${faker.lorem.slug()}`,
      status: override.status ?? ANSWER_STATUS.PENDING,
      grade: override.grade ?? faker.number.int({ min: 0, max: 10 }),
      ...override,
    },
    id,
  );
}
