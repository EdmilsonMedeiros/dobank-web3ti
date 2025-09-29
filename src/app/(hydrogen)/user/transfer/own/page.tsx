// src/app/(hydrogen)/user/transfer/own/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import TransferOwn from './TransferOwn'
import React from 'react'

type BeneficiaryRow = {
  id: number
  account_number: string
  account_name: string
}

type Paged<T> = {
  current_page: number
  data: T[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: { url: string | null; label: string; active: boolean }[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

type OwnApiResponse = {
  pageTitle: string
  emptyMessage: string
  ownBeneficiaries: Paged<BeneficiaryRow>
  dobankRecents: BeneficiaryRow[]
}

const emptyPaged: Paged<BeneficiaryRow> = {
  current_page: 1,
  data: [],
  first_page_url: '',
  from: null,
  last_page: 1,
  last_page_url: '',
  links: [],
  next_page_url: null,
  path: '',
  per_page: 15,
  prev_page_url: null,
  to: null,
  total: 0,
}

export default async function TransferOwnPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  const token = (session.user as any)?.accessToken as string
  const apiBaseUrl = env.NEXT_PUBLIC_API_BASE_URL

  const res = await fetch(`${apiBaseUrl}/transfer/own`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    // Mantemos uma UI funcional mesmo com falha de listagem
    const fallback: OwnApiResponse = {
      pageTitle: 'Transfer Money',
      emptyMessage: 'No registered beneficiary yet',
      ownBeneficiaries: emptyPaged,
      dobankRecents: [],
    }
    return (
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold">{fallback.pageTitle}</h1>
          <p className="text-sm text-red-600 mt-2">Não foi possível carregar a lista.</p>
        </div>
        <div className="p-6">
          <TransferOwn
            token={token}
            apiBaseUrl={apiBaseUrl}
            emptyMessage={fallback.emptyMessage}
            ownBeneficiaries={fallback.ownBeneficiaries}
            dobankRecents={fallback.dobankRecents}
          />
        </div>
      </div>
    )
  }

  const data = (await res.json()) as Partial<OwnApiResponse>
  const pageTitle = data.pageTitle ?? 'Transfer Money'
  const emptyMessage = data.emptyMessage ?? 'No registered beneficiary yet'
  const ownBeneficiaries = (data.ownBeneficiaries as Paged<BeneficiaryRow>) ?? emptyPaged
  const dobankRecents = Array.isArray(data.dobankRecents) ? data.dobankRecents : []

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>
      <div className="p-6">
        <TransferOwn
          token={token}
          apiBaseUrl={apiBaseUrl}
          emptyMessage={emptyMessage}
          ownBeneficiaries={ownBeneficiaries}
          dobankRecents={dobankRecents}
        />
      </div>
    </div>
  )
}
