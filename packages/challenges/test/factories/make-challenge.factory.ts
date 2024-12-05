import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Challenge, ChallengeProps } from '@/domain/enterprise/entities/Challenge';
import { PrismaChallengesMapper } from '@/infra/database/prisma/mappers/prisma-challenges.mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Injectable } from '@nestjs/common';

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

@Injectable()
export class ChallengeFactory {
  constructor(private readonly prisma: PrismaService) {}

  public async makePrismaChallenge(data: Partial<ChallengeProps> = {}, id?: UniqueEntityID) {
    const challenge = await makeChallenge(data, id);
    console.log(challenge);

    await this.prisma.challenge.create({
      data: PrismaChallengesMapper.toPrisma(challenge),
    });

    return challenge;
  }
}
