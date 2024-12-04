import { Injectable, Logger } from '@nestjs/common';
import { GraphQLFormattedError } from 'graphql';

interface GraphQLErrorExtensions {
  code?: string;
  exception?: {
    name?: string;
    status?: number;
    response?: {
      message?: string | string[];
      statusCode?: number;
    };
  };
  response?: {
    message?: string | string[];
    statusCode?: number;
  };
}

interface CustomGraphQLFormattedError extends GraphQLFormattedError {
  timestamp?: string;
  name?: string;
  status?: number;
}

@Injectable()
export class GraphQLFormatErrorFilter {
  private logger = new Logger(GraphQLFormatErrorFilter.name);

  public format(formattedError: GraphQLFormattedError): CustomGraphQLFormattedError {
    const extensions = formattedError.extensions as GraphQLErrorExtensions | undefined;

    // Normalize message to a string
    const message = this.extractMessage(formattedError, extensions);
    const messageString = Array.isArray(message) ? message.join('; ') : message;

    const processedError: CustomGraphQLFormattedError = {
      message: messageString,
      timestamp: new Date().toISOString(),
      name: this.extractName(formattedError, extensions),
      status: this.extractStatus(formattedError, extensions),
    };

    this.logger.error(JSON.stringify(processedError));

    return processedError;
  }

  private extractMessage(
    error: GraphQLFormattedError,
    extensions?: GraphQLErrorExtensions,
  ): string | string[] {
    return (
      (extensions as any)?.exception?.response?.message ||
      (extensions as any)?.response?.message ||
      error.message ||
      'Unknown error'
    );
  }

  private extractName(error: GraphQLFormattedError, extensions?: GraphQLErrorExtensions): string {
    return (extensions as any)?.exception?.name || error.message || 'UnknownError';
  }

  private extractStatus(error: GraphQLFormattedError, extensions?: GraphQLErrorExtensions): number {
    return (
      (extensions as any)?.exception?.status ||
      (extensions as any)?.exception?.response?.statusCode ||
      (extensions as any)?.response?.statusCode ||
      500
    );
  }
}
