// /home/vinny/isomorphic/isomorphic-dev/isomorphic/apps/isomorphic-starter/src/app/(hydrogen)/user/receipt/history/ReceiptHistoryTable.tsx
'use client'

import * as React from 'react'

type ReceiptItem = {
  id: number
  trx: string
  invoice: string | null
  payer_name: string
  tax_id: string
  valor: string
  status: string
  created_at: string
  updated_at: string
}

type Props = {
  rows: ReceiptItem[]
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Fortaleza',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

function statusClasses(status: string) {
  if (status === 'Aguardando pagamento') return 'text-yellow-600'
  if (status === 'Pago' || status === 'Em processamento') return 'text-green-600'
  if (status === 'Cancelada' || status === 'Em cancelamento' || status === 'Reembolsado') return 'text-red-600'
  return 'text-slate-600'
}

export default function ReceiptHistoryTable({ rows }: Props) {
  const [query, setQuery] = React.useState('')
  const filtered = React.useMemo(() => {
    if (!query.trim()) return rows
    const q = query.toLowerCase()
    return rows.filter((r) => {
      return (
        r.trx?.toLowerCase().includes(q) ||
        (r.invoice ?? '-').toLowerCase().includes(q) ||
        r.payer_name?.toLowerCase().includes(q) ||
        r.tax_id?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
      )
    })
  }, [rows, query])

  const copyTable = () => {
    const header = ['TRX', 'Nr. Nota', 'Pagador', 'CPF/CNPJ', 'Valor', 'Status', 'Data Envio', 'Data Verificação']
    const lines = filtered.map((r) => [
      r.trx,
      r.invoice ?? '-',
      r.payer_name,
      r.tax_id,
      BRL.format(Number(r.valor || 0)),
      r.status,
      formatDate(r.created_at),
      formatDate(r.updated_at),
    ])
    const csv = [header, ...lines].map((row) => row.map(csvEscape).join(';')).join('\n')
    navigator.clipboard.writeText(csv).catch(() => {})
  }

  const exportExcel = () => {
    const header = ['TRX', 'Nr. Nota', 'Pagador', 'CPF/CNPJ', 'Valor', 'Status', 'Data Envio', 'Data Verificação']
    const lines = filtered.map((r) => [
      r.trx,
      r.invoice ?? '-',
      r.payer_name,
      r.tax_id,
      BRL.format(Number(r.valor || 0)),
      r.status,
      formatDate(r.created_at),
      formatDate(r.updated_at),
    ])
    const csv = [header, ...lines].map((row) => row.map(csvEscape).join(';')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }) // BOM p/ Excel PT-BR
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'receipts.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPdf = () => {
    // Gera uma página simples e invoca o print (o usuário pode salvar em PDF)
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Boletos de Cobrança</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 12px; }
            th { background: #f5f5f5; }
            h1 { font-size: 18px; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <h1>Boletos de Cobrança</h1>
          ${renderPrintableTable(filtered)}
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  return (
    <div className="space-y-4">
      {/* Barra de ações + busca (equivalente aos botões do Blade/DataTables) */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <button onClick={copyTable} className="btn box text-slate-600 border px-3 py-2 rounded-md text-sm">
            Copiar Dados
          </button>
          <button onClick={exportExcel} className="btn box text-slate-600 border px-3 py-2 rounded-md text-sm">
            Exportar para Excel
          </button>
          <button onClick={exportPdf} className="btn box text-slate-600 border px-3 py-2 rounded-md text-sm">
            Exportar para PDF
          </button>
        </div>
        <div className="ml-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full sm:w-64 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="px-3 py-2">TRX</th>
              <th className="px-3 py-2">Nr. Nota</th>
              <th className="px-3 py-2">Pagador</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Data Envio</th>
              <th className="px-3 py-2">Data Verificação</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-slate-500 px-3 py-6">
                  Nenhuma cobrança encontrada.
                </td>
              </tr>
            )}

            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 align-top">
                  <div className="text-slate-600">{r.trx}</div>
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="text-slate-600">{r.invoice ?? '-'}</div>
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="text-slate-600">
                    {r.payer_name}
                    <br />
                    <span className="text-xs">CPF/CNPJ: {r.tax_id}</span>
                  </div>
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="text-slate-600">{BRL.format(Number(r.valor || 0))}</div>
                </td>
                <td className="px-3 py-2 align-top">
                  <span className={`text-xs font-medium ${statusClasses(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="text-slate-600">{formatDate(r.created_at)}</div>
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="text-slate-600">{formatDate(r.updated_at)}</div>
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="flex gap-2">
                    <a
                      href={`/user/receipt/${r.id}`}
                      className="btn btn-primary w-10 h-9 grid place-items-center rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      title="Ver"
                    >
                      <i className="fa fa-eye" aria-hidden="true" />
                    </a>

                    {r.status === 'Aguardando pagamento' && (
                      <>
                        <a
                          href={`/user/receipt/${r.id}/download`}
                          target="_blank"
                          className="btn btn-primary w-10 h-9 grid place-items-center rounded-md bg-blue-600 text-white hover:bg-blue-700"
                          title="Baixar"
                        >
                          <i className="fa fa-download" aria-hidden="true" />
                        </a>

                        <a
                          href={`/user/receipt/${r.id}/cancel`}
                          target="_blank"
                          className="btn btn-danger w-10 h-9 grid place-items-center rounded-md bg-red-600 text-white hover:bg-red-700"
                          title="Cancelar"
                        >
                          <i className="fa fa-trash" aria-hidden="true" />
                        </a>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Helpers **/
function csvEscape(val: any) {
  const s = String(val ?? '')
  // Escapa ; e " e pula-linha para CSV ; separado, envolvendo com aspas se necessário
  if (/[;\n"]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function renderPrintableTable(rows: ReceiptItem[]) {
  const header =
    '<tr><th>TRX</th><th>Nr. Nota</th><th>Pagador</th><th>CPF/CNPJ</th><th>Valor</th><th>Status</th><th>Data Envio</th><th>Data Verificação</th></tr>'
  const body = rows
    .map(
      (r) => `<tr>
      <td>${escapeHtml(r.trx)}</td>
      <td>${escapeHtml(r.invoice ?? '-')}</td>
      <td>${escapeHtml(r.payer_name)}</td>
      <td>${escapeHtml(r.tax_id)}</td>
      <td>${escapeHtml(BRL.format(Number(r.valor || 0)))}</td>
      <td>${escapeHtml(r.status)}</td>
      <td>${escapeHtml(formatDate(r.created_at))}</td>
      <td>${escapeHtml(formatDate(r.updated_at))}</td>
    </tr>`,
    )
    .join('')
  return `<table>${header}${body}</table>`
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
