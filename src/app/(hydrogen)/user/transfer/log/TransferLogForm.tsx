// /home/vinny/isomorphic/isomorphic-dev/isomorphic/apps/isomorphic-starter/src/app/(hydrogen)/user/transfer/log/TransferLogForm.tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

type Paginator<T> = {
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

type JobLog = {
  id: number | string
  trx?: string | null
  created_at?: string | null
  amount?: number | string | null
  status?: 0 | 1 | 2 | number | null
  bank_name?: string | null
  beneficiary?: {
    account_name?: string | null
    account_number?: string | null
    pix_key?: string | null
    pix_key_type?: string | null
  } | null
  account_name?: string | null
  account_number?: string | null
  pix_key?: string | null
  pix_key_type?: string | null
  bank?: string | null
}

function currencyBRL(v: any) {
  const n = Number(v ?? 0)
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
  } catch {
    return `R$ ${isNaN(n) ? '0,00' : n.toFixed(2)}`
  }
}

function dateBR(iso?: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? String(iso) : d.toLocaleString('pt-BR')
}

function StatusBadge({ s }: { s?: number | null }) {
  const v = typeof s === 'number' ? s : Number(s ?? 0)
  if (v === 1) return <span className="badge px-2 py-1 rounded text-sm bg-green-100 text-green-700">Completed</span>
  if (v === 0) return <span className="badge px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-700">Pending</span>
  return <span className="badge px-2 py-1 rounded text-sm bg-red-100 text-red-700">Rejected</span>
}

function pageFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    return u.searchParams.get('page')
  } catch {
    const match = url.match(/[?&]page=(\d+)/)
    return match?.[1] ?? null
  }
}

export default function TransferLogForm(props: {
  emptyMessage: string
  transfers?: Paginator<JobLog> | null
}) {
  // Paginator seguro (fallback)
  const emptyPaginator: Paginator<JobLog> = {
    current_page: 1,
    data: [],
    first_page_url: '',
    from: 0,
    last_page: 1,
    last_page_url: '',
    links: [],
    next_page_url: null,
    path: '',
    per_page: 10,
    prev_page_url: null,
    to: 0,
    total: 0,
  }

  const transfers = props.transfers ?? emptyPaginator
  const emptyMessage = props.emptyMessage

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page') ?? transfers.current_page ?? 1)

  const [search, setSearch] = React.useState('')

  const list = React.useMemo(() => (transfers.data ?? []) as JobLog[], [transfers])
  const filtered = React.useMemo(() => {
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter((r) => {
      const fields = [
        r.trx,
        r.account_name ?? r.beneficiary?.account_name,
        r.account_number ?? r.beneficiary?.account_number,
        r.pix_key ?? r.beneficiary?.pix_key,
        r.pix_key_type ?? r.beneficiary?.pix_key_type,
        r.bank ?? r.bank_name,
      ]
        .filter(Boolean)
        .map(String)
        .join(' ')
        .toLowerCase()
      return fields.includes(q)
    })
  }, [list, search])

  const makeLocalPageHref = (page: string | number | null) => {
    const p = String(page ?? '')
    if (!p) return '#'
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('page', p)
    return `${pathname}?${params.toString()}`
  }

  const headerCls = 'text-sm font-semibold text-gray-800 mb-2'
  const cell = 'px-3 py-2'
  const th = 'text-left px-3 py-2 bg-gray-50 text-sm'

  return (
    <div className="space-y-6">
      {/* Ações + busca */}
      <section className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex gap-2">
          <button
            className="btn px-3 py-2 border rounded text-sm"
            onClick={() => {
              const txt = JSON.stringify(list, null, 2)
              navigator.clipboard.writeText(txt)
            }}
          >
            Copiar Dados
          </button>
          <button
            className="btn px-3 py-2 border rounded text-sm"
            onClick={() => {
              const header = ['#','TRX','Data','Account Name','Account Number','Bank','Amount','Status']
              const rows = (filtered || []).map((r, i) => [
                (transfers.from ?? 0) + i,
                r.trx ?? '',
                dateBR(r.created_at),
                r.account_name ?? r.beneficiary?.account_name ?? '',
                r.account_number ?? r.beneficiary?.account_number ?? r.pix_key ?? r.beneficiary?.pix_key ?? '',
                r.bank ?? r.bank_name ?? '',
                r.amount ?? '',
                r.status ?? '',
              ])
              const csv = [header, ...rows].map(a => a.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `transfer-history-p${currentPage}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            Exportar para Excel
          </button>
          <button
            className="btn px-3 py-2 border rounded text-sm"
            onClick={() => window.print()}
          >
            Exportar para PDF
          </button>
        </div>

        <div className="md:ml-auto">
          <input
            className="border rounded px-3 py-2 text-sm w-64"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Tabela */}
      <section className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className={th}>#</th>
              <th className={th}>TRX</th>
              <th className={th}>Data</th>
              <th className={th}>Account Name</th>
              <th className={th}>Account Number</th>
              <th className={th}>Bank</th>
              <th className={th}>Amount</th>
              <th className={th}>Status</th>
              <th className={th}>Comprovante</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="text-center text-gray-600 py-6" colSpan={9}>{emptyMessage}</td>
              </tr>
            ) : filtered.map((r, i) => {
              const name = r.account_name ?? r.beneficiary?.account_name ?? r.pix_key_type ?? 'N/A'
              const numberOrPix =
                r.account_number ?? r.beneficiary?.account_number ??
                r.pix_key ?? r.beneficiary?.pix_key ?? 'N/A'
              const bankName = r.bank ?? r.bank_name ?? '—'
              const statusNum = typeof r.status === 'number' ? r.status : Number(r.status ?? 0)
              const rowIndex = (transfers.from ?? 0) + i

              return (
                <tr key={String(r.id)} className="border-t">
                  <td className={cell}>{rowIndex}</td>
                  <td className={cell}>{r.trx ?? '—'}</td>
                  <td className={cell}>{dateBR(r.created_at)}</td>
                  <td className={`${cell} truncate`}>{name}</td>
                  <td className={cell}>{numberOrPix}</td>
                  <td className={cell}>{bankName}</td>
                  <td className={cell}>{currencyBRL(r.amount ?? 0)}</td>
                  <td className={cell}><StatusBadge s={statusNum} /></td>
                  <td className={cell}>
                    {statusNum === 1 ? (
                      <Link
                        href={`/user/transfer/log/${r.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded inline-block"
                      >
                        Ver
                      </Link>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      {/* Rodapé: paginação e resumo */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <span className="text-gray-600">
          Exibindo {transfers.from ?? 0} - {transfers.to ?? 0} de {transfers.total ?? 0} resultados
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* Prev */}
          <Link
            href={transfers.prev_page_url ? makeLocalPageHref(pageFromUrl(transfers.prev_page_url)) : '#'}
            aria-disabled={!transfers.prev_page_url}
            className={`px-3 py-1 border rounded text-sm ${!transfers.prev_page_url ? 'opacity-50 pointer-events-none' : ''}`}
          >
            « Anterior
          </Link>

          {/* Números */}
          {(transfers.links ?? [])
            .filter(l => l.label && !isNaN(Number(l.label)))
            .map((l, idx) => {
              const page = pageFromUrl(l.url) ?? l.label
              const href = makeLocalPageHref(page)
              return (
                <Link
                  key={`${l.label}-${idx}`}
                  href={href}
                  className={`px-3 py-1 border rounded text-sm ${l.active ? 'bg-gray-800 text-white border-gray-800' : ''}`}
                >
                  {l.label}
                </Link>
              )
            })
          }

          {/* Next */}
          <Link
            href={transfers.next_page_url ? makeLocalPageHref(pageFromUrl(transfers.next_page_url)) : '#'}
            aria-disabled={!transfers.next_page_url}
            className={`px-3 py-1 border rounded text-sm ${!transfers.next_page_url ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Próxima »
          </Link>
        </div>
      </section>

      <style>{`
        .badge { display:inline-flex; align-items:center; }
        .btn { display:inline-flex; align-items:center; justify-content:center; }
      `}</style>
    </div>
  )
}
