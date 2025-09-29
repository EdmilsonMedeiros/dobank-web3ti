'use client'

import * as React from 'react'

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

type Props = {
  token: string
  apiBaseUrl: string
  emptyMessage: string
  ownBeneficiaries: Paged<BeneficiaryRow> // recebido mas não exibido (igual ao Blade)
  dobankRecents?: BeneficiaryRow[]
}

export default function TransferOwn({
  token,
  apiBaseUrl,
  emptyMessage,
  ownBeneficiaries, // mantido por compatibilidade
  dobankRecents = [],
}: Props) {
  // form state
  const [accountNumber, setAccountNumber] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [message, setMessage] = React.useState('')

  const [benefName, setBenefName] = React.useState<string>('')
  const [checkingBenef, setCheckingBenef] = React.useState(false)
  const [canSubmit, setCanSubmit] = React.useState(false)

  const [submitLoading, setSubmitLoading] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [submitOk, setSubmitOk] = React.useState<string | null>(null)

  const [search, setSearch] = React.useState('')

  const inputCls =
    'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelCls = 'block text-sm text-gray-600 mb-1.5'

  const recents = Array.isArray(dobankRecents) ? dobankRecents : []

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return recents
    return recents.filter(
      (r) =>
        r.account_number?.toLowerCase().includes(q) ||
        (r.account_name ?? '').toLowerCase().includes(q),
    )
  }, [recents, search])

  // Busca de beneficiário (blur)
  async function fetchBenefName(acct: string) {
    if (!acct) {
      setBenefName('')
      setCanSubmit(false)
      return
    }
    setCheckingBenef(true)
    setBenefName('')
    setCanSubmit(false)
    try {
      const res = await fetch(`${apiBaseUrl}/transfer/own/get_user/${encodeURIComponent(acct)}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error('Usuário não encontrado')
      const data = await res.json()
      const name = data?.account_name || ''
      setBenefName(name ? ` | Beneficiário: ${name}` : ' | Beneficiário não encontrado')
      setCanSubmit(!!name)
    } catch {
      setBenefName('Usuário não encontrado!')
      setCanSubmit(false)
    } finally {
      setCheckingBenef(false)
    }
  }

  const onBlurAccount = () => fetchBenefName(accountNumber)

  const normalizeMoney = (v: string) => {
    // aceita 1.234,56 ou 1234.56 -> backend faz o parse como no monolito
    const t = v.trim()
    if (!t) return ''
    if (t.includes(',')) {
      return t.replace(/\./g, '').replace(',', '.')
    }
    return t
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setSubmitOk(null)
    setSubmitLoading(true)

    try {
      // payload idêntico ao Blade (rota user.action -> type=own_transfer)
      const payload = {
        type: 'own_transfer',
        id: 0,
        account_number: accountNumber,
        amount: normalizeMoney(amount),
        message: message || undefined,
      }

      const res = await fetch(`${apiBaseUrl}/action`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || 'Falha ao enviar transferência')
      }

      setSubmitOk('Transferência enviada com sucesso.')
      setAccountNumber('')
      setAmount('')
      setMessage('')
      setBenefName('')
      setCanSubmit(false)
    } catch (err: any) {
      setSubmitError(err?.message || 'Erro ao enviar transferência')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Formulário */}
      <section className="max-w-3xl">
        <h2 className="text-lg font-medium mb-4">Transferência entre Dobankers</h2>
        <form onSubmit={onSubmit} className="grid gap-4 bg-white border rounded-xl p-5">
          <div>
            <label className={labelCls}>
              Número da Conta <span className="text-red-600">*</span>
              <span className="ml-1">{checkingBenef ? ' (verificando...)' : benefName}</span>
            </label>
            <input
              className={inputCls}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              onBlur={onBlurAccount}
              placeholder="Ex.: DB2122..."
            />
          </div>

          <div>
            <label className={labelCls}>
              Valor <span className="text-red-600">*</span>{' '}
              <span className="ml-2 text-xs text-gray-500">
                Limites conforme regra • Tarifa: fixa + %
              </span>
            </label>
            <input
              className={inputCls}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div>
            <label className={labelCls}>Mensagem</label>
            <input
              className={inputCls}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={120}
              placeholder="(opcional)"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setAccountNumber('')
                setAmount('')
                setMessage('')
                setBenefName('')
                setCanSubmit(false)
              }}
              className="px-4 py-2 border rounded-md text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-60"
            >
              {submitLoading ? 'Enviando...' : 'Submit'}
            </button>
          </div>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          {submitOk && <p className="text-sm text-green-600">{submitOk}</p>}
        </form>
      </section>

      {/* Tabela de recentes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Minhas Transferências Dobankers</h3>
          <input
            className={inputCls + ' w-60'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
          />
        </div>

        <div className="overflow-x-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Conta</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Nome</th>
              </tr>
            </thead>
            <tbody>
              {(rows?.length ?? 0) > 0 ? (
                rows.map((r) => (
                  <tr key={`${r.id}-${r.account_number}`} className="border-t">
                    <td className="px-4 py-2 text-gray-600">{r.account_number}</td>
                    <td className="px-4 py-2 text-gray-600">{r.account_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
