import { PaginationParams } from '@/core/repositories/pagination-params';
import { Challenge } from '@/domain/enterprise/entities/Challenge';

export abstract class ChallengesRepository {
  abstract findById(id: string): Promise<Challenge | null>;
  abstract findByTitle(title: string): Promise<Challenge | null>;
  abstract findManyByTitleOrDescription(
    titleOrDescription?: string,
    params?: PaginationParams,
  ): Promise<{ challenges: Challenge[]; total: number; page: number; itemsPerPage: number }>;
  abstract create(challenge: Challenge): Promise<Challenge>;
  abstract update(challenge: Challenge): Promise<Challenge>;
  abstract deleteById(id: string): Promise<void>;
}
