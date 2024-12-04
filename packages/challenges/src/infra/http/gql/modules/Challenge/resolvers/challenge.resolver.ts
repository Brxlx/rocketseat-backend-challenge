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
    const { challenge } = await this.createChallengeUseCase.execute(createChallengeInput);

    return challenge.id.toString();
  }

  @Mutation(() => EditChallengeResponse)
  public async updateChallenge(@Args('editChallengeInput') editChallengeInput: EditChallengeInput) {
    const updatedChallenge = await this.editChallengeUseCase.execute({
      id: editChallengeInput.id,
      title: editChallengeInput.title ?? undefined,
      description: editChallengeInput.description ?? undefined,
    });

    return { challenge: ChallengePresenter.toHTTP(updatedChallenge.challenge) };
  }

  @Mutation(() => Boolean, { nullable: true })
  public async deleteChallenge(@Args('id') id: string) {
    return this.deleteChallengeUseCase.execute(id);
  }
}
