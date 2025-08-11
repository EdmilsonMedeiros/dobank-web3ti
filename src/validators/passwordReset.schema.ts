// src/validators/passwordReset.schema.ts
import { z } from 'zod';

export const passwordResetSchema = z.object({
  type: z.enum(['email']),
  value: z.string()
    .min(1, { message: 'E-mail é obrigatório' })
    .email({ message: 'Formato de e-mail inválido' }),
  // captcha continua opcional até integrar o Recaptcha
  captcha: z.string().optional(),
});

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
