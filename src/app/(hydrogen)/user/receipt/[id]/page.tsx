// /home/vinny/isomorphic/isomorphic-dev/isomorphic/apps/isomorphic-starter/src/app/(hydrogen)/user/receipt/[id]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import ReceiptView from './ReceiptView'

export const dynamic = 'force-dynamic'

type Address = {
  postal_code: string
  street: string
  number: string
  district: string
  city: string
  state: string
  complement: string
}

type Payer = {
  tax_id: string
  name: string
  trade_name?: string
  address: Address
}

type Receivable = {
  status: string | null
  amount: number // em centavos
  fine_type: 'fixed' | 'percentage' | null
  fine_amount: number | null // em centavos
  fine_percent: number | null
  interest_type:
    | 'fixed_per_day'
    | 'fixed_per_working_day'
    | 'percentage_per_month'
    | 'percentage_per_month_working_days'
    | null
  interest_amount: number | null // em centavos
  interest_percent: number | null
  description: string | null
  due_date: string // ISO
  expiration_date: string // ISO
}

type ApiPayload = {
  pageTitle: string
  id: number
  result: {
    payer: Payer
    receivables: Receivable[]
  }
}

export default async function ReceiptViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  if (!session) return <p>Você precisa estar logado.</p>

  const token = (session.user as any)?.accessToken as string

  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/receipt/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    const msg = (await res.json().catch(() => ({})))?.message ?? 'Erro ao carregar cobrança'
    throw new Error(msg)
  }

  const data = (await res.json()) as ApiPayload

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold">{data.pageTitle}</h1>
      </div>
      <div className="p-6">
        <ReceiptView id={data.id} result={data.result} />
      </div>
    </div>
  )
}
