import { AnswerFilters } from '@/core/repositories/answer-filters';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswersRepository } from '@/domain/application/repositories/answers.repository';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { PrismaService } from '../prisma.service';
import { Injectable } from '@nestjs/common';
import { PrismaAnswersMapper } from '../mappers/prisma-answers.mapper';

import { Prisma } from '@prisma/client';
import { ANSWER_STATUS } from '@/core/consts/answer-status';

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

  async findByRepositoryUrl(repositoryUrl: string): Promise<Answer | null> {
    const repositoryAlreadyExists = await this.prisma.answer.findUnique({
      where: {
        repositoryUrl,
      },
    });

    if (!repositoryAlreadyExists) return null;

    return PrismaAnswersMapper.toDomain(repositoryAlreadyExists);
  }

  async findManyByFilters(
    filters: AnswerFilters,
    params: PaginationParams,
  ): Promise<{ answers: Answer[]; total: number; page: number; itemsPerPage: number }> {
    const page = params?.page || 1;
    const itemsPerPage = params?.itemsPerPage || 10;
    const skip = (page - 1) * itemsPerPage;
    const take = itemsPerPage;

    const where: Prisma.AnswerWhereInput = {};

    if (filters.challengeId) {
      where.challengeId = filters.challengeId;
    }

    if (filters.status) {
      where.status = filters.status.toString() as Prisma.EnumAnswerStatusFilter;
    }

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate).toISOString();
      // UTC to convert to UTC timezone and correct time zone adrift
      const endDate = new Date(
        Date.UTC(
          filters.endDate.getFullYear(),
          filters.endDate.getMonth(),
          filters.endDate.getDate() + 1,
          23,
          59,
          59,
        ),
      ).toISOString();

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    } else if (filters.startDate) {
      const startDate = new Date(filters.startDate).toISOString();
      where.createdAt = {
        gte: startDate,
      };
    } else if (filters.endDate) {
      const endDate = new Date(filters.endDate).toISOString();
      where.createdAt = {
        lte: endDate,
      };
    }

    const [answers, totalRows] = await Promise.all([
      this.prisma.answer.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take,
        skip,
        include: {
          challenge: { select: { id: true } },
        },
      }),
      this.prisma.answer.count({ where }),
    ]);

    return {
      answers: answers.map(PrismaAnswersMapper.toDomain),
      total: totalRows,
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

  async updateMessageStatus(id: string, status: ANSWER_STATUS): Promise<void> {
    await this.prisma.answer.update({
      where: { id },
      data: { status },
    });
  }

  async updateAnswerDetails(answer: Answer): Promise<void> {
    const toPrismaAnswer = PrismaAnswersMapper.toPrisma(answer);

    await this.prisma.answer.update({
      where: { id: toPrismaAnswer.id },
      data: toPrismaAnswer,
    });
  }
}
