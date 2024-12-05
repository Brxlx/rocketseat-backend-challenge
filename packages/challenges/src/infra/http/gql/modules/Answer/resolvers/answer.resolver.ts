import { FetchAnswersUseCase } from '@/domain/application/use-cases/Answer/fetch-answers-use.case';
import { SubmitAnswerUseCase } from '@/domain/application/use-cases/Answer/submit-answer-use-case';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ListAnswersInput } from '../inputs/list-answers.input';
import { Answer } from '../models/Answer';
import { AnswerPresenter } from '../presenters/answer.presenter';
import { ListAnswersResponse } from '../rersponses/list-answers.response';

@Resolver(() => Answer)
export class AnswerResolver {
  constructor(
    private submitAnswerUseCase: SubmitAnswerUseCase,
    private fetchAnswersUseCase: FetchAnswersUseCase,
  ) {}

  @Query(() => ListAnswersResponse)
  public async listAnswers(@Args('listAnswesInput') listAnswersInput: ListAnswersInput) {
    const { answers, ...rest } = await this.fetchAnswersUseCase.execute(listAnswersInput);

    return { ...rest, answers: answers.map(AnswerPresenter.toHTTP) };
  }
}
