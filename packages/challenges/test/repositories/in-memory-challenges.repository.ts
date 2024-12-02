import { PaginationParams } from '@/core/repositories/pagination-params';
import { ChallengesRepository } from '@/domain/application/repositories/challenges.repository';
import { Challenge } from '@/domain/enterprise/entities/Challenge';

export class InMemoryChallengesRepository implements ChallengesRepository {
  public items: Challenge[] = [];

  async findById(id: string): Promise<Challenge | null> {
    const challenge = this.items.find((item) => item.id.toString() === id);

    if (!challenge) return null;

    return challenge;
  }

  async findByTitle(title: string): Promise<Challenge | null> {
    const challenge = this.items.find((item) => item.title === title);

    if (!challenge) return null;

    return challenge;
  }

  async findManyByTitleOrDescription(
    titleOrDescription: string,
    { page, itemsPerPage }: PaginationParams,
  ): Promise<Challenge[]> {
    return this.items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(titleOrDescription.toLowerCase()) ||
          item.description.toLowerCase().includes(titleOrDescription.toLowerCase()),
      )
      .slice((page! - 1) * itemsPerPage!, page! * itemsPerPage!);
  }

  async create(challenge: Challenge): Promise<Challenge> {
    this.items.push(challenge);

    return this.items[this.items.length - 1];
  }

  async update(challenge: Challenge): Promise<Challenge> {
    const index = this.items.findIndex((item) => item.id.equals(challenge.id));
    this.items[index] = challenge;

    return challenge;
  }

  async deleteById(challenge: Challenge): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(challenge.id));

    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
}
