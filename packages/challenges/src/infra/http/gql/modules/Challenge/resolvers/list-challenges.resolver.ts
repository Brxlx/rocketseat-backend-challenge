import { Args, Query, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';
import { ListChallengesUseCase } from '@/domain/application/use-cases/Challenge/list-challenges-use-case';

import { ListChallengesResponse } from '../responses/list-challenges.response';
import { ChallengePresenter } from '../presenters/challenge.presenter';
import { ListChallengesFiltersInput } from '../inputs/list-challenges-filters.input';
import { ResolverErrorHandler } from '../../../errors/resolver-error-handler';
import { ListChallengesInputSchema } from '../inputs/challenge-input-validation';
import { ValidateInput } from '@/infra/decorators/validate-input.decorator';

@Resolver(() => Challenge)
export class ListChallengesResolver {
  constructor(private listChallengesUseCase: ListChallengesUseCase) {}

  @Query(() => ListChallengesResponse)
  @ValidateInput(ListChallengesInputSchema)
  public async listChallenges(
    @Args('listChallengesFiltersInput')
    { titleOrDescription, page, itemsPerPage }: ListChallengesFiltersInput,
  ): Promise<any> {
    try {
      const { challenges, ...rest } = await this.listChallengesUseCase.execute({
        titleOrDescription,
        params: {
          page,
          itemsPerPage,
        },
      });

      return { ...rest, challenges: challenges.map(ChallengePresenter.toHTTP) };
    } catch (err: any) {
      return ResolverErrorHandler.handle(err);
    }
  }
}
