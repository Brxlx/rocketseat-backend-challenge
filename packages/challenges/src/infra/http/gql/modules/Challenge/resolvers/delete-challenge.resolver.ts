import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';

import { DeleteChallengeUseCase } from '@/domain/application/use-cases/Challenge/delete-challenge-use-case';
import { InvalidChallengeIdError } from '@/domain/application/use-cases/errors/invalid-challenge-id.error';
import { InvalidChallengeIdGraphQLError } from '../../../errors/invalid-challenge-id-gql.error';
import { InputValidator } from '../../../input-validator';
import { deleteChallengeInputSchema } from '../inputs/challenge-input-validation';
import { ZodValidationError } from '../../../errors/zod-validation.error';

@Resolver(() => Challenge)
export class DeleteChallengeResolver {
  constructor(private deleteChallengeUseCase: DeleteChallengeUseCase) {}

  @Mutation(() => Boolean, { nullable: true })
  public async deleteChallenge(@Args('id') id: string) {
    try {
      InputValidator.validate({ id }, deleteChallengeInputSchema);
      return await this.deleteChallengeUseCase.execute(id);
    } catch (err: any) {
      this.handleResolverError(err);
    }
  }

  private handleResolverError(err: any) {
    if (err instanceof ZodValidationError) {
      throw new ZodValidationError(err.message);
    }

    if (err instanceof InvalidChallengeIdError) {
      throw new InvalidChallengeIdGraphQLError();
    }
  }
}
