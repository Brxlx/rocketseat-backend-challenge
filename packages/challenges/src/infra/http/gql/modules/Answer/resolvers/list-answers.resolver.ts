import { FetchAnswersUseCase } from '@/domain/application/use-cases/Answer/fetch-answers-use.case';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ListAnswersInput } from '../inputs/list-answers.input';
import { Answer } from '../models/Answer';
import { AnswerPresenter } from '../presenters/answer.presenter';
import { ListAnswersResponse } from '../rersponses/list-answers.response';
import { ANSWER_STATUS } from '@/core/consts/answer-status';
import { ChallengeNotFoundError } from '@/domain/application/use-cases/errors/challenge-not-found.error';
import { ChallengeNotFoundGraphQLError } from '../../../errors/challenge-not-found-gql.error';
import { ResolverErrorHandler } from '../../../errors/resolver-error-handler';
import { ListAnswersInputSchema } from '../inputs/answer-input-validation';
import { ValidateInput } from '@/infra/decorators/validate-input.decorator';

@Resolver(() => Answer)
export class ListAnswersResolver {
  constructor(private fetchAnswersUseCase: FetchAnswersUseCase) {}

  @Query(() => ListAnswersResponse)
  @ValidateInput(ListAnswersInputSchema)
  public async listAnswers(@Args('listAnswesInput') listAnswersInput: ListAnswersInput) {
    try {
      const { answers, ...rest } = await this.fetchAnswersUseCase.execute({
        filters: {
          ...listAnswersInput.filters,
          status: listAnswersInput.filters?.status as unknown as ANSWER_STATUS,
        },
        params: listAnswersInput.params,
      });

      return { ...rest, answers: answers.map(AnswerPresenter.toHTTP) };
    } catch (err: any) {
      return ResolverErrorHandler.handle(err, [
        {
          errorClass: ChallengeNotFoundError,
          graphqlError: ChallengeNotFoundGraphQLError,
        },
      ]);
    }
  }
}
