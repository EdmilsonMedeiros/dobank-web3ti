// src/app/(hydrogen)/user/transfer/pix/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import PixTransfer from './PixTransfer'

function toNum(v: any, fallback = 0) {
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : fallback
}

export default async function PixTransferPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  const token = (session.user as any)?.accessToken as string

  // GET da API (igual ao profile page: usa env + Bearer)
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/transfer/pix`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Erro ao carregar dados do PIX')
  }
  const data = await res.json()

  // ------- Map mínimo para o componente -------
  const user = {
    id: Number(data?.user?.id ?? 0),
    name: `${data?.user?.firstname ?? ''} ${data?.user?.lastname ?? ''}`.trim() || data?.user?.username || '—',
    balance: toNum(data?.user?.balance, 0),
    transferencia_pix_planilha: !!data?.user?.transferencia_pix_planilha,
    negociated_pix_payment: !!data?.user?.negociated_pix_payment,
    pix_fixed_charge: toNum(data?.user?.pix_fixed_charge, 0),
    pix_percent_charge: toNum(data?.user?.pix_percent_charge, 0),
    my_user_beneficiarie_id: Number(data?.user?.my_user_beneficiarie_id ?? 0),
  }

  const gateway = {
    fixed_charge: toNum(data?.gateway?.fixed_charge, 0),
    percent_charge: toNum(data?.gateway?.percent_charge, 0),
  }

  const pix = {
    minimum_limit: toNum(data?.pix?.minimum_limit, 0),
    maximum_limit: toNum(data?.pix?.maximum_limit, 0),
  }

  // Beneficiário próprio (a API pode não embutir o objeto 'bank'; preencho limites com os do PIX)
  const myUserBeneficiary = data?.myUserBeneficiary
    ? {
        id: Number(data.myUserBeneficiary.id),
        account_name: data.myUserBeneficiary.account_name ?? '—',
        bank: {
          name: data?.myUserBeneficiary?.bank?.name ?? '—',
          minimum_limit: pix.minimum_limit,
          maximum_limit: pix.maximum_limit,
          daily_maximum_limit: toNum(data?.myUserBeneficiary?.bank?.daily_maximum_limit, 0),
          monthly_maximum_limit: toNum(data?.myUserBeneficiary?.bank?.monthly_maximum_limit, 0),
          daily_total_transaction: Number(data?.myUserBeneficiary?.bank?.daily_total_transaction ?? 0),
          monthly_total_transaction: Number(data?.myUserBeneficiary?.bank?.monthly_total_transaction ?? 0),
        },
      }
    : null

  const otherBeneficiaries = Array.isArray(data?.otherBeneficiaries?.data)
    ? data.otherBeneficiaries.data.map((b: any) => ({
        id: Number(b.id),
        bank: {
          name: b?.bank?.name ?? '—',
          minimum_limit: toNum(b?.bank?.minimum_limit, pix.minimum_limit),
          maximum_limit: toNum(b?.bank?.maximum_limit, pix.maximum_limit),
          daily_maximum_limit: toNum(b?.bank?.daily_maximum_limit, 0),
          monthly_maximum_limit: toNum(b?.bank?.monthly_maximum_limit, 0),
          daily_total_transaction: Number(b?.bank?.daily_total_transaction ?? 0),
          monthly_total_transaction: Number(b?.bank?.monthly_total_transaction ?? 0),
        },
        pix_key_type: b?.pix_key_type ?? undefined,
        pix_key: b?.pix_key ?? undefined,
        account_name: b?.account_name ?? undefined,
        account_number: b?.account_number ?? undefined,
      }))
    : []

  const jobLogs = Array.isArray(data?.jobLogs) ? data.jobLogs : []

  const otherBanks = Array.isArray(data?.otherBanks)
    ? data.otherBanks.map((bk: any) => ({
        code: bk?.code ?? undefined,
        ispb: bk?.ispb ?? undefined,
        name: bk?.name ?? '—',
      }))
    : []

  // Config de moeda (igual ao mock)
  const langToMoney = { decimal: ',', thousands: '.', precision: 2, prefix: 'R$ ' }

  // Lógica OTP: usaremos fluxo de ação+verificação por Email (verification: 2)
  const otpEnabled = true

  return (
    <PixTransfer
      apiBaseUrl={env.NEXT_PUBLIC_API_BASE_URL}
      token={token}
      user={user}
      gateway={gateway}
      pix={pix}
      myUserBeneficiary={
        myUserBeneficiary ?? {
          id: 0,
          account_name: '—',
          bank: {
            name: '—',
            minimum_limit: pix.minimum_limit,
            maximum_limit: pix.maximum_limit,
            daily_maximum_limit: 0,
            monthly_maximum_limit: 0,
            daily_total_transaction: 0,
            monthly_total_transaction: 0,
          },
        }
      }
      otherBeneficiaries={otherBeneficiaries}
      jobLogs={jobLogs}
      otherBanks={otherBanks}
      langToMoney={langToMoney}
      otpEnabled={otpEnabled}
    />
  )
}
