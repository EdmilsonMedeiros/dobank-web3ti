// src/app/(hydrogen)/user/transfer/log/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import TransferLogForm from './TransferLogForm'

export default async function TransferLogPage({
  searchParams,
}: {
  searchParams?: { page?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) return <p>Você precisa estar logado.</p>

  const token = (session.user as any)?.accessToken as string
  const apiUrl = new URL(`${env.NEXT_PUBLIC_API_BASE_URL}/transfer/log`)
  // (se um dia quiser paginação server-side, encaminhe page/per_page aqui)
  if (searchParams?.page) apiUrl.searchParams.set('page', searchParams.page)

  const res = await fetch(apiUrl.toString(), {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    return <p>Falha ao carregar dados de transferências ({res.status}).</p>
  }

  const data = await res.json()

  // Estrutura esperada pela sua API de exemplo
  const {
    pageTitle,
    emptyMessage,
    ownBeneficiaries,
    otherBeneficiaries,
    otherBanks,
    pix,
    gateway,
    myUserBeneficiary,
    jobLogs,
  } = data || {}

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{pageTitle ?? 'Transfer History'}</h1>

      <TransferLogForm
        emptyMessage={emptyMessage ?? 'No transfer yet'}
        ownBeneficiaries={ownBeneficiaries}
        otherBeneficiaries={otherBeneficiaries}
        otherBanks={otherBanks}
        pix={pix}
        gateway={gateway}
        myUserBeneficiary={myUserBeneficiary}
        jobLogs={jobLogs ?? []}
      />
    </div>
  )
}
