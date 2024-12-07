import { Args, Query, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';
import { ListChallengesUseCase } from '@/domain/application/use-cases/Challenge/list-challenges-use-case';

import { ListChallengesResponse } from '../responses/list-challenges.response';
import { ChallengePresenter } from '../presenters/challenge.presenter';
import { ListChallengesFiltersInput } from '../inputs/list-challenges-filters.input';
import { InternalServerErrorGraphQLError } from '../../../errors/internal-server-error-gql.error';
import { InternalServerError } from '@/domain/application/use-cases/errors/internal-server.error';

@Resolver(() => Challenge)
export class ListChallengesResolver {
  constructor(private listChallengesUseCase: ListChallengesUseCase) {}

  @Query(() => ListChallengesResponse)
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
      this.handleResolverError(err);
    }
  }

  private handleResolverError(err: any) {
    if (err instanceof InternalServerError) {
      throw new InternalServerErrorGraphQLError();
    }
  }
}
