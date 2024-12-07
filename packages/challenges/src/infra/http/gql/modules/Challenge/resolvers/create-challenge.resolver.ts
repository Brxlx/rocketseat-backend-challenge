import { CreateChallengeUseCase } from '@/domain/application/use-cases/Challenge/create-challenge-use-case';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';

import { CreateChallengeInput } from '../inputs/create-challenge.input';
import { CreateChallengeInputSchema } from '../inputs/challenge-input-validation';
import { InputValidator } from '../../../input-validator';
import { ResolverErrorHandler } from '../../../errors/resolver-error-handler';

@Resolver(() => Challenge)
export class CreateChallengeResolver {
  constructor(private createChallengeUseCase: CreateChallengeUseCase) {}

  @Mutation(() => String)
  public async createChallenge(
    @Args('createChallengeInput') createChallengeInput: CreateChallengeInput,
  ) {
    try {
      InputValidator.validate(createChallengeInput, CreateChallengeInputSchema);

      const { challenge } = await this.createChallengeUseCase.execute(createChallengeInput);

      return challenge.id.toString();
    } catch (err: any) {
      return ResolverErrorHandler.handle(err.message);
    }
  }
}
