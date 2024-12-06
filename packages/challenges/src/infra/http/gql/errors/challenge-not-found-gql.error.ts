import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { CustomGraphQLError } from './custom-gql.error';
import { HttpStatus } from '@nestjs/common';

export class ChallengeNotFoundGraphQLError extends CustomGraphQLError {
  constructor() {
    super(UseCaseErrorMessages.CHALLENGE_NOT_FOUND, HttpStatus.BAD_REQUEST, {
      code: 'CHALLENGE_NOT_FOUND',
      statusCode: HttpStatus.BAD_REQUEST,
    });

    this.stack = undefined;
  }
}
