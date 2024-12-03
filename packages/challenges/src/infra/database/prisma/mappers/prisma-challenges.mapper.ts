import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Challenge } from '@/domain/enterprise/entities/Challenge';
import { Prisma, Challenge as PrismaChallenge } from '@prisma/client';

export class PrismaChallengesMapper {
  static toDomain(raw: PrismaChallenge): Challenge {
    return Challenge.create(
      {
        title: raw.title,
        description: raw.description,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(challenge: Challenge): Prisma.ChallengeUncheckedCreateInput {
    return {
      id: challenge.id.toString(),
      title: challenge.title,
      description: challenge.description,
      createdAt: challenge.createdAt,
    };
  }
}
