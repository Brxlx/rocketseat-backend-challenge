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
// import { InputValidator } from '../../../input-validator';
import { submitAnswerSchema } from '../inputs/answer-input-validation';
import { ResolverErrorHandler } from '../../../errors/resolver-error-handler';
import { SendingToTopicError } from '@/domain/application/use-cases/errors/sending-to-topic.error';
import { SendingToTopicGraphQLError } from '../../../errors/sending-to-topic-gql.error';
import { RepositoryAlreadyExistsError } from '@/domain/application/use-cases/errors/repository-already-exists';
import { RepositoryAlreadyExistsGraphQLError } from '../../../errors/repository-already-exists-gql.error';
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
    try {
      const { answer } = await this.submitAnswerUseCase.execute(submitAnswerInput);

      return AnswerPresenter.toHTTP(answer);
    } catch (err: any) {
      return ResolverErrorHandler.handle(err, [
        {
          errorClass: ChallengeNotFoundError,
          graphqlError: ChallengeNotFoundGraphQLError,
        },
        {
          errorClass: EmptyGithubUrlError,
          graphqlError: EmptyGithubUrlGraphQLError,
        },
        {
          errorClass: InvalidGithubUrlError,
          graphqlError: InvalidGithubUrlGraphQLError,
        },
        {
          errorClass: RepositoryAlreadyExistsError,
          graphqlError: RepositoryAlreadyExistsGraphQLError,
        },
        {
          errorClass: SendingToTopicError,
          graphqlError: SendingToTopicGraphQLError,
        },
      ]);
    }
  }
}
