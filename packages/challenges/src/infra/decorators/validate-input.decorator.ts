import { ZodSchema, ZodError, ZodObject } from 'zod';
import { ValidationErrorItem, FormattedValidationError } from '../types/validation-error';
import { ValidationGraphQLError } from '../http/gql/errors/validation-gql.error';
import { HttpStatus } from '@nestjs/common';

function formatZodError(error: ZodError): FormattedValidationError {
  const errors: ValidationErrorItem[] = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return { errors };
}

function getFirstSchemaKey(schema: ZodSchema): string | undefined {
  // Verificar se é um objeto Zod
  if ('shape' in schema && schema instanceof ZodObject) {
    const keys = Object.keys(schema.shape);
    return keys[0];
  }

  return undefined;
}

export function ValidateInput(schema: ZodSchema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const firstKey = getFirstSchemaKey(schema);

      // Verificar se o primeiro argumento é uma string e a primeira chave do schema existe
      let input = args[0];
      if (typeof input === 'string' && firstKey) {
        input = { [firstKey]: input };
      }

      const result = schema.safeParse(input);

      if (!result.success) {
        const formattedError = formatZodError(result.error);
        throw new ValidationGraphQLError('Input validation failed', HttpStatus.BAD_REQUEST, {
          code: 'ZOD_VALIDATION_ERROR',
          validationErrors: formattedError.errors,
          name: 'ValidationError',
        });
      }

      args[0] = result.data;
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
