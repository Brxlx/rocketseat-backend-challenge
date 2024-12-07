import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ZodValidationError } from './errors/zod-validation.error';

export class InputValidator {
  /**
   * Método genérico para validação de inputs usando esquema Zod
   * @param input Input a ser validado
   * @param schema Esquema Zod para validação
   * @returns Dados validados
   */
  public static validate<T extends z.ZodTypeAny>(input: z.infer<T>, schema: T): z.infer<T> {
    const result = schema.safeParse(input);

    if (!result.success) {
      const validationError = fromZodError(result.error);

      throw new ZodValidationError(validationError.message);
    }

    return result.data;
  }
}
