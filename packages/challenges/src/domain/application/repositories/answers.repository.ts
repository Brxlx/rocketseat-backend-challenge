import { PaginationParams } from '@/core/repositories/pagination-params';
import { Answer } from '@/domain/enterprise/entities/Answer';

export abstract class AnswersRepository {
  abstract findById(id: string): Promise<Answer | null>;
  abstract findManyByFilters(challengeId: string, params: PaginationParams): Promise<Answer[]>;
  abstract create(answer: Answer): Promise<Answer>;
}
