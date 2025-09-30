// /home/vinny/isomorphic/isomorphic-dev/isomorphic/apps/isomorphic-starter/src/app/(hydrogen)/user/transfer/log/[id]/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import Link from 'next/link'

type Beneficiary = {
  account_name?: string | null
  account_number?: string | null
  pix_key_type?: string | null
  pix_key?: string | null
}
type Bank = { name?: string | null }
type Transfer = {
  id: number
  trx?: string | null
  status?: number | null // 0=pending, 1=completed, 2=rejected
  amount?: number | string | null
  created_at?: string | null
  pix_description?: string | null
  beneficiary?: Beneficiary | null
  bank?: Bank | null
}
type ApiResponse = {
  pageTitle?: string
  transfer?: Transfer | null
  user?: {
    razao_social?: string | null
    firstname?: string | null
    lastname?: string | null
  } | null
}

function currencyBRL(v: any) {
  const n = Number(v ?? 0)
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
  } catch {
    return `R$ ${isNaN(n) ? '0,00' : n.toFixed(2)}`
  }
}
function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? String(iso) : d.toLocaleString('pt-BR')
}

export default async function TransferReceiptPage({
  params,
}: {
  // 👇 Ajuste para o tipo esperado pelo projeto (params como Promise)
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  if (!session) return <p className="p-6">Você precisa estar logado.</p>

  const token = (session.user as any)?.accessToken as string
  const API_BASE = env.NEXT_PUBLIC_API_BASE_URL
  // const WEB_BASE = env.NEXT_PUBLIC_WEB_BASE_URL
  const WEB_BASE = "NEXT_PUBLIC_WEB_BASE_URL"

  // GET /api/transfer/log/{id} -> { pageTitle, transfer, user }
  const res = await fetch(`${API_BASE}/transfer/log/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Comprovante</h1>
        <p className="text-sm text-red-600">Falha ao carregar comprovante ({res.status}).</p>
        <Link href="/user/transfer/log" className="text-blue-600 underline mt-3 inline-block">
          Voltar ao histórico
        </Link>
      </div>
    )
  }

  const { transfer, user }: ApiResponse = await res.json()
  if (!transfer) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Comprovante</h1>
        <p className="text-sm text-gray-600">Transferência não encontrada.</p>
        <Link href="/user/transfer/log" className="text-blue-600 underline mt-3 inline-block">
          Voltar ao histórico
        </Link>
      </div>
    )
  }

  const completed = Number(transfer.status ?? 0) === 1
  const userName =
    user?.razao_social ||
    `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim() ||
    'Usuário'

  return (
    <div className="p-6">
      {/* Breadcrumb simples: Pagar / Comprovante */}
      <div className="text-sm text-gray-600 mb-6">
        <span className="text-gray-500">Pagar</span>
        <span className="mx-2">/</span>
        <span className="font-medium">Comprovante</span>
      </div>

      <div className="bg-white border rounded p-5 max-w-3xl">
        <div className="text-2xl font-medium mt-2 text-center">
          {completed ? 'Comprovante de transferência' : 'Pendência de transferência'}
        </div>

        <div className="flex items-center justify-center mt-4">
          {/* Link para download no site clássico/laravel (ajuste se a rota for diferente) */}
          <a
            className="btn btn-primary text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            href={`${WEB_BASE}/user/transfer/log/${transfer.id}/download`}
            target="_blank"
          >
            Baixar comprovante
          </a>
        </div>

        <div className="flex border-b border-slate-200 mb-2 pb-2 mt-4">
          <p className="text-gray-700 mx-auto font-medium">
            Olá {userName}, sua transferência de {currencyBRL(transfer.amount)}{' '}
            {completed ? 'foi paga!' : 'está aguardando aprovação!'}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex">
            <div>Pagador</div>
            <div className="ml-auto font-semibold">{userName}</div>
          </div>

          <div className="flex">
            <div>Favorecido</div>
            <div className="ml-auto font-semibold">
              {transfer.beneficiary?.account_name ?? 'Não informado'}
            </div>
          </div>

          {transfer.beneficiary?.pix_key_type && (
            <div className="flex">
              <div>Chave PIX</div>
              <div className="ml-auto font-semibold">
                {transfer.beneficiary?.pix_key ?? 'Não informado'}
              </div>
            </div>
          )}

          <div className="flex">
            <div>Valor</div>
            <div className="ml-auto font-semibold">{currencyBRL(transfer.amount ?? 0)}</div>
          </div>

          <div className="flex">
            <div>Descrição</div>
            <div className="ml-auto font-semibold">{transfer.pix_description ?? ''}</div>
          </div>

          <div className="flex">
            <div>Data Pagamento</div>
            <div className="ml-auto font-semibold">{fmtDate(transfer.created_at)}</div>
          </div>

          <div className="flex">
            <div>Transferência cod.</div>
            <div className="ml-auto font-semibold">{transfer.trx ?? '—'}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/user/transfer/log" className="text-blue-600 underline">
          Voltar ao histórico
        </Link>
      </div>

      <style>{`
        .btn { display:inline-flex; align-items:center; justify-content:center; }
        .btn-primary { background:#1d4ed8; }
        .btn-primary:hover { background:#1e40af; }
      `}</style>
    </div>
  )
}
