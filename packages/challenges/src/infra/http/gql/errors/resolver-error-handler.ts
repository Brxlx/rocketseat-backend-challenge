import { Logger } from '@nestjs/common';

import { InternalServerErrorGraphQLError } from './internal-server-error-gql.error';
import { ZodValidationError } from './zod-validation.error';

interface ErrorMap {
  errorClass: any;
  graphqlError: any;
}

export class ResolverErrorHandler {
  private static readonly logger = new Logger(ResolverErrorHandler.name);

  private static defaultErrorMap: ErrorMap[] = [
    {
      errorClass: ZodValidationError,
      graphqlError: ZodValidationError,
    },
  ];

  /**
   * Método genérico para tratamento de erros em resolvers
   * @param err Erro capturado
   * @param customErrorMap Mapa de erros personalizado (opcional)
   * @returns Erro GraphQL tratado
   */
  public static handle(err: any, customErrorMap: ErrorMap[] = []): never {
    const errorMap = [...this.defaultErrorMap, ...customErrorMap];

    const matchedError = errorMap.find(({ errorClass }) => err instanceof errorClass);

    if (matchedError) {
      throw new matchedError.graphqlError(err.message);
    }

    this.logger.error('Unhandled error in resolver', err);

    throw new InternalServerErrorGraphQLError();
  }
}