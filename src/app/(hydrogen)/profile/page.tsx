// src/app/(hydrogen)/profile/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import ProfileForm from './ProfileForm'
import { env } from '@/env.mjs'
import React from 'react'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  const token = (session.user as any)?.accessToken as string
  // Endpoint GET que retorna { user, beneficiary } (ex.: UserController@profile)
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/profile-setting`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Erro ao carregar perfil')
  }
  const { user, beneficiary } = await res.json()

  // Mapeia p/ o formulário (mantém nomes PT no UI; back recebe nomes EN/underscored)
  const initialData = {
    // UI
    primeiroNome: user?.firstname ?? '',
    sobrenome: user?.lastname ?? '',
    email: user?.email ?? '',
    tipoPessoa: user?.tipo_pessoa ?? '', // desabilitado (só exibição opcional)
    cpfCnpj: user?.document_number ?? '', // só exibição opcional

    // Bancários (segundo o Blade)
    nomeBanco: beneficiary?.bank_name ?? '',
    tipoConta: beneficiary?.short_name ?? 'CONTA_CORRENTE',
    nomeCompleto: beneficiary?.account_name ?? `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim(),
    cpfCnpjConta: beneficiary?.cpf_cnpj ?? '',
    agencia: beneficiary?.bank_branch ?? '',
    numeroConta: beneficiary?.account_number ?? '',
    digitoConta: beneficiary?.account_digit?.toString?.() ?? '',

    // PIX
    tipoChave: beneficiary?.pix_key_type ?? '',
    chavePix: beneficiary?.pix_key ?? '',

    // Imagem
    imageUrl: user?.image ?? null,

    // Controle
    liberado_dados_bancarios: Boolean(user?.liberado_dados_bancarios),
  }

  return <ProfileForm initialData={initialData} apiBaseUrl={env.NEXT_PUBLIC_API_BASE_URL} token={token} />
}
