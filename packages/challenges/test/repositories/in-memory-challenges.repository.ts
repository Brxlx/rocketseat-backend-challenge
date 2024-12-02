import { ChallengesRepository } from '@/domain/application/repositories/challenges.repository';
import { Challenge } from '@/domain/enterprise/entities/Challenge';

export class InMemoryChallengesRepository implements ChallengesRepository {
  public items: Challenge[] = [];

  async findByTitle(title: string): Promise<Challenge | null> {
    const challenge = this.items.find((item) => item.title === title);

    if (!challenge) return null;

    return challenge;
  }

  async create(challenge: Challenge): Promise<Challenge> {
    this.items.push(challenge);

    return this.items[this.items.length - 1];
  }
}
