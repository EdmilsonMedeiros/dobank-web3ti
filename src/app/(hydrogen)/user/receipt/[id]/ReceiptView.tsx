// /home/vinny/isomorphic/isomorphic-dev/isomorphic/apps/isomorphic-starter/src/app/(hydrogen)/user/receipt/[id]/ReceiptView.tsx
'use client'

import * as React from 'react'

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
  amount: number // centavos
  fine_type: 'fixed' | 'percentage' | null
  fine_amount: number | null // centavos
  fine_percent: number | null
  interest_type:
    | 'fixed_per_day'
    | 'fixed_per_working_day'
    | 'percentage_per_month'
    | 'percentage_per_month_working_days'
    | null
  interest_amount: number | null // centavos
  interest_percent: number | null
  description: string | null
  due_date: string
  expiration_date: string
}

type Props = {
  id: number
  result: {
    payer: Payer
    receivables: Receivable[]
  }
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })
    : ''

const asMoneyFromCents = (cents?: number | null) =>
  typeof cents === 'number' ? BRL.format(cents / 100) : ''

export default function ReceiptView({ id, result }: Props) {
  const r = result?.receivables?.[0]

  const canDownload = (r?.status ?? '').toLowerCase() === 'created'

  return (
    <div className="space-y-8">
      {/* Botão "Baixar boleto" quando status === created (Blade) */}
      {canDownload && (
        <a
          href={`/user/receipt/${id}/download`}
          target="_blank"
          className="inline-flex items-center bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Baixar boleto
          <i className="fa fa-download ml-2" aria-hidden="true" />
        </a>
      )}

      {/* Dados do Pagador */}
      <section>
        <h2 className="text-base font-semibold">Dados do Pagador</h2>
        <div className="grid grid-cols-12 gap-4 mt-4">
          <ReadOnlyInput label="CPF/CNPJ" value={result?.payer?.tax_id} />
          <ReadOnlyInput label="Nome" value={result?.payer?.name} />
          <ReadOnlyInput label="Nome Fantasia" value={result?.payer?.trade_name ?? ''} />

          <ReadOnlyInput label="CEP" value={result?.payer?.address?.postal_code} />
          <ReadOnlyInput label="Rua" value={result?.payer?.address?.street} />
          <ReadOnlyInput label="Número" value={result?.payer?.address?.number} />

          <ReadOnlyInput label="Bairro" value={result?.payer?.address?.district} />
          <ReadOnlyInput label="Cidade" value={result?.payer?.address?.city} />
          <ReadOnlyInput label="Estado" value={result?.payer?.address?.state} />
          <ReadOnlyInput label="Complemento" value={result?.payer?.address?.complement} />
        </div>
      </section>

      {/* Dados da Cobrança */}
      <section>
        <h2 className="text-base font-semibold">Dados da Cobrança</h2>

        <div className="grid grid-cols-12 gap-4 mt-4">
          <ReadOnlyInput label="Valor da cobrança" value={asMoneyFromCents(r?.amount)} />
        </div>

        <div className="grid grid-cols-12 gap-4 mt-4">
          <ReadOnlySelect
            label="Tipo da multa"
            value={r?.fine_type ?? ''}
            options={[
              { value: '', label: 'Sem multa' },
              { value: 'fixed', label: 'Fixo' },
              { value: 'percentage', label: 'Percentual' },
            ]}
          />
          <ReadOnlyInput label="Valor da multa" value={asMoneyFromCents(r?.fine_amount)} />
          <ReadOnlyInput label="Percentual da multa" value={String(r?.fine_percent ?? '')} />
        </div>

        <div className="grid grid-cols-12 gap-4 mt-4">
          <ReadOnlySelect
            label="Tipo dos juros"
            value={r?.interest_type ?? ''}
            options={[
              { value: '', label: 'Sem juros' },
              { value: 'fixed_per_day', label: 'Fixo por dia' },
              { value: 'fixed_per_working_day', label: 'Fixo por dia de trabalho' },
              { value: 'percentage_per_month', label: 'Porcentagem por mês' },
              { value: 'percentage_per_month_working_days', label: 'Porcentagem por mês e dias de trabalho' },
            ]}
          />
          <ReadOnlyInput label="Valor dos juros" value={asMoneyFromCents(r?.interest_amount)} />
          <ReadOnlyInput label="Percentual dos juros" value={String(r?.interest_percent ?? '')} />
        </div>

        <div className="grid grid-cols-12 gap-4 mt-4">
          <ReadOnlyInput label="Data do vencimento" value={fmtDate(r?.due_date)} />
          <ReadOnlyInput label="Data de expiração da cobrança" value={fmtDate(r?.expiration_date)} />
        </div>

        <div className="grid grid-cols-12 gap-4 mt-4">
          <ReadOnlyInput label="Descrição" value={r?.description ?? ''} full />
        </div>
      </section>
    </div>
  )
}

/** Componentes de leitura (desabilitados) **/
function ReadOnlyInput({ label, value, full = false }: { label: string; value?: string; full?: boolean }) {
  return (
    <div className={`${full ? 'col-span-12' : 'col-span-12 lg:col-span-4'}`}>
      <label className="block text-sm text-gray-600 mb-1.5">{label}</label>
      <input
        disabled
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md"
        value={value ?? ''}
        placeholder=""
      />
    </div>
  )
}

function ReadOnlySelect({
  label,
  value,
  options,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div className="col-span-12 lg:col-span-4">
      <label className="block text-sm text-gray-600 mb-1.5">{label}</label>
      <select disabled className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md" value={value ?? ''}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
