import { AnswerFilters } from '@/core/repositories/answer-filters';
import { PaginationParams } from '@/core/repositories/pagination-params';
import { Answer } from '@/domain/enterprise/entities/Answer';

export abstract class AnswersRepository {
  abstract findById(id: string): Promise<Answer | null>;
  abstract findByRepositoryUrl(repositoryUrl: string): Promise<Answer | null>;
  abstract findManyByFilters(
    filters: AnswerFilters,
    params: PaginationParams,
  ): Promise<{ answers: Answer[]; total: number; page: number; itemsPerPage: number }>;
  abstract create(answer: Answer): Promise<Answer>;
}
