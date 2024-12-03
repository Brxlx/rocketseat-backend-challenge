import { PaginationParams } from '@/core/repositories/pagination-params';
import { AnswersRepository } from '@/domain/application/repositories/answers.repository';
import { Answer } from '@/domain/enterprise/entities/Answer';

export class InMemoryAnswersRepository implements AnswersRepository {
  public items: Answer[] = [];

  async findById(id: string): Promise<Answer | null> {
    const answer = this.items.find((item) => item.id.toString() === id);

    if (!answer) return null;

    return answer;
  }
  async findManyByFilters(challengeId: string, params: PaginationParams): Promise<Answer[]> {
    return this.items
      .filter((item) => item.challengeId.toString() === challengeId)
      .slice((params.page! - 1) * 20, params.page! * 20);
  }

  async create(answer: Answer): Promise<Answer> {
    this.items.push(answer);

    return this.items[this.items.length - 1];
  }
}
