import { SubmitAnswerUseCase } from '@/domain/application/use-cases/Answer/submit-answer-use-case';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Answer } from '../models/Answer';
import { AnswerPresenter } from '../presenters/answer.presenter';
import { SubmitAnswerInput } from '../inputs/submit-answer.input';
import { submitAnswerSchema } from '../inputs/answer-input-validation';
import { ValidateInput } from '@/infra/decorators/validate-input.decorator';

@Resolver(() => Answer)
export class SubmitAnswerResolver {
  constructor(private submitAnswerUseCase: SubmitAnswerUseCase) {}

  @Mutation(() => Answer, { description: 'Envia uma submissão de resposta para um desafio' })
  @ValidateInput(submitAnswerSchema)
  public async submitAnswer(
    @Args('submitAnswerInput', { description: 'As entradas possíveis para submissão de resposta' })
    submitAnswerInput: SubmitAnswerInput,
  ) {
    const { answer } = await this.submitAnswerUseCase.execute(submitAnswerInput);

    return AnswerPresenter.toHTTP(answer);
  }
}
