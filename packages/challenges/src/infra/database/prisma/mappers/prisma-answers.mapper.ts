import { ANSWER_STATUS } from '@/core/consts';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { Prisma, Answer as PrismaAnswer, AnswerStatus as PrismaAnswerStatus } from '@prisma/client';

export class PrismaAnswersMapper {
  static toDomain(raw: PrismaAnswer): Answer {
    return Answer.create(
      {
        challengeId: new UniqueEntityID(raw.challengeId),
        repositoryUrl: raw.repositoryUrl,
        grade: raw.grade,
        status: raw.status as ANSWER_STATUS,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(answer: Answer): Prisma.AnswerUncheckedCreateInput {
    return {
      id: answer.id.toString(),
      challengeId: answer.challengeId.toString(),
      repositoryUrl: answer.repositoryUrl,
      grade: answer.grade,
      status: answer.status as unknown as PrismaAnswerStatus,
    };
  }
}
