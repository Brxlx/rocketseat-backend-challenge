import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';

import { ChallengePresenter } from '../presenters/challenge.presenter';
import { EditChallengeUseCase } from '@/domain/application/use-cases/Challenge/edit-challenge-use-case';
import { EditChallengeInput } from '../inputs/edit-challenge.input';
import { EditChallengeResponse } from '../responses/edit-challenge.response';
import { ValidateInput } from '@/infra/decorators/validate-input.decorator';
import { editChallengeSchema } from '../inputs/challenge-input-validation';

@Resolver(() => Challenge)
export class EditChallengeResolver {
  constructor(private editChallengeUseCase: EditChallengeUseCase) {}

  @Mutation(() => EditChallengeResponse, { description: 'Atualiza um desafio existente' })
  @ValidateInput(editChallengeSchema)
  public async updateChallenge(
    @Args('editChallengeInput', { description: 'Dados para atualização do desafio' })
    editChallengeInput: EditChallengeInput,
  ) {
    const updatedChallenge = await this.editChallengeUseCase.execute({
      id: editChallengeInput.id,
      title: editChallengeInput.title ?? undefined,
      description: editChallengeInput.description ?? undefined,
    });

    return { challenge: ChallengePresenter.toHTTP(updatedChallenge.challenge) };
  }
}
