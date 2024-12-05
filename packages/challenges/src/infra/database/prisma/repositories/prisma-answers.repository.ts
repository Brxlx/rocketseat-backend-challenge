import { AnswerFilters } from '@/core/repositories/answer-filters';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswersRepository } from '@/domain/application/repositories/answers.repository';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { PrismaAnswersMapper } from '../mappers/prisma-answers.mapper';

import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {
  constructor(private prisma: PrismaService) {}
  async findById(id: string): Promise<Answer | null> {
    const answer = await this.prisma.answer.findUnique({
      where: {
        id,
      },
    });

    if (!answer) return null;

    return PrismaAnswersMapper.toDomain(answer);
  }

  async findManyByFilters(
    filters: AnswerFilters,
    params: PaginationParams,
  ): Promise<{ answers: Answer[]; total: number; page: number; itemsPerPage: number }> {
    const page = params?.page || 1;
    const itemsPerPage = params?.itemsPerPage || 10;
    const skip = (page - 1) * itemsPerPage;
    const take = itemsPerPage;

    const answers = await this.prisma.answer.findMany({
      where: {
        ...(filters.challengeId && {
          challengeId: filters.challengeId,
        }),
        ...(filters.status && {
          status: filters.status.toString() as Prisma.EnumAnswerStatusFilter,
        }),
        ...(filters.startDate && {
          startDate: filters.startDate,
        }),
        ...(filters.endDate && {
          endDate: filters.endDate,
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    });

    return {
      answers: answers.map(PrismaAnswersMapper.toDomain),
      total: answers.length,
      page,
      itemsPerPage,
    };
  }

  async create(answer: Answer): Promise<Answer> {
    const toPrismaAnswer = PrismaAnswersMapper.toPrisma(answer);

    const newAnswer = await this.prisma.answer.create({
      data: toPrismaAnswer,
    });

    return PrismaAnswersMapper.toDomain(newAnswer);
  }
}
