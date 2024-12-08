import { ZodSchema, ZodError, ZodObject } from 'zod';
import { ValidationErrorItem, FormattedValidationError } from '../types/validation-error';
import { ValidationGraphQLError } from '../http/gql/errors/validation-gql.error';
import { HttpStatus } from '@nestjs/common';

/**
 * A decorator function that validates the input of a method using a Zod schema.
 *
 * This decorator function takes a Zod schema as an argument and applies it to the
 * first argument of the decorated method. If the input does not pass the validation,
 * a `ValidationGraphQLError` is thrown with the validation errors.
 *
 * @param schema - The Zod schema to use for input validation.
 * @returns A decorator function that can be applied to a method.
 */
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
}
