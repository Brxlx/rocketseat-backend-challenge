import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Observable, catchError, of } from 'rxjs';
import { ResolverErrorHandler } from '../http/gql/errors/resolver-error-handler';
import { ChallengeNotFoundError } from '@/domain/application/use-cases/errors/challenge-not-found.error';
import { ChallengeNotFoundGraphQLError } from '../http/gql/errors/challenge-not-found-gql.error';
import { GraphQLError } from 'graphql';
import { EmptyGithubUrlError } from '@/domain/application/use-cases/errors/empty-github-url.error';
import { EmptyGithubUrlGraphQLError } from '../http/gql/errors/empty-github-url-gql.error';
import { InternalServerError } from '@/domain/application/use-cases/errors/internal-server.error';
import { InternalServerErrorGraphQLError } from '../http/gql/errors/internal-server-error-gql.error';
import { InvalidGithubUrlError } from '@/domain/application/use-cases/errors/invalid-github-url.error';
import { InvalidGithubUrlGraphQLError } from '../http/gql/errors/invalid-github-url-gql.error';
import { InvalidChallengeIdError } from '@/domain/application/use-cases/errors/invalid-challenge-id.error';
import { InvalidChallengeIdGraphQLError } from '../http/gql/errors/invalid-challenge-id-gql.error';
import { RepositoryAlreadyExistsError } from '@/domain/application/use-cases/errors/repository-already-exists';
import { RepositoryAlreadyExistsGraphQLError } from '../http/gql/errors/repository-already-exists-gql.error';
import { TitleAlreadyExistsError } from '@/domain/application/use-cases/errors/title-already-exists.error';
import { TitleAlreadyExistsGraphQLError } from '../http/gql/errors/title-already-exists-gql.error';
import { SendingToTopicError } from '@/domain/application/use-cases/errors/sending-to-topic.error';
import { SendingToTopicGraphQLError } from '../http/gql/errors/sending-to-topic-gql.error';

@Injectable()
export class ResolverErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResolverErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Log the original error if the error is thrown from the validator, otherwise it won't be captured
        // this.logger.debug(`Original error: ${error.message}`);

        if (error instanceof GraphQLError) {
          return of(error);
          // throw error;
        }
        // Register and Map all possible errors to GraphQL errors
        // TODO: Register all possible errors
        const handledError = ResolverErrorHandler.handle(error, [
          {
            errorClass: ChallengeNotFoundError,
            graphqlError: ChallengeNotFoundGraphQLError,
          },
          {
            errorClass: InvalidChallengeIdError,
            graphqlError: InvalidChallengeIdGraphQLError,
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
            errorClass: TitleAlreadyExistsError,
            graphqlError: TitleAlreadyExistsGraphQLError,
          },
          {
            errorClass: SendingToTopicError,
            graphqlError: SendingToTopicGraphQLError,
          },
          {
            errorClass: InternalServerError,
            graphqlError: InternalServerErrorGraphQLError,
          },
        ]);

        // Transform to GraphQL error format
        return of(
          new GraphQLError(handledError.message, {
            extensions: {
              code: handledError.extensions?.code || 'INTERNAL_SERVER_ERROR',
              status: handledError.extensions?.status || HttpStatus.INTERNAL_SERVER_ERROR,
              validationErrors: error.validationErrors,
            },
          }),
        );
      }),
    );
  }
}
