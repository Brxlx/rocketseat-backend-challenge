import { Args, Query, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';
import { ListChallengesUseCase } from '@/domain/application/use-cases/Challenge/list-challenges-use-case';

import { ListChallengesResponse } from '../responses/list-challenges.response';
import { ChallengePresenter } from '../presenters/challenge.presenter';
import { ListChallengesFiltersInput } from '../inputs/list-challenges-filters.input';
import { ListChallengesInputSchema } from '../inputs/challenge-input-validation';
import { ValidateInput } from '@/infra/decorators/validate-input.decorator';

@Resolver(() => Challenge)
export class ListChallengesResolver {
  constructor(private listChallengesUseCase: ListChallengesUseCase) {}

  @Query(() => ListChallengesResponse, { description: 'Lista desafios pelos filtros e paginação' })
  @ValidateInput(ListChallengesInputSchema)
  public async listChallenges(
    @Args('listChallengesFiltersInput', { description: 'Filtros e paginação' })
    { titleOrDescription, page, itemsPerPage }: ListChallengesFiltersInput,
  ): Promise<any> {
    const { challenges, ...rest } = await this.listChallengesUseCase.execute({
      titleOrDescription,
      params: {
        page,
        itemsPerPage,
      },
    });

    return { ...rest, challenges: challenges.map(ChallengePresenter.toHTTP) };
  }
}
