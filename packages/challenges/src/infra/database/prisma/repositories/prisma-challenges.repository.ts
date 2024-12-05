import { PaginationParams } from '@/core/repositories/pagination-params';
import { ChallengesRepository } from '@/domain/application/repositories/challenges.repository';
import { Challenge } from '@/domain/enterprise/entities/Challenge';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { PrismaChallengesMapper } from '../mappers/prisma-challenges.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaChallengesRepository implements ChallengesRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findById(id: string): Promise<Challenge | null> {
    const challenge = await this.prisma.challenge.findUnique({
      where: {
        id,
      },
    });

    if (!challenge) {
      return null;
    }

    return PrismaChallengesMapper.toDomain(challenge);
  }
  async findByTitle(title: string): Promise<Challenge | null> {
    const challenge = await this.prisma.challenge.findFirst({
      where: {
        title,
      },
    });

    if (!challenge) {
      return null;
    }

    return PrismaChallengesMapper.toDomain(challenge);
  }
  async findManyByTitleOrDescription(
    titleOrDescription?: string,
    params?: PaginationParams,
  ): Promise<{ challenges: Challenge[]; total: number; page: number; itemsPerPage: number }> {
    const page = params?.page || 1;
    const itemsPerPage = params?.itemsPerPage || 10;
    const skip = (page - 1) * itemsPerPage;
    const take = itemsPerPage;

    const where: Prisma.ChallengeWhereInput = {};

    if (titleOrDescription) {
      where.OR = [
        {
          title: {
            contains: titleOrDescription,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: titleOrDescription,
            mode: 'insensitive',
          },
        },
      ];
    }

    const challenges = await this.prisma.challenge.findMany({
      where,
      skip,
      take,
    });

    return {
      challenges: challenges.map(PrismaChallengesMapper.toDomain),
      total: challenges.length,
      page,
      itemsPerPage,
    };
  }
  async create(challenge: Challenge): Promise<Challenge> {
    const prismaChallenge = await this.prisma.challenge.create({
      data: PrismaChallengesMapper.toPrisma(challenge),
    });

    return PrismaChallengesMapper.toDomain(prismaChallenge);
  }
  async update(challenge: Challenge): Promise<Challenge> {
    const prismaChallenge = PrismaChallengesMapper.toPrisma(challenge);

    const updatedChallenge = await this.prisma.challenge.update({
      where: {
        id: prismaChallenge.id,
      },
      data: prismaChallenge,
    });

    return PrismaChallengesMapper.toDomain(updatedChallenge);
  }
  async deleteById(id: string): Promise<void> {
    await this.prisma.challenge.delete({
      where: {
        id,
      },
    });
  }
}
