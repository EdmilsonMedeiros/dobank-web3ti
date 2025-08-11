// src/validators/codeVerify.schema.ts
import { z } from 'zod';

const clean = (s: string) => s.replace(/\W/gi, '').toUpperCase();

export const codeVerifySchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-mail é obrigatório' })
    .email({ message: 'E-mail inválido' }),
  code: z
    .string()
    .min(1, { message: 'Código é obrigatório' })
    .transform((val) => clean(val))
    .refine((val) => val.length === 9, {
      message: 'O código deve ter 9 caracteres',
    }),
});

export type CodeVerifyFormData = z.infer<typeof codeVerifySchema>;
