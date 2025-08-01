// src/app/(hydrogen)/profile/page.tsx
import ProfileForm from './ProfileForm'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import React from 'react'

export default async function ProfilePage() {
  // 1️⃣ Garante que o usuário está logado
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  const token = session.user.accessToken
  const res = await fetch(
    `${env.NEXT_PUBLIC_API_BASE_URL}/profile-setting`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  )
  if (!res.ok) {
    throw new Error('Erro ao buscar perfil')
  }

  const { user, beneficiary } = await res.json()

  // 2️⃣ Mapeia o payload da API para o formato do formulário
  const cpfCnpjApi = user.kyc_data?.['cpf/cnpj']?.value ?? ''

  const initialData = {
    // Dados Pessoais
    primeiroNome: user.firstname,
    sobrenome: user.lastname,
    email: user.email,
    tipoPessoa:
      user.tipo_pessoa === 'pessoa_fisica'
        ? 'Pessoa Física'
        : 'Pessoa Jurídica',
    cpfCnpj: cpfCnpjApi,

    // Dados Bancários (padrão, cai no beneficiary)
    nomeBanco: beneficiary?.bank_name ?? '',
    tipoConta: 'CONTA_CORRENTE' as const,
    nomeCompleto:
      beneficiary?.account_name ?? `${user.firstname} ${user.lastname}`,
    cpfCnpjConta: beneficiary?.cpf_cnpj ?? '',
    agencia: beneficiary?.bank_branch ?? '',
    numeroConta: beneficiary?.account_number ?? '',
    digitoConta: String(beneficiary?.account_digit ?? ''),

    // Dados PIX
    tipoChave: beneficiary?.pix_key_type ?? 'CPF',
    chavePixCpf: beneficiary?.pix_key ?? '',

    // Imagem
    image: user.image,
  }

  // 3️⃣ Renderiza o formulário preenchido
  return <ProfileForm initialData={initialData} />
}
