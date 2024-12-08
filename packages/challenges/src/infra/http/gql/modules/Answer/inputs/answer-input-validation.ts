import { z } from 'zod';
import { GQL_ANSWER_STATUS_ENUM } from '../resolvers/register-answer-enum';

export const submitAnswerSchema = z.object({
  challengeId: z.string().uuid({ message: 'O challengeId deve ser um uuid válido' }),
  repositoryUrl: z.string().url({ message: 'O repositoryUrl deve ser uma URL válida' }),
});

const StatusEnumSchema = z.nativeEnum(GQL_ANSWER_STATUS_ENUM);

export const FiltersInputSchema = z
  .object({
    challengeId: z.string().uuid({ message: 'O challengeId deve ser um UUID válido' }).optional(),
    startDate: z
      .date({
        invalid_type_error: 'A data de início deve ser uma data válida',
      })
      .optional(),
    endDate: z
      .date({
        invalid_type_error: 'A data de término deve ser uma data válida',
      })
      .optional(),
    status: StatusEnumSchema.optional(),
  })
  .optional();

export const ParamsInputSchema = z
  .object({
    page: z
      .number()
      .int({ message: 'A página deve ser um número inteiro' })
      .positive({ message: 'A página deve ser um número positivo' })
      .optional(),

    itemsPerPage: z
      .number()
      .int({ message: 'Itens por página deve ser um número inteiro' })
      .positive({ message: 'Itens por página deve ser um número positivo' })
      .optional(),
  })
  .optional();

export const ListAnswersInputSchema = z
  .object({
    filters: FiltersInputSchema,
    params: ParamsInputSchema,
  })
  .optional();

export type SubmiAnswerType = z.infer<typeof submitAnswerSchema>;
export type FiltersInputType = z.infer<typeof FiltersInputSchema>;
export type ListAnswersInputType = z.infer<typeof ListAnswersInputSchema>;
