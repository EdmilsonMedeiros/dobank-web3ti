// src/validators/resetPassword.schema.ts
import { z } from 'zod';

const cleanCode = (s: string) => s.replace(/\W/gi, '').toUpperCase();

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'E-mail é obrigatório' })
      .email({ message: 'E-mail inválido' }),
    code: z
      .string()
      .min(1, { message: 'Código é obrigatório' })
      .transform((v) => cleanCode(v))
      .refine((v) => v.length === 9, {
        message: 'O código deve ter 9 caracteres',
      }),
    password: z
      .string()
      .min(7, { message: 'A senha deve ter no mínimo 7 caracteres' })
      .refine((v) => /[a-z]/.test(v), {
        message: 'A senha precisa ter pelo menos 1 letra minúscula',
      })
      .refine((v) => /[A-Z]/.test(v), {
        message: 'A senha precisa ter pelo menos 1 letra maiúscula',
      })
      .refine((v) => /[0-9]/.test(v), {
        message: 'A senha precisa ter pelo menos 1 número',
      })
      .refine((v) => /[!@#$%^&*()_\-+={[}\]|\\:;"'<>,.?/~`]/.test(v), {
        message: 'A senha precisa ter pelo menos 1 caractere especial',
      }),
    password_confirmation: z
      .string()
      .min(1, { message: 'Confirmação de senha é obrigatória' }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não conferem',
    path: ['password_confirmation'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
