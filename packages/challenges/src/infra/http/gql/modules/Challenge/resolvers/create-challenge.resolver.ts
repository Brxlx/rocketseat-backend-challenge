import { CreateChallengeUseCase } from '@/domain/application/use-cases/Challenge/create-challenge-use-case';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';

import { CreateChallengeInput } from '../inputs/create-challenge.input';
import { TitleAlreadyExistsError } from '@/domain/application/use-cases/errors/title-already-exists.error';
import { TitleAlreadyExistsGraphQLError } from '../../../errors/title-already-exists-gql.error';
import { ChallengeNotFoundError } from '@/domain/application/use-cases/errors/challenge-not-found.error';
import { ChallengeNotFoundGraphQLError } from '../../../errors/challenge-not-found-gql.error';
import { InvalidChallengeIdError } from '@/domain/application/use-cases/errors/invalid-challenge-id.error';
import { InvalidChallengeIdGraphQLError } from '../../../errors/invalid-challenge-id-gql.error';

@Resolver(() => Challenge)
export class CreateChallengeResolver {
  constructor(private createChallengeUseCase: CreateChallengeUseCase) {}

  @Mutation(() => String)
  public async createChallenge(
    @Args('createChallengeInput') createChallengeInput: CreateChallengeInput,
  ) {
    try {
      const { challenge } = await this.createChallengeUseCase.execute(createChallengeInput);

      return challenge.id.toString();
    } catch (err: any) {
      this.handleResolverError(err);
    }
  }

  private handleResolverError(err: any) {
    if (err instanceof TitleAlreadyExistsError) {
      throw new TitleAlreadyExistsGraphQLError();
    }

    if (err instanceof ChallengeNotFoundError) {
      throw new ChallengeNotFoundGraphQLError();
    }

    if (err instanceof InvalidChallengeIdError) {
      throw new InvalidChallengeIdGraphQLError();
    }
  }
}
