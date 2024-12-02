import { Challenge } from '@/domain/enterprise/entities/Challenge';

export abstract class ChallengesRepository {
  abstract findById(id: string): Promise<Challenge | null>;
  abstract findByTitle(title: string): Promise<Challenge | null>;
  abstract create(challenge: Challenge): Promise<Challenge>;
  abstract deleteById(challenge: Challenge): Promise<void>;
}
