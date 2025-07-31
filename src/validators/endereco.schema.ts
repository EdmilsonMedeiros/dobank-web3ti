// src/validators/endereco.schema.ts
import { z } from 'zod';

export const enderecoSchema = z.object({
  preCadastroId: z.number(),
  zip: z.string().min(1, { message: 'CEP é obrigatório' }),
  city: z.string().min(1, { message: 'Cidade é obrigatória' }),
  uf: z.string().min(1, { message: 'UF é obrigatória' }),
  address: z.string().min(1, { message: 'Endereço é obrigatório' }),
  address_number: z.string().min(1, { message: 'Número é obrigatório' }),
  address_complement: z.string().optional(),
  district: z.string().min(1, { message: 'Bairro é obrigatório' }),
});

export type EnderecoFormData = z.infer<typeof enderecoSchema>;
