// src/validators/contapj1.schema.ts
import { z } from 'zod';

export const contapj1Schema = z.object({
  preCadastroId: z.number(),
  razaoSocial: z.string().min(1, { message: 'Razão Social é obrigatória' }),
  nomeFantasia: z.string().min(1, { message: 'Nome Fantasia é obrigatória' }),
  numeroCNPJ: z.string().min(14, { message: 'CNPJ inválido' }),
  numeroCPF: z.string().min(11, { message: 'CPF inválido' }),
  nomeResponsavel: z.string().min(1, { message: 'Nome do responsável é obrigatório' }),
  sobrenomeResponsavel: z.string().min(1, { message: 'Sobrenome do responsável é obrigatório' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  country: z.string().min(1, { message: 'País é obrigatório' }),         // <-- adicionado
  country_code: z.string().min(1, { message: 'Código de país obrigatório' }),
  mobile_code: z.string(),
  telefone: z.string().min(8, { message: 'Telefone inválido' }),
});

export type Contapj1FormData = z.infer<typeof contapj1Schema>;
