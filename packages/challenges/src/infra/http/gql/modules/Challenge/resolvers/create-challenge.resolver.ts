import { CreateChallengeUseCase } from '@/domain/application/use-cases/Challenge/create-challenge-use-case';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Challenge } from '../models/Challenge';

import { CreateChallengeInput } from '../inputs/create-challenge.input';
import { CreateChallengeInputSchema } from '../inputs/challenge-input-validation';
import { ResolverErrorHandler } from '../../../errors/resolver-error-handler';
import { ValidateInput } from '@/infra/decorators/validate-input.decorator';

@Resolver(() => Challenge)
export class CreateChallengeResolver {
  constructor(private createChallengeUseCase: CreateChallengeUseCase) {}

  @Mutation(() => String, { description: 'Cria um novo desafio' })
  @ValidateInput(CreateChallengeInputSchema)
  public async createChallenge(
    @Args('createChallengeInput', { description: 'Dados necessaŕios para criar um novo desafio' })
    createChallengeInput: CreateChallengeInput,
  ) {
    try {
      const { challenge } = await this.createChallengeUseCase.execute(createChallengeInput);

      return challenge.id.toString();
    } catch (err: any) {
      return ResolverErrorHandler.handle(err.message);
    }
  }
}
