import { HttpStatus } from '@nestjs/common';
import { CustomGraphQLError } from './custom-gql.error';

export class ValidationGraphQLError extends CustomGraphQLError {
  constructor(
    message: string = 'Validation Error',
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    extensions?: Record<string, unknown>,
  ) {
    super(message, statusCode, {
      code: extensions?.code ?? 'ZOD_VALIDATION_ERROR',
      validationErrors: extensions?.validationErrors,
      name: extensions?.name ?? 'ValidationError',
    });

    // Ensure the stack trace is not exposed
    this.stack = undefined;
  }

  // Optional: Static method to create validation errors with consistent formatting
  static fromZodErrors(
    errors: Array<{ field: string; message: string; code: string }>,
    message: string = 'Input Validation Failed',
  ) {
    return new ValidationGraphQLError(message, HttpStatus.BAD_REQUEST, {
      validationErrors: errors,
    });
  }
}
