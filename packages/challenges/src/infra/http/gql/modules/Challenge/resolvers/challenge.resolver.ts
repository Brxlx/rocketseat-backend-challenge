import { CreateChallengeUseCase } from '@/domain/application/use-cases/Challenge/create-challenge-use-case';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';
import { ListChallengesUseCase } from '@/domain/application/use-cases/Challenge/list-challenges-use-case';

import { ListChallengesResponse } from '../responses/list-challenges.response';
import { DeleteChallengeUseCase } from '@/domain/application/use-cases/Challenge/delete-challenge-use-case';
import { ChallengePresenter } from '../presenters/challenge.presenter';
import { ListChallengesFiltersInput } from '../inputs/list-challenges-filters.input';
import { CreateChallengeInput } from '../inputs/create-challenge.input';
import { EditChallengeUseCase } from '@/domain/application/use-cases/Challenge/edit-challenge-use-case';
import { EditChallengeInput } from '../inputs/edit-challenge.input';
import { EditChallengeResponse } from '../responses/edit-challenge.response';
import { TitleAlreadyExistsError } from '@/domain/application/use-cases/errors/title-already-exists.error';
import { TitleAlreadyExistsGraphQLError } from '../../../errors/title-already-exists-gql.error';
import { ChallengeNotFoundError } from '@/domain/application/use-cases/errors/challenge-not-found.error';
import { ChallengeNotFoundGraphQLError } from '../../../errors/challenge-not-found-gql.error';
import { InvalidChallengeIdError } from '@/domain/application/use-cases/errors/invalid-challenge-id.error';
import { InvalidChallengeIdGraphQLError } from '../../../errors/invalid-challenge-id-gql.error';

@Resolver(() => Challenge)
export class ChallengeResolver {
  constructor(
    private createChallengeUseCase: CreateChallengeUseCase,
    private listChallengesUseCase: ListChallengesUseCase,
    private deleteChallengeUseCase: DeleteChallengeUseCase,
    private editChallengeUseCase: EditChallengeUseCase,
  ) {}

  @Query(() => ListChallengesResponse)
  public async listChallenges(
    @Args('listChallengesFiltersInput')
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

  @Mutation(() => String)
  public async createChallenge(
    @Args('createChallengeInput') createChallengeInput: CreateChallengeInput,
  ) {
    try {
      const { challenge } = await this.createChallengeUseCase.execute(createChallengeInput);

      return challenge.id.toString();
    } catch (err: any) {
      this.handleResolverError(err);
    }
  }

  @Mutation(() => EditChallengeResponse)
  public async updateChallenge(@Args('editChallengeInput') editChallengeInput: EditChallengeInput) {
    try {
      const updatedChallenge = await this.editChallengeUseCase.execute({
        id: editChallengeInput.id,
        title: editChallengeInput.title ?? undefined,
        description: editChallengeInput.description ?? undefined,
      });

      return { challenge: ChallengePresenter.toHTTP(updatedChallenge.challenge) };
    } catch (err: any) {
      this.handleResolverError(err);
    }
  }

  @Mutation(() => Boolean, { nullable: true })
  public async deleteChallenge(@Args('id') id: string) {
    try {
      return await this.deleteChallengeUseCase.execute(id);
    } catch (err: any) {
      this.handleResolverError(err);
    }
  }

  private handleResolverError(err: any) {
    if (err instanceof TitleAlreadyExistsError) {
      throw new TitleAlreadyExistsGraphQLError();
    }

    if (err instanceof ChallengeNotFoundError) {
      throw new ChallengeNotFoundGraphQLError();
    }

    if (err instanceof InvalidChallengeIdError) {
      throw new InvalidChallengeIdGraphQLError();
    }
  }
}
