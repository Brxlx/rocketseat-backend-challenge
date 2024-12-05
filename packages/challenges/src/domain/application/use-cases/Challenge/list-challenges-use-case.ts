import { Challenge } from '@/domain/enterprise/entities/Challenge';
import { Injectable } from '@nestjs/common';
import { ChallengesRepository } from '../../repositories/challenges.repository';
import { PaginationParams } from '@/core/repositories/pagination-params';

interface ListChallengeUseCaseRequest {
  titleOrDescription?: string;
  params?: PaginationParams;
}

type ListChallengeUseCaseResponse = {
  challenges: Challenge[];
  total: number;
  page: number;
  itemsPerPage: number;
};

@Injectable()
export class ListChallengesUseCase {
  constructor(private readonly challengesRepository: ChallengesRepository) {}

  public async execute({
    titleOrDescription,
    params: { page = 1, itemsPerPage = 10 } = {},
  }: ListChallengeUseCaseRequest): Promise<ListChallengeUseCaseResponse> {
    const response = await this.challengesRepository.findManyByTitleOrDescription(
      titleOrDescription,
      {
        page,
        itemsPerPage,
      },
    );

    return {
      challenges: response.challenges,
      total: response.total,
      page: response.page,
      itemsPerPage: response.itemsPerPage,
    };
  }
}
