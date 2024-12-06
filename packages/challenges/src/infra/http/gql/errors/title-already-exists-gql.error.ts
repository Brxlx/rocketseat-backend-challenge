import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { CustomGraphQLError } from '@/domain/application/use-cases/errors/custom-gql.error';
import { HttpStatus } from '@nestjs/common';

export class TitleAlreadyExistsGraphQLError extends CustomGraphQLError {
  constructor() {
    super(UseCaseErrorMessages.TITLE_ALREADY_EXISTS, HttpStatus.BAD_REQUEST, {
      code: 'TITLE_ALREADY_EXISTS',
      statusCode: 400,
    });

    this.stack = undefined;
  }
}
