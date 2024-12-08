import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Answer, AnswerProps } from '@/domain/enterprise/entities/Answer';
import { PrismaAnswersMapper } from '@/infra/database/prisma/mappers/prisma-answers.mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Injectable } from '@nestjs/common';

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

@Injectable()
export class AnswerFactory {
  constructor(private readonly prisma: PrismaService) {}
  public async makePrismaAnswer(data: Partial<AnswerProps> = {}, id?: UniqueEntityID) {
    const answer = await makeAnswer(data, id);

    await this.prisma.answer.create({
      data: PrismaAnswersMapper.toPrisma(answer),
    });

    return answer;
  }
}
