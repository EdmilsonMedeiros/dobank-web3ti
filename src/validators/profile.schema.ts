// src/validators/profile.schema.ts
import { z } from 'zod'

/**
 * Mesma lógica do Blade:
 * - Sempre obrigatórios: primeiroNome, sobrenome
 * - Campos bancários/PIX só exigidos quando liberado_dados_bancarios = false
 * - pix_key (chavePix) NÃO é obrigatória no Blade; apenas tipoChave tinha "required"
 */
export const makeProfileSchema = (liberado: boolean) => {
  const base = z.object({
    primeiroNome: z.string().min(1, 'Primeiro nome é obrigatório'),
    sobrenome: z.string().min(1, 'Sobrenome é obrigatório'),

    // Apenas exibição (não enviados)
    email: z.string().optional(),
    tipoPessoa: z.string().optional(),
    cpfCnpj: z.string().optional(),

    // Bancários / PIX (validação condicional)
    nomeBanco: z.string().optional(),
    tipoConta: z.enum(['CONTA_CORRENTE', 'CONTA_POUPANCA', 'CONTA_PAGAMENTO', 'CONTA_FACIL', 'ENTIDADES_PUBLICAS']).or(z.literal('')).optional(),
    nomeCompleto: z.string().optional(),
    cpfCnpjConta: z.string().optional(),
    agencia: z.string().optional(),
    numeroConta: z.string().optional(),
    digitoConta: z.string().optional(),

    tipoChave: z.enum(['CPF', 'CNPJ', 'TELEFONE', 'EMAIL', 'CHAVE_ALEATORIA']).or(z.literal('')).optional(),
    chavePix: z.string().optional(),
  })

  if (liberado) {
    // Quando edição está bloqueada, não exigir nada além dos nomes
    return base
  }

  // Quando edição está liberada, exigir os mesmos campos que o Blade marcava com required
  return base.superRefine((val, ctx) => {
    const req = <K extends keyof typeof val>(k: K, msg: string) => {
      if (!val[k] || String(val[k]).trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [k], message: msg })
      }
    }
    req('tipoConta', 'Tipo de conta é obrigatório')
    req('nomeCompleto', 'Nome completo é obrigatório')
    req('cpfCnpjConta', 'CPF/CNPJ é obrigatório')
    req('agencia', 'Agência é obrigatória')
    req('numeroConta', 'Número da conta é obrigatório')
    req('digitoConta', 'Dígito da conta é obrigatório')
    // No Blade, pix_key_type tinha required; pix_key não.
    req('tipoChave', 'Tipo de chave PIX é obrigatório')
  })
}

export type ProfileFormValues = z.infer<ReturnType<typeof makeProfileSchema>>
