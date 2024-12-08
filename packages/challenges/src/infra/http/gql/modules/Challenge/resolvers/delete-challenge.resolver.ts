import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';

import { DeleteChallengeUseCase } from '@/domain/application/use-cases/Challenge/delete-challenge-use-case';
import { InvalidChallengeIdError } from '@/domain/application/use-cases/errors/invalid-challenge-id.error';
import { InvalidChallengeIdGraphQLError } from '../../../errors/invalid-challenge-id-gql.error';
import { deleteChallengeInputSchema } from '../inputs/challenge-input-validation';
import { ResolverErrorHandler } from '../../../errors/resolver-error-handler';
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
    try {
      return await this.deleteChallengeUseCase.execute(deleteInput.id);
    } catch (err: any) {
      return ResolverErrorHandler.handle(err, [
        {
          errorClass: InvalidChallengeIdError,
          graphqlError: InvalidChallengeIdGraphQLError,
        },
      ]);
    }
  }
}
