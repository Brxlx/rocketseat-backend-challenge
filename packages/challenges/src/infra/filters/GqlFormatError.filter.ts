import { Injectable, Logger } from '@nestjs/common';
import { GraphQLFormattedError } from 'graphql';

interface ValidationErrorItem {
  field: string;
  message: string;
  code: string;
}

interface GraphQLErrorExtensions {
  code?: string;
  validationErrors?: ValidationErrorItem[];
  stackTrace?: string;
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

    // Special handling for validation errors
    if (extensions?.code === 'ZOD_VALIDATION_ERROR') {
      return {
        message: formattedError.message,
        timestamp: new Date().toISOString(),
        extensions: {
          code: 'ZOD_VALIDATION_ERROR',
          validationErrors: extensions.validationErrors,
        },
        name: 'Input Validation Error',
        status: 400,
      };
    }

    // Regular error handling
    const message = this.extractMessage(formattedError, extensions);
    const messageString = Array.isArray(message) ? message.join('; ') : message;

    return {
      message: messageString,
      timestamp: new Date().toISOString(),
      extensions: {
        code: extensions?.code || 'INTERNAL_SERVER_ERROR',
        ...extensions,
      },
      name: this.extractName(formattedError, extensions),
      status: this.extractStatus(formattedError, extensions),
    };
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
    // Priorize a busca do status nas diferentes camadas de extensões
    const status =
      // Primeiro, tente capturar o status das extensões do GraphQL
      (extensions as any)?.status ||
      // Em seguida, verifique no objeto exception
      (extensions as any)?.exception?.status ||
      // Depois, verifique no response dentro do exception
      (extensions as any)?.exception?.response?.statusCode ||
      // Verifique o statusCode direto no response
      (extensions as any)?.response?.statusCode ||
      // Fallback para 500 se nenhum status for encontrado
      500;

    // this.logger.debug(`Extracted status: ${status}`, JSON.stringify(extensions));

    return status;
  }
}
