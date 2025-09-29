// /home/vinny/isomorphic/isomorphic-dev/isomorphic/apps/isomorphic-starter/src/app/(hydrogen)/user/receipt/create/CreateReceiptForm.tsx
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  apiBaseUrl: string
  token: string
}

type FormState = {
  // Hidden (iguais ao Blade)
  payment_methods: string[] // ["boleto","pix"]
  payment_method_details_pix_key: string // "****" (o backend substitui pelo env())

  // Payer
  payer_tax_id: string
  payer_name: string
  payer_trade_name: string
  payer_address_postal_code: string
  payer_address_street: string
  payer_address_number: string
  payer_address_district: string
  payer_address_city: string
  payer_address_state: string
  payer_address_complement: string

  // Cobrança
  amount: string // BRL (ex.: "134.72" ou "134,72")
  invoice: string

  fine_type: '' | 'fixed' | 'percentage'
  fine_amount: string // BRL
  fine_percent: string // número (%)

  interest_type:
    | ''
    | 'fixed_per_day'
    | 'fixed_per_working_day'
    | 'percentage_per_month'
    | 'percentage_per_month_working_days'
  interest_amount: string // BRL
  interest_percent: string // número (%)

  due_date: string // yyyy-mm-dd
  expiration_date: string // yyyy-mm-dd
  description: string
}

const initialState: FormState = {
  payment_methods: ['boleto', 'pix'],
  payment_method_details_pix_key: '****',

  payer_tax_id: '',
  payer_name: '',
  payer_trade_name: '',
  payer_address_postal_code: '',
  payer_address_street: '',
  payer_address_number: '',
  payer_address_district: '',
  payer_address_city: '',
  payer_address_state: '',
  payer_address_complement: '',

  amount: '',
  invoice: '',

  fine_type: '',
  fine_amount: '',
  fine_percent: '',

  interest_type: '',
  interest_amount: '',
  interest_percent: '',

  due_date: '',
  expiration_date: '',
  description: '',
}

export default function CreateReceiptForm({ apiBaseUrl, token }: Props) {
  const router = useRouter()
  const [f, setF] = React.useState<FormState>(initialState)
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  // Regras de habilitar/desabilitar (idênticas ao Blade)
  const fineAmountDisabled = f.fine_type !== 'fixed'
  const finePercentDisabled = f.fine_type !== 'percentage'

  const interestAmountDisabled =
    !(f.interest_type === 'fixed_per_day' || f.interest_type === 'fixed_per_working_day')
  const interestPercentDisabled =
    !(f.interest_type === 'percentage_per_month' || f.interest_type === 'percentage_per_month_working_days')

  // Helpers
  const onlyDigits = (s: string) => s.replace(/\D/g, '')
  const toBRLCentsString = (s: string) => {
    // recebe "123,45" | "123.45" | "123" e normaliza para "123.45" (string)
    const cleaned = String(s ?? '').trim().replace(/\./g, '').replace(',', '.')
    return cleaned
  }

  const onChange = (name: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let v: string = e.target.value

    // Sanitizações equivalentes ao Blade
    if (name === 'payer_tax_id' || name === 'payer_address_postal_code' || name === 'payer_address_number') {
      v = onlyDigits(v)
    }

    setF((prev) => ({ ...prev, [name]: v }))
  }

  // CEP -> ViaCEP (mesmo comportamento do Blade no blur)
  const onPostalBlur = async () => {
    const cep = onlyDigits(f.payer_address_postal_code)
    if (!/^\d{8}$/.test(cep)) {
      // Formato inválido
      return
    }
    try {
      // NÃO usamos fetch externo no servidor; aqui é client-side
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await resp.json()
      if (!data?.erro) {
        setF((prev) => ({
          ...prev,
          payer_address_street: data.logradouro || '',
          payer_address_city: data.localidade || '',
          payer_address_district: data.bairro || '',
          payer_address_state: data.uf || '',
        }))
      }
    } catch {
      // silencia (comportamento parecido com o Blade)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)
    try {
      // Monta payload com o MESMO shape que o monolito envia ao backend
      const payload = {
        payment_methods: f.payment_methods,
        payment_method_details: {
          pix: {
            pix_key: f.payment_method_details_pix_key, // backend sobrescreve para env('TRANSFEERA_DEPOSIT_PIXKEY')
          },
        },
        payer: {
          tax_id: f.payer_tax_id,
          name: f.payer_name,
          trade_name: f.payer_trade_name || null,
          address: {
            postal_code: f.payer_address_postal_code,
            street: f.payer_address_street,
            number: f.payer_address_number,
            district: f.payer_address_district,
            city: f.payer_address_city,
            state: f.payer_address_state,
            complement: f.payer_address_complement || null,
          },
        },
        // Cobrança
        amount: toBRLCentsString(f.amount), // o seu receiptConfirm compara (float) amount com max; manter padrão BRL
        invoice: f.invoice || null,
        fine_type: f.fine_type || null,
        fine_amount: toBRLCentsString(f.fine_amount || '0'),
        fine_percent: f.fine_percent || null,
        interest_type: f.interest_type || null,
        interest_amount: toBRLCentsString(f.interest_amount || '0'),
        interest_percent: f.interest_percent || null,
        due_date: f.due_date, // 'YYYY-MM-DD'
        expiration_date: f.expiration_date,
        description: f.description || null,
      }

      const res = await fetch(`${apiBaseUrl}/receipt`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        } as any,
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        // Backend retorna {status,message,details} em 422
        throw new Error(data?.details || data?.message || 'Erro ao gerar cobrança')
      }

      const id = data?.receiptId
      if (!id) {
        throw new Error('Resposta inesperada da API.')
      }

      // Redireciona para a tela de visualização (igual ao comportamento do Blade)
      router.push(`/user/receipt/${id}`)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao enviar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
      <div className="intro-y col-span-12 xl:col-span-9 box p-5">
        <p className="text-sm text-gray-600 mb-3">
          <strong>* Campos obrigatórios</strong>
        </p>

        {/* Dados do Pagador */}
        <section className="mt-3">
          <h2 className="text-base font-semibold">Dados do Pagador</h2>

          {/* hidden como no Blade */}
          <input type="hidden" name="payment_methods[]" value="boleto" />
          <input type="hidden" name="payment_methods[]" value="pix" />
          <input type="hidden" name="payment_method_details[pix][pix_key]" value="****" />

          <div className="grid grid-cols-12 gap-2 mt-5">
            <Field
              label="CPF/CNPJ*"
              required
              value={f.payer_tax_id}
              onChange={onChange('payer_tax_id')}
              placeholder=""
              inputMode="numeric"
              className="col-span-12 lg:col-span-4"
            />
            <Field
              label="Nome*"
              required
              value={f.payer_name}
              onChange={onChange('payer_name')}
              placeholder=""
              className="col-span-12 lg:col-span-4"
            />
            <Field
              label="Nome Fantasia"
              value={f.payer_trade_name}
              onChange={onChange('payer_trade_name')}
              placeholder=""
              className="col-span-12 lg:col-span-4"
            />

            <Field
              label="CEP*"
              required
              value={f.payer_address_postal_code}
              onChange={onChange('payer_address_postal_code')}
              onBlur={onPostalBlur}
              placeholder=""
              inputMode="numeric"
              className="col-span-12 lg:col-span-4"
            />
            <Field
              label="Endereço*"
              required
              value={f.payer_address_street}
              onChange={onChange('payer_address_street')}
              placeholder=""
              className="col-span-12 lg:col-span-4"
            />
            <Field
              label="Número*"
              required
              value={f.payer_address_number}
              onChange={onChange('payer_address_number')}
              placeholder=""
              inputMode="numeric"
              className="col-span-12 lg:col-span-4"
            />

            <Field
              label="Bairro*"
              required
              value={f.payer_address_district}
              onChange={onChange('payer_address_district')}
              placeholder=""
              className="col-span-12 lg:col-span-3"
            />
            <Field
              label="Cidade*"
              required
              value={f.payer_address_city}
              onChange={onChange('payer_address_city')}
              placeholder=""
              className="col-span-12 lg:col-span-3"
            />
            <Field
              label="Estado*"
              required
              value={f.payer_address_state}
              onChange={onChange('payer_address_state')}
              placeholder=""
              className="col-span-12 lg:col-span-3"
            />
            <Field
              label="Complemento"
              value={f.payer_address_complement}
              onChange={onChange('payer_address_complement')}
              placeholder=""
              className="col-span-12 lg:col-span-3"
            />
          </div>
        </section>

        {/* Dados da Cobrança */}
        <section className="mt-6">
          <h2 className="text-base font-semibold">Dados da Cobrança</h2>

          <div className="grid grid-cols-12 gap-2 mt-5">
            <Field
              label="Valor da cobrança*"
              required
              value={f.amount}
              onChange={onChange('amount')}
              placeholder=""
              className="col-span-12 lg:col-span-4"
            />
            <Field
              label="Número da Nota"
              value={f.invoice}
              onChange={onChange('invoice')}
              placeholder=""
              className="col-span-12 lg:col-span-4"
            />
          </div>

          <div className="grid grid-cols-12 gap-2 mt-5">
            <Select
              label="Tipo da multa"
              value={f.fine_type}
              onChange={onChange('fine_type')}
              className="col-span-12 lg:col-span-4"
              options={[
                { value: '', label: 'Sem multa' },
                { value: 'fixed', label: 'Fixo' },
                { value: 'percentage', label: 'Percentual' },
              ]}
            />
            <Field
              label="Valor da multa"
              value={f.fine_amount}
              onChange={onChange('fine_amount')}
              placeholder="0"
              disabled={fineAmountDisabled}
              className="col-span-12 lg:col-span-4"
            />
            <Field
              label="Percentual da multa"
              type="number"
              step="0.01"
              min="0.01"
              value={f.fine_percent}
              onChange={onChange('fine_percent')}
              placeholder="0"
              disabled={finePercentDisabled}
              className="col-span-12 lg:col-span-4"
            />
          </div>

          <div className="grid grid-cols-12 gap-2 mt-5">
            <Select
              label="Tipo dos juros"
              value={f.interest_type}
              onChange={onChange('interest_type')}
              className="col-span-12 lg:col-span-4"
              options={[
                { value: '', label: 'Sem juros' },
                { value: 'fixed_per_day', label: 'Fixo por dia' },
                { value: 'fixed_per_working_day', label: 'Fixo por dia de trabalho' },
                { value: 'percentage_per_month', label: 'Porcentagem por mês' },
                { value: 'percentage_per_month_working_days', label: 'Porcentagem por mês e dias de trabalhado' },
              ]}
            />
            <Field
              label="Valor dos juros"
              value={f.interest_amount}
              onChange={onChange('interest_amount')}
              placeholder="0"
              disabled={interestAmountDisabled}
              className="col-span-12 lg:col-span-4"
            />
            <Field
              label="Percentual dos juros"
              type="number"
              step="0.01"
              min="0.01"
              value={f.interest_percent}
              onChange={onChange('interest_percent')}
              placeholder="0"
              disabled={interestPercentDisabled}
              className="col-span-12 lg:col-span-4"
            />
          </div>

          <div className="grid grid-cols-12 gap-2 mt-5">
            <Field
              label="Data do vencimento*"
              required
              type="date"
              value={f.due_date}
              onChange={onChange('due_date')}
              className="col-span-12 lg:col-span-6"
            />
            <Field
              label="Data de expiração da cobrança*"
              required
              type="date"
              value={f.expiration_date}
              onChange={onChange('expiration_date')}
              className="col-span-12 lg:col-span-6"
            />
          </div>

          <div className="grid grid-cols-12 gap-2 mt-5">
            <Field
              label="Descrição"
              value={f.description}
              onChange={onChange('description')}
              placeholder=""
              className="col-span-12"
            />
          </div>
        </section>

        <div className="text-right mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="btn bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
          >
            {submitting ? 'Enviando...' : 'Submit'}
          </button>
        </div>

        {errorMsg && <p className="text-sm text-red-600 mt-3">{errorMsg}</p>}
      </div>
    </form>
  )
}

/** Componentes de UI simples **/
function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }) {
  const { label, className, ...rest } = props
  return (
    <div className={className}>
      <label className="form-label block text-sm text-gray-600 mb-1.5">{label}</label>
      <input
        {...rest}
        className={
          'form-control w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ' +
          (rest.className || '')
        }
      />
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: string
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  options: Array<{ value: string; label: string }>
  className?: string
}) {
  return (
    <div className={className}>
      <label className="form-label block text-sm text-gray-600 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="form-control w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
