import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';

import { DeleteChallengeUseCase } from '@/domain/application/use-cases/Challenge/delete-challenge-use-case';
import { InvalidChallengeIdError } from '@/domain/application/use-cases/errors/invalid-challenge-id.error';
import { InvalidChallengeIdGraphQLError } from '../../../errors/invalid-challenge-id-gql.error';
import { InputValidator } from '../../../input-validator';
import { deleteChallengeInputSchema } from '../inputs/challenge-input-validation';
import { ResolverErrorHandler } from '../../../errors/resolver-error-handler';

@Resolver(() => Challenge)
export class DeleteChallengeResolver {
  constructor(private deleteChallengeUseCase: DeleteChallengeUseCase) {}

  @Mutation(() => Boolean, { nullable: true })
  public async deleteChallenge(@Args('id') id: string) {
    try {
      InputValidator.validate({ id }, deleteChallengeInputSchema);
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
