// /home/vinny/isomorphic/isomorphic-dev/isomorphic/apps/isomorphic-starter/src/app/(hydrogen)/user/transfer/log/TransferLogForm.tsx
'use client'

import * as React from 'react'

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

type Beneficiary = {
  id: number
  user_id?: number | null
  beneficiary_id?: number | null
  bank_id?: number | null
  account_number?: string | null
  account_name?: string | null
  short_name?: string | null
  details?: string | null
  created_at?: string
  updated_at?: string
  account_digit?: number | string | null
  email?: string | null
  cpf_cnpj?: string | null
  pix_key_type?: 'CPF'|'CNPJ'|'TELEFONE'|'EMAIL'|'CHAVE_ALEATORIA'|string|null
  pix_key?: string | null
  bank_branch?: string | null
}

type Bank = {
  id: number
  name: string
  code: number | null
  ispb: string | null
  minimum_limit: string
  maximum_limit: string
  daily_maximum_limit: string
  monthly_maximum_limit: string
  daily_total_transaction: number
  monthly_total_transaction: number
  fixed_charge: string
  percent_charge: string
  processing_time: string
  status: number
}

type PixSettings = {
  id: number
  name: string
  minimum_limit: string
  maximum_limit: string
  daily_maximum_limit: string
  monthly_maximum_limit: string
  fixed_charge: string
  percent_charge: string
  status: number
}

type Gateway = {
  id: number
  name: string
  currency: string
  symbol: string
  min_amount: string
  max_amount: string
  rate: string
  percent_charge: string
  fixed_charge: string
}

type JobLog = {
  // Estrutura não especificada – manter genérico e acessar com optional chaining
  id?: number | string
  trx?: string
  created_at?: string
  amount?: number | string
  status?: 0 | 1 | 2 | number
  bank_name?: string
  beneficiary?: {
    account_name?: string
    account_number?: string
    pix_key?: string
    pix_key_type?: string
  }
  receipt_url?: string | null
  // fallback de campos (se vierem com outros nomes do backend)
  account_name?: string
  account_number?: string
  pix_key?: string
  pix_key_type?: string
  bank?: string
}

function currencyBRL(v: any) {
  const n = Number(v ?? 0)
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
  } catch {
    return `R$ ${n.toFixed(2)}`
  }
}

function dateBR(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? String(iso) : d.toLocaleString('pt-BR')
}

function StatusBadge({ s }: { s?: number }) {
  if (s === 1) return <span className="badge px-2 py-1 rounded text-sm bg-green-100 text-green-700">Completed</span>
  if (s === 0) return <span className="badge px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-700">Pending</span>
  return <span className="badge px-2 py-1 rounded text-sm bg-red-100 text-red-700">Rejected</span>
}

export default function TransferLogForm(props: {
  emptyMessage: string
  ownBeneficiaries: Paginator<Beneficiary>
  otherBeneficiaries: Paginator<Beneficiary>
  otherBanks: Bank[]
  pix: PixSettings
  gateway: any
  myUserBeneficiary: Beneficiary | null
  jobLogs: JobLog[]
}) {
  const {
    emptyMessage,
    ownBeneficiaries,
    otherBeneficiaries,
    otherBanks,
    pix,
    gateway,
    myUserBeneficiary,
    jobLogs,
  } = props

  const [search, setSearch] = React.useState('')
  const filtered = React.useMemo(() => {
    if (!search) return jobLogs
    const q = search.toLowerCase()
    return jobLogs.filter((r) => {
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
  }, [jobLogs, search])

  const headerCls = 'text-sm font-semibold text-gray-800 mb-2'
  const cell = 'px-3 py-2'
  const th = 'text-left px-3 py-2 bg-gray-50 text-sm'

  return (
    <div className="space-y-8">
      {/* Topo com limites (opcional, vindo da API) */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="border rounded p-4">
          <h3 className={headerCls}>Configuração PIX</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><b>Mínimo:</b> {currencyBRL(pix?.minimum_limit ?? 0)}</p>
            <p><b>Máximo:</b> {currencyBRL(pix?.maximum_limit ?? 0)}</p>
            <p><b>Limite diário:</b> {currencyBRL(pix?.daily_maximum_limit ?? 0)}</p>
            <p><b>Limite mensal:</b> {currencyBRL(pix?.monthly_maximum_limit ?? 0)}</p>
            <p><b>Tarifa fixa:</b> {currencyBRL(pix?.fixed_charge ?? 0)}</p>
            <p><b>% Tarifa:</b> {Number(pix?.percent_charge ?? 0).toFixed(2)}%</p>
          </div>
        </div>
        <div className="border rounded p-4">
          <h3 className={headerCls}>Gateway</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><b>Nome:</b> {gateway?.name ?? 'PIX'}</p>
            <p><b>Moeda:</b> {gateway?.currency ?? 'BRL'} {gateway?.symbol ?? 'R$'}</p>
            <p><b>Mín./Máx.:</b> {currencyBRL(gateway?.min_amount ?? 0)} — {currencyBRL(gateway?.max_amount ?? 0)}</p>
            <p><b>Taxas:</b> {Number(gateway?.percent_charge ?? 0).toFixed(2)}% + {currencyBRL(gateway?.fixed_charge ?? 0)}</p>
          </div>
        </div>
      </section>

      {/* Minha conta/beneficiário (se houver) */}
      {myUserBeneficiary && (
        <section className="border rounded p-4">
          <h3 className={headerCls}>Meus dados bancários/PIX</h3>
          <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
            <p><b>Nome:</b> {myUserBeneficiary.account_name ?? '—'}</p>
            <p><b>CPF/CNPJ:</b> {myUserBeneficiary.cpf_cnpj ?? '—'}</p>
            <p><b>Agência:</b> {myUserBeneficiary.bank_branch ?? '—'}</p>
            <p><b>Conta:</b> {myUserBeneficiary.account_number ?? '—'}{myUserBeneficiary.account_digit ? `-${myUserBeneficiary.account_digit}` : ''}</p>
            <p><b>PIX:</b> {myUserBeneficiary.pix_key ?? '—'}{myUserBeneficiary.pix_key_type ? ` (${myUserBeneficiary.pix_key_type})` : ''}</p>
          </div>
        </section>
      )}

      {/* Barra de ações igual ao Blade: copiar / excel / pdf (simples) + busca */}
      <section className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex gap-2">
          <button
            className="btn px-3 py-2 border rounded text-sm"
            onClick={() => {
              const txt = JSON.stringify(jobLogs, null, 2)
              navigator.clipboard.writeText(txt)
            }}
          >
            Copiar Dados
          </button>
          <button
            className="btn px-3 py-2 border rounded text-sm"
            onClick={() => {
              // exportar CSV simples
              const header = ['#','TRX','Data','Account Name','Account Number','Bank','Amount','Status']
              const rows = (jobLogs || []).map((r, i) => [
                i + 1,
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
              a.download = 'transfer-history.csv'
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

      {/* Tabela “Transfer History” espelhando o Blade */}
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

              return (
                <tr key={r.id ?? i} className="border-t">
                  <td className={cell}>{i + 1}</td>
                  <td className={cell}>{r.trx ?? '—'}</td>
                  <td className={cell}>{dateBR(r.created_at)}</td>
                  <td className={`${cell} truncate`}>{name}</td>
                  <td className={cell}>{numberOrPix}</td>
                  <td className={cell}>{bankName}</td>
                  <td className={cell}>{currencyBRL(r.amount ?? 0)}</td>
                  <td className={cell}><StatusBadge s={statusNum} /></td>
                  <td className={cell}>
                    {statusNum === 1 && r.id ? (
                      <a
                        href={`/user/transfer/log/${r.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded inline-block"
                      >
                        Ver
                      </a>
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

      {/* (Opcional) sessões de beneficiários/bancos usando os paginadores da API */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h3 className={headerCls}>Meus Beneficiários</h3>
          {ownBeneficiaries?.data?.length ? (
            <ul className="text-sm list-disc pl-5">
              {ownBeneficiaries.data.map((b) => (
                <li key={b.id}>
                  {b.account_name ?? '—'} — {b.account_number ?? b.pix_key ?? '—'}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-600">Nenhum beneficiário cadastrado.</p>}
        </div>

        <div className="border rounded p-4">
          <h3 className={headerCls}>Outros Beneficiários</h3>
          {otherBeneficiaries?.data?.length ? (
            <ul className="text-sm list-disc pl-5">
              {otherBeneficiaries.data.map((b) => (
                <li key={b.id}>
                  {b.account_name ?? '—'} — {b.account_number ?? b.pix_key ?? '—'}
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-gray-600">Nenhum beneficiário encontrado.</p>}
        </div>
      </section>

      {/* <section className="border rounded p-4">
        <h3 className={headerCls}>Bancos suportados (amostra)</h3>
        {otherBanks?.length ? (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className={th}>Nome</th>
                  <th className={th}>ISPB</th>
                  <th className={th}>Mínimo</th>
                  <th className={th}>Máximo</th>
                </tr>
              </thead>
              <tbody>
                {otherBanks.map((b) => (
                  <tr key={b.id} className="border-t">
                    <td className={cell}>{b.name}</td>
                    <td className={cell}>{b.ispb ?? '—'}</td>
                    <td className={cell}>{currencyBRL(b.minimum_limit)}</td>
                    <td className={cell}>{currencyBRL(b.maximum_limit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-gray-600">—</p>}
      </section> */}
    </div>
  )
}
