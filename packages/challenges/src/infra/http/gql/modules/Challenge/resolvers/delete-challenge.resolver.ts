import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';

import { DeleteChallengeUseCase } from '@/domain/application/use-cases/Challenge/delete-challenge-use-case';
import { deleteChallengeInputSchema } from '../inputs/challenge-input-validation';
import { ValidateInput } from '@/infra/decorators/validate-input.decorator';
import { DeleteChallengeInput } from '../inputs/delete-challenge.input';

@Resolver(() => Challenge)
export class DeleteChallengeResolver {
  constructor(private deleteChallengeUseCase: DeleteChallengeUseCase) {}

  @Mutation(() => Boolean, { nullable: true, description: 'Deleta um desafio pelo id' })
  @ValidateInput(deleteChallengeInputSchema)
  public async deleteChallenge(
    @Args('deleteInput', { description: 'o id do desafio a ser deletado' })
    deleteInput: DeleteChallengeInput,
  ) {
    return await this.deleteChallengeUseCase.execute(deleteInput.id);
  }
}
