import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { CustomGraphQLError } from './custom-gql.error';
import { HttpStatus } from '@nestjs/common';

export class InvalidGithubUrlGraphQLError extends CustomGraphQLError {
  constructor() {
    super(UseCaseErrorMessages.INVALID_GITHUB_URL, HttpStatus.BAD_REQUEST, {
      code: 'INVALID_GITHUB_URL',
      statusCode: HttpStatus.BAD_REQUEST,
    });

    this.stack = undefined;
  }
}
