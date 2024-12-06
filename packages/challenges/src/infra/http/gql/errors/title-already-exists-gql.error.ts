import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { CustomGraphQLError } from '@/infra/http/gql/errors/custom-gql.error';
import { HttpStatus } from '@nestjs/common';

export class TitleAlreadyExistsGraphQLError extends CustomGraphQLError {
  constructor() {
    super(UseCaseErrorMessages.TITLE_ALREADY_EXISTS, HttpStatus.BAD_REQUEST, {
      code: 'TITLE_ALREADY_EXISTS',
      statusCode: HttpStatus.BAD_REQUEST,
    });

    this.stack = undefined;
  }
}
