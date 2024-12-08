import { HttpStatus } from '@nestjs/common';
import { GraphQLError } from 'graphql';

export abstract class CustomGraphQLError extends GraphQLError {
  constructor(
    message: string,
    public statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    extensions?: Record<string, unknown>,
  ) {
    super(message, {
      extensions: {
        ...(extensions || {}),
        status: statusCode,
      },
    });
    // Ensure stack trace is not exposed
    Object.defineProperty(this, 'stackTrace', {
      enumerable: false,
      value: undefined,
    });
  }
}
