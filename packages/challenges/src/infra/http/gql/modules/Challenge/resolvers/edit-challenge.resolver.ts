import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';

import { ChallengePresenter } from '../presenters/challenge.presenter';
import { EditChallengeUseCase } from '@/domain/application/use-cases/Challenge/edit-challenge-use-case';
import { EditChallengeInput } from '../inputs/edit-challenge.input';
import { EditChallengeResponse } from '../responses/edit-challenge.response';
import { TitleAlreadyExistsError } from '@/domain/application/use-cases/errors/title-already-exists.error';
import { TitleAlreadyExistsGraphQLError } from '../../../errors/title-already-exists-gql.error';
import { ResolverErrorHandler } from '../../../errors/resolver-error-handler';

@Resolver(() => Challenge)
export class EditChallengeResolver {
  constructor(private editChallengeUseCase: EditChallengeUseCase) {}

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
      return ResolverErrorHandler.handle(err.messag, [
        {
          errorClass: TitleAlreadyExistsError,
          graphqlError: TitleAlreadyExistsGraphQLError,
        },
      ]);
    }
  }
}
