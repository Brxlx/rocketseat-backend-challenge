import { SubmitAnswerUseCase } from '@/domain/application/use-cases/Answer/submit-answer-use-case';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Answer } from '../models/Answer';
import { AnswerPresenter } from '../presenters/answer.presenter';
import { SubmitAnswerInput } from '../inputs/submit-answer.input';
import { ChallengeNotFoundError } from '@/domain/application/use-cases/errors/challenge-not-found.error';
import { ChallengeNotFoundGraphQLError } from '../../../errors/challenge-not-found-gql.error';
import { EmptyGithubUrlError } from '@/domain/application/use-cases/errors/empty-github-url.error';
import { EmptyGithubUrlGraphQLError } from '../../../errors/empty-github-url-gql.error';
import { InvalidGithubUrlError } from '@/domain/application/use-cases/errors/invalid-github-url.error';
import { InvalidGithubUrlGraphQLError } from '../../../errors/invalid-github-url-gql.error';

@Resolver(() => Answer)
export class SubmitAnswerResolver {
  constructor(private submitAnswerUseCase: SubmitAnswerUseCase) {}

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
