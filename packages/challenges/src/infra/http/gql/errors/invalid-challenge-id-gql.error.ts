import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { CustomGraphQLError } from './custom-gql.error';
import { HttpStatus } from '@nestjs/common';

export class InvalidChallengeIdGraphQLError extends CustomGraphQLError {
  constructor() {
    super(UseCaseErrorMessages.INVALID_CHALLENGE_ID, HttpStatus.BAD_REQUEST, {
      code: 'INVALID_CHALLENGE_ID',
      statusCode: HttpStatus.BAD_REQUEST,
    });

    this.stack = undefined;
  }
}
