import { Challenge } from '@/domain/enterprise/entities/Challenge';

export abstract class ChallengesRepository {
  abstract findByTitle(title: string): Promise<Challenge | null>;
  abstract create(challenge: Challenge): Promise<Challenge>;
}
