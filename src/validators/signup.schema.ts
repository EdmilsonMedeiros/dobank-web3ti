import { z } from 'zod';
import { messages } from '@/config/messages';

// Validações customizadas (se ainda quiser usar):
// import {
//   validateEmail,
//   validatePassword,
//   validateConfirmPassword,
// } from './common-rules';

export const signUpSchema = z.object({
  razaoSocial: z.string().min(1, { message: 'Razão Social é obrigatória' }),
  nomeFantasia: z.string().min(1, { message: 'Nome Fantasia é obrigatória' }),
  cnpj: z
    .string()
    .min(14, { message: 'CNPJ deve ter ao menos 14 caracteres' }), // Idealmente você pode usar uma lib de CNPJ válida
  cpf: z
    .string()
    .min(11, { message: 'CPF deve ter ao menos 11 caracteres' }),
  nomeResponsavel: z
    .string()
    .min(1, { message: 'Nome do responsável é obrigatório' }),
  sobrenomeResponsavel: z
    .string()
    .min(1, { message: 'Sobrenome é obrigatório' }),
  email: z
    .string()
    .email({ message: 'E-mail inválido' }),
  pais: z.string().min(1, { message: 'País é obrigatório' }),
  ddi: z.string().optional(), // como está desabilitado no input
  telefone: z
    .string()
    .min(8, { message: 'Telefone inválido' }),
  isAgreed: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Você precisa aceitar os termos',
    }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
