import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';

import { DeleteChallengeUseCase } from '@/domain/application/use-cases/Challenge/delete-challenge-use-case';
import { InvalidChallengeIdError } from '@/domain/application/use-cases/errors/invalid-challenge-id.error';
import { InvalidChallengeIdGraphQLError } from '../../../errors/invalid-challenge-id-gql.error';
import { deleteChallengeInputSchema } from '../inputs/challenge-input-validation';
import { ResolverErrorHandler } from '../../../errors/resolver-error-handler';
import { ValidateInput } from '@/infra/decorators/validate-input.decorator';

@Resolver(() => Challenge)
export class DeleteChallengeResolver {
  constructor(private deleteChallengeUseCase: DeleteChallengeUseCase) {}

  @Mutation(() => Boolean, { nullable: true })
  @ValidateInput(deleteChallengeInputSchema)
  public async deleteChallenge(@Args('id') id: string) {
    try {
      return await this.deleteChallengeUseCase.execute(id);
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
