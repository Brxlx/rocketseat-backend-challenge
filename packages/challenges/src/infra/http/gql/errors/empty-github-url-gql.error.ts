import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { CustomGraphQLError } from './custom-gql.error';
import { HttpStatus } from '@nestjs/common';

export class EmptyGithubUrlGraphQLError extends CustomGraphQLError {
  constructor() {
    super(UseCaseErrorMessages.EMPTY_GITHUB_URL, HttpStatus.BAD_REQUEST, {
      code: 'EMPTY_GITHUB_URL',
      statusCode: HttpStatus.BAD_REQUEST,
    });

    this.stack = undefined;
  }
}
