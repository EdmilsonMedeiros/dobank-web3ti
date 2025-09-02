// src/app/(hydrogen)/user/apis/page.tsx
import React from 'react'
import ApiForm from './ApiForm'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'

function moneyBRL(v: unknown) {
  const n = Number(String(v).replace(',', '.'))
  if (Number.isNaN(n)) return 'R$ 0,00'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function percentBR(v: unknown) {
  const n = Number(String(v).replace(',', '.'))
  if (Number.isNaN(n)) return '0,00%'
  return `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

export default async function UserApisPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  const token = session.user.accessToken as string

  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/apis`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Erro ao carregar APIs')
  }

  type ApiResponse = {
    pageTitle: string
    user: any
    general_settings: any
  }
  const { user, general_settings }: ApiResponse = await res.json()

  // ----------------------
  // Lógica do Blade (recebimentos): se negociado usa user, senão usa general_settings
  // ----------------------
  const isNegRec = !!user?.negociated_api_deposit
  const pixMin = isNegRec ? user?.api_pix_range_min : general_settings?.api_pix_range_min
  const pixMax = isNegRec ? user?.api_pix_range_max : general_settings?.api_pix_range_max
  const pixFixed = isNegRec ? user?.api_pix_fixed_charge : general_settings?.api_pix_fixed_charge
  const pixIssue = isNegRec ? user?.api_pix_issue_charge : general_settings?.api_pix_issue_charge
  const pixPercent = isNegRec ? user?.api_pix_percent_charge : general_settings?.api_pix_percent_charge

  const btcMin = isNegRec ? user?.api_btc_range_min : general_settings?.api_btc_range_min
  const btcMax = isNegRec ? user?.api_btc_range_max : general_settings?.api_btc_range_max
  const btcFixed = isNegRec ? user?.api_btc_fixed_charge : general_settings?.api_btc_fixed_charge
  const btcPercent = isNegRec ? user?.api_btc_percent_charge : general_settings?.api_btc_percent_charge

  // Pagamentos (Blade mostra direto do user)
  const pgPercent = user?.api_pix_percent_charge_pg
  const pgFixed = user?.api_pix_fixed_charge_pg
  const pgMinDay = user?.api_pix_min_pg_day
  const pgMaxDay = user?.api_pix_max_pg_day
  const pgMinNight = user?.api_pix_min_pg_night
  const pgMaxNight = user?.api_pix_max_pg_night

  // Avatar
  const avatarUrl =
    user?.image && typeof user.image === 'string' && user.image.length > 3
      ? user.image
      : 'https://isomorphic-furyroad.s3.amazonaws.com/public/avatars/avatar-11.webp'

  // Módulos
  let otpEmailEnabled = true
  try {
    const modules = JSON.parse(general_settings?.modules ?? '{}')
    otpEmailEnabled = !!modules?.otp_email
  } catch {
    otpEmailEnabled = true
  }

  // Termo (resumo)
  const termoHtml = `
    <h1>APIs Dobank</h1>
    <h2>Termo de Consentimento Compartilhamento dos dados</h2>
    <p><strong>Última Atualização:</strong> 06 de Junho de 2023</p>
    <p>Esta Política descreve as condições de uso das APIs e o compartilhamento com a Transfeera.</p>
    <p>As requisições são via HTTPS com Token no header e retornos em JSON.</p>
  `

  const initialData = {
    apiBaseUrl: env.NEXT_PUBLIC_API_BASE_URL,
    authToken: token,
    userId: Number(user?.id ?? 0),

    avatarUrl,
    docsUrl: '/docs',
    pagamentosHabilitado: !!user?.api_enabled_pg,
    otpEmailEnabled,

    recebimentos: {
      taxas: {
        pixMin: moneyBRL(pixMin),
        pixMax: moneyBRL(pixMax),
        pixTaxaFixa: moneyBRL(pixFixed),
        pixTaxaQrCode: moneyBRL(pixIssue),
        pixTaxaPercentual: percentBR(pixPercent),
        btcMin: moneyBRL(btcMin),
        btcMax: moneyBRL(btcMax),
        btcTaxaFixa: moneyBRL(btcFixed),
        btcTaxaPercentual: percentBR(btcPercent),
      },
      // Não enviamos o token de recebimento para o client por segurança.
      token: null,
      autorizacaoSelecionada: 'Email' as const,
      webhookUrl: user?.webhook_url ?? 'https://',
      tipoCobranca: (user?.api_tipo_cobranca ?? 'descontar') as 'descontar' | 'adicionar',
    },

    pagamentos: {
      taxas: {
        taxaPercentual: percentBR(pgPercent),
        taxaFixa: moneyBRL(pgFixed),
        minDiario: moneyBRL(pgMinDay),
        maxDiario: moneyBRL(pgMaxDay),
        minNoturno: moneyBRL(pgMinNight),
        maxNoturno: moneyBRL(pgMaxNight),
      },
      token: user?.api_token_pg ?? null,
      autorizacaoSelecionada: 'Email' as const,
      webhookUrl: user?.webhook_url_pagamento ?? 'https://',
    },

    termoHtml,
  }

  return <ApiForm initialData={initialData} />
}
