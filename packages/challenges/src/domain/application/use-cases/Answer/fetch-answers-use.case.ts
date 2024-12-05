import { Injectable } from '@nestjs/common';
import { AnswersRepository } from '../../repositories/answers.repository';
import { Answer } from '@/domain/enterprise/entities/Answer';
import { AnswerFilters } from '@/core/repositories/answer-filters';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { ChallengesRepository } from '../../repositories/challenges.repository';

interface FetchAnswersUseCaseRequest {
  filters?: AnswerFilters;
  params?: PaginationParams;
}

type FetchAnswersUseCaseResponse = {
  answers: Answer[];
  total: number;
  page: number;
  itemsPerPage: number;
};

@Injectable()
export class FetchAnswersUseCase {
  constructor(
    private readonly answersRepository: AnswersRepository,
    private readonly challengesRepository: ChallengesRepository,
  ) {}

  public async execute({
    filters,
    params: { page = 1, itemsPerPage = 10 } = {},
  }: FetchAnswersUseCaseRequest): Promise<FetchAnswersUseCaseResponse> {
    if (filters?.challengeId) await this.verifyChallengeId(filters.challengeId);

    const result = await this.answersRepository.findManyByFilters(filters ?? {}, {
      page,
      itemsPerPage,
    });

    return {
      answers: result.answers,
      total: result.total,
      page: result.page,
      itemsPerPage: result.itemsPerPage,
    };
  }

  private async verifyChallengeId(challengeId: string): Promise<boolean> {
    const verifiyChallengeId = await this.challengesRepository.findById(challengeId);

    if (!verifiyChallengeId) throw new Error('Challenge not found');

    return true;
  }
}
