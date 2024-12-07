import { CustomGraphQLError } from './custom-gql.error';
import { HttpStatus } from '@nestjs/common';

export class ZodValidationError extends CustomGraphQLError {
  constructor(message: string, status: number = HttpStatus.BAD_REQUEST) {
    super(message, status, {
      code: 'ZOD_VALIDATION_ERROR',
      statusCode: status,
    });

    this.stack = undefined;
  }
}
