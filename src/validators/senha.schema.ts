// src/validators/senha.schema.ts
import { z } from 'zod';

export const senhaSchema = z
  .object({
    preCadastroId: z.number(),
    password: z
      .string()
      .min(6, { message: 'Senha deve ter ao menos 6 caracteres' })
      .refine((v) => /[A-Z]/.test(v), {
        message: 'Senha deve conter letra maiúscula',
      })
      .refine((v) => /[a-z]/.test(v), {
        message: 'Senha deve conter letra minúscula',
      })
      .refine((v) => /\d/.test(v), { message: 'Senha deve conter número' })
      .refine(
        (v) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v),
        { message: 'Senha deve conter caractere especial' }
      ),
    password_confirmation: z.string(),
    // agora são booleanos
    PLDFT_term: z
      .boolean()
      .refine((v) => v === true, {
        message: 'Você precisa concordar com a Política da Empresa',
      }),
    privacy_term: z
      .boolean()
      .refine((v) => v === true, {
        message: 'Você precisa concordar com a Política de Privacidade',
      }),
    use_term: z
      .boolean()
      .refine((v) => v === true, {
        message: 'Você precisa concordar com os Termos de Serviço',
      }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Senhas não conferem',
    path: ['password_confirmation'],
  });

export type SenhaFormData = z.infer<typeof senhaSchema>;
