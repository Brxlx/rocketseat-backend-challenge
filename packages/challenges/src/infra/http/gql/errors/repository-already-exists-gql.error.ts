import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { CustomGraphQLError } from './custom-gql.error';
import { HttpStatus } from '@nestjs/common';

export class RepositoryAlreadyExistsGraphQLError extends CustomGraphQLError {
  constructor() {
    super(UseCaseErrorMessages.REPOSITORY_ALREADY_EXISTS, HttpStatus.BAD_REQUEST, {
      code: 'REPOSITORY_ALREADY_EXISTS',
      statusCode: HttpStatus.BAD_REQUEST,
    });

    this.stack = undefined;
  }
}
