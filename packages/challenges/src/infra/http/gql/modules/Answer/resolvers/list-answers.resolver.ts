import { FetchAnswersUseCase } from '@/domain/application/use-cases/Answer/fetch-answers-use.case';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ListAnswersInput } from '../inputs/list-answers.input';
import { Answer } from '../models/Answer';
import { AnswerPresenter } from '../presenters/answer.presenter';
import { ListAnswersResponse } from '../rersponses/list-answers.response';
import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { ListAnswersInputSchema } from '../inputs/answer-input-validation';
import { ValidateInput } from '@/infra/decorators/validate-input.decorator';

@Resolver(() => Answer)
export class ListAnswersResolver {
  constructor(private fetchAnswersUseCase: FetchAnswersUseCase) {}

  @Query(() => ListAnswersResponse, {
    description: 'Lista as respostas de um desafio pelos parâmetros de filtros e paginação',
  })
  @ValidateInput(ListAnswersInputSchema)
  public async listAnswers(
    @Args('listAnswesInput', { description: 'Os filtros possíveis e argumentos de paginação' })
    listAnswersInput: ListAnswersInput,
  ) {
    const { answers, ...rest } = await this.fetchAnswersUseCase.execute({
      filters: {
        ...listAnswersInput.filters,
        status: listAnswersInput.filters?.status as unknown as ANSWER_STATUS,
      },
      params: listAnswersInput.params,
    });

    return { ...rest, answers: answers.map(AnswerPresenter.toHTTP) };
  }
}
