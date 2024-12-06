import { FetchAnswersUseCase } from '@/domain/application/use-cases/Answer/fetch-answers-use.case';
import { SubmitAnswerUseCase } from '@/domain/application/use-cases/Answer/submit-answer-use-case';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ListAnswersInput } from '../inputs/list-answers.input';
import { Answer } from '../models/Answer';
import { AnswerPresenter } from '../presenters/answer.presenter';
import { ListAnswersResponse } from '../rersponses/list-answers.response';
import { SubmitAnswerInput } from '../inputs/submit-answer.input';
import { ANSWER_STATUS } from '@/core/consts';
import { ChallengeNotFoundError } from '@/domain/application/use-cases/errors/challenge-not-found.error';
import { ChallengeNotFoundGraphQLError } from '../../../errors/challenge-not-found-gql.error';
import { EmptyGithubUrlError } from '@/domain/application/use-cases/errors/empty-github-url.error';
import { EmptyGithubUrlGraphQLError } from '../../../errors/empty-github-url-gql.error';
import { InvalidGithubUrlError } from '@/domain/application/use-cases/errors/invalid-github-url.error';
import { InvalidGithubUrlGraphQLError } from '../../../errors/invalid-github-url-gql.error';

@Resolver(() => Answer)
export class AnswerResolver {
  constructor(
    private submitAnswerUseCase: SubmitAnswerUseCase,
    private fetchAnswersUseCase: FetchAnswersUseCase,
  ) {}

  @Query(() => ListAnswersResponse)
  public async listAnswers(@Args('listAnswesInput') listAnswersInput: ListAnswersInput) {
    const { answers, ...rest } = await this.fetchAnswersUseCase.execute({
      filters: {
        ...listAnswersInput.filters,
        status: listAnswersInput.filters?.status as unknown as ANSWER_STATUS,
      },
      params: listAnswersInput.params,
    });

    return { ...rest, answers: answers.map(AnswerPresenter.toHTTP) };
  }

  @Mutation(() => Answer)
  public async submitAnswer(@Args('submitAnswerInput') submitAnswerInput: SubmitAnswerInput) {
    try {
      const { answer } = await this.submitAnswerUseCase.execute(submitAnswerInput);

      return AnswerPresenter.toHTTP(answer);
    } catch (err: any) {
      this.handleResolverError(err);
    }
  }

  private handleResolverError(err: any) {
    if (err instanceof ChallengeNotFoundError) {
      throw new ChallengeNotFoundGraphQLError();
    }

    if (err instanceof EmptyGithubUrlError) {
      throw new EmptyGithubUrlGraphQLError();
    }

    if (err instanceof InvalidGithubUrlError) {
      throw new InvalidGithubUrlGraphQLError();
    }
  }
}
