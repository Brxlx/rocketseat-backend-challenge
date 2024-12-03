import { CreateChallengeUseCase } from '@/domain/application/use-cases/Challenge/create-challenge-use-case';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateChallengeInput } from '../inputs/create-challenge.input';
import { Challenge } from '../models/Challenge';

@Resolver(() => Challenge)
export class ChallengeResolver {
  constructor(private createChallengeUseCase: CreateChallengeUseCase) {}

  @Query(() => String)
  public async hello() {
    return 'Hello World!';
  }

  @Mutation(() => Challenge)
  public async createChallenge(
    @Args('createChallengeInput') createChallengeInput: CreateChallengeInput,
  ) {
    return this.createChallengeUseCase.execute(createChallengeInput);
  }
}
