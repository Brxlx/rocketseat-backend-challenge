import { z } from 'zod';

export const CreateChallengeInputSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'O título deve ter no mínimo 3 caracteres' })
    .trim()
    .refine((value) => !/^\s*$/.test(value), {
      message: 'O título não pode ser composto apenas por espaços',
    }),

  description: z
    .string()
    .min(10, { message: 'A descrição deve ter no mínimo 10 caracteres' })
    .trim()
    .refine((value) => !/^\s*$/.test(value), {
      message: 'A descrição não pode ser composta apenas por espaços',
    }),
});

export const deleteChallengeInputSchema = z.object({
  id: z.string().uuid({ message: 'O id do desafio deve ser um UUID válido' }),
});

export const ListChallengesInputSchema = z
  .object({
    titleOrDescription: z
      .string()
      .min(1, { message: 'O título deve ter no mínimo 1 caracter' })
      .trim()
      .optional(),
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

export type CreateChallengeInputType = z.infer<typeof CreateChallengeInputSchema>;
export type DeleteChallengeInputType = z.infer<typeof deleteChallengeInputSchema>;
export type ListChallengesInputType = z.infer<typeof ListChallengesInputSchema>;
