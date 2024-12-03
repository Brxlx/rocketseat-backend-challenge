import { PaginationParams } from '@/core/repositories/pagination-params';
import { ChallengesRepository } from '@/domain/application/repositories/challenges.repository';
import { Challenge } from '@/domain/enterprise/entities/Challenge';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { PrismaChallengesMapper } from '../mappers/prisma-challenges.mapper';

@Injectable()
export class PrismaChallengesRepository implements ChallengesRepository {
  constructor(private readonly prisma: PrismaService) {}
  findById(id: string): Promise<Challenge | null> {
    throw new Error('Method not implemented.');
  }
  findByTitle(title: string): Promise<Challenge | null> {
    throw new Error('Method not implemented.');
  }
  findManyByTitleOrDescription(
    titleOrDescription: string,
    params: PaginationParams,
  ): Promise<Challenge[]> {
    throw new Error('Method not implemented.');
  }
  async create(challenge: Challenge): Promise<Challenge> {
    const prismaChallenge = await this.prisma.challenge.create({
      data: PrismaChallengesMapper.toPrisma(challenge),
    });

    return PrismaChallengesMapper.toDomain(prismaChallenge);
  }
  update(challenge: Challenge): Promise<Challenge> {
    throw new Error('Method not implemented.');
  }
  deleteById(challenge: Challenge): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
