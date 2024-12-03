import { AnswerFilters } from '@/core/repositories/answer-filters';
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

  async findManyByFilters(filters: AnswerFilters, params: PaginationParams): Promise<Answer[]> {
    return this.items
      .filter((item) => {
        // Filtro por challengeId
        const matchesChallengeId = filters.challengeId
          ? item.challengeId.toString() === filters.challengeId
          : true;

        // Filtro por status
        const matchesStatus = filters.status ? item.status === filters.status : true;

        // Filtro por data de início e término considerando apenas a data
        const matchesDateRange =
          !filters.startDate || !filters.endDate
            ? true
            : this.isDateInRange(item.createdAt, filters.startDate, filters.endDate);

        // Combina todos os filtros
        return matchesChallengeId && matchesStatus && matchesDateRange;
      })
      .slice((params.page! - 1) * 20, params.page! * 20);
  }

  // Método auxiliar para comparação de datas ignorando horas e usando UTC
  private isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    // Converte para UTC
    const compareDate = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );

    const compareStartDate = new Date(
      Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()),
    );

    const compareEndDate = new Date(
      Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()),
    );

    if (compareStartDate > compareEndDate) {
      throw new Error('Start date must be less than end date');
    }

    if (compareEndDate < compareStartDate) {
      throw new Error('End date must be greater than start date');
    }

    return compareDate >= compareStartDate && compareDate <= compareEndDate;
  }

  async create(answer: Answer): Promise<Answer> {
    this.items.push(answer);

    return this.items[this.items.length - 1];
  }
}
