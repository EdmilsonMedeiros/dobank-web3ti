// src/app/(hydrogen)/user/transfer/pix/PixTransfer.tsx
'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type Bank = {
  name: string
  minimum_limit: number
  maximum_limit: number
  daily_maximum_limit: number
  monthly_maximum_limit: number
  daily_total_transaction: number
  monthly_total_transaction: number
}

type Beneficiary = {
  id: number
  bank: Bank
  pix_key_type?: 'CPF' | 'CNPJ' | 'TELEFONE' | 'EMAIL' | 'CHAVE_ALEATORIA'
  pix_key?: string
  account_name?: string
  account_number?: string
}

type JobLog = { id: number; status: string; message: string; created_at: string }

type Props = {
  apiBaseUrl: string
  token: string
  user: {
    id: number
    name: string
    balance: number
    transferencia_pix_planilha: boolean
    negociated_pix_payment: boolean
    pix_fixed_charge: number
    pix_percent_charge: number
    my_user_beneficiarie_id: number
  }
  gateway: { fixed_charge: number; percent_charge: number }
  pix: { minimum_limit: number; maximum_limit: number }
  myUserBeneficiary: { id: number; account_name: string; bank: Bank }
  otherBeneficiaries: Beneficiary[]
  jobLogs: JobLog[]
  otherBanks: { code?: string; ispb?: string; name: string }[]
  langToMoney: { decimal: string; thousands: string; precision: number; prefix: string }
  otpEnabled: boolean
}

type TabKey = 'pix-key' | 'pix-import' | 'account-transfer'

const clsInput =
  'w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
const clsLabel = 'block text-sm text-gray-600 mb-1.5'
const clsBtn =
  'btn btn-primary bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium'
const box = 'intro-y box p-5 bg-white rounded-xl shadow-sm'

function formatCurrencyBR(value: number, pfx = 'R$ ') {
  return pfx + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function maskCurrencyInput(v: string) {
  const onlyDigits = v.replace(/\D/g, '')
  const asNumber = Number(onlyDigits || '0') / 100
  return asNumber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function parseCurrencyBR(str: string) {
  const s = (str || '').toString().trim().replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
  const n = Number(s)
  return isNaN(n) ? 0 : n
}
function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {})
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}
function isValidUUIDv4(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
}
function digits(s: string) {
  return (s || '').replace(/\D/g, '')
}
function ensurePhoneWithCountry(raw: string) {
  const d = digits(raw)
  if (raw.startsWith('+')) return `+${d}`
  // por padrão, assume BR
  return `+55${d}`
}

export default function PixTransfer(props: Props) {
  const {
    apiBaseUrl,
    token,
    user,
    gateway,
    pix,
    myUserBeneficiary,
    otherBeneficiaries,
    jobLogs,
    otherBanks,
    otpEnabled,
  } = props

  const router = useRouter()

  const [active, setActive] = React.useState<TabKey>('pix-key')
  const [toast, setToast] = React.useState<string | null>(null)

  // ---- Form "Chave Pix" (sem o select de tipo, agora autodetect)
  const [pixKeyType, setPixKeyType] = React.useState<Beneficiary['pix_key_type'] | ''>('') // gerenciado automaticamente
  const [pixKeyValue, setPixKeyValue] = React.useState('')
  const [pixAmount, setPixAmount] = React.useState('')
  const [pixDesc, setPixDesc] = React.useState('')
  const [authModePix, setAuthModePix] = React.useState<'Email'>('Email') // OTP via e-mail

  // estados de modais
  const [chooseTypeOpen, setChooseTypeOpen] = React.useState(false)
  const [chooseTypeContext, setChooseTypeContext] = React.useState<{ rawKey: string; amount: number } | null>(null)

  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmData, setConfirmData] = React.useState<{
    type: Beneficiary['pix_key_type']
    key: string
    amount: number
    desc?: string
  } | null>(null)

  const [submitting, setSubmitting] = React.useState(false)

  // ---- Form "Dados Bancários"
  const [bankName, setBankName] = React.useState('')
  const [accType, setAccType] = React.useState<
    'CONTA_CORRENTE' | 'CONTA_POUPANCA' | 'CONTA_PAGAMENTO' | 'CONTA_FACIL' | 'ENTIDADES_PUBLICAS' | ''
  >('')
  const [accName, setAccName] = React.useState('')
  const [cpfCnpj, setCpfCnpj] = React.useState('')
  const [branch, setBranch] = React.useState('')
  const [accNumber, setAccNumber] = React.useState('')
  const [accDigit, setAccDigit] = React.useState('')
  const [accAmount, setAccAmount] = React.useState('')
  const [accDesc, setAccDesc] = React.useState('')
  const [authModeAcc, setAuthModeAcc] = React.useState<'Email'>('Email')

  // ---- Lista / busca
  const [transfers] = React.useState(otherBeneficiaries.slice().reverse())
  const [searchBenef, setSearchBenef] = React.useState('')

  // ---- Modal "Pix Recente"
  const [recentModalOpen, setRecentModalOpen] = React.useState(false)
  const [recentTarget, setRecentTarget] = React.useState<{
    id: number
    bank_name: string
    name: string
    limits: Bank
  } | null>(null)
  const [recentAmount, setRecentAmount] = React.useState('')
  const [recentDesc, setRecentDesc] = React.useState('')
  const [authModeRecent, setAuthModeRecent] = React.useState<'Email'>('Email')

  // ---- Importar planilha
  const [importModalOpen, setImportModalOpen] = React.useState(false)
  const [jobSearch, setJobSearch] = React.useState('')

  // autocomplete bancos
  const bankOptions = otherBanks.map((b) => `${b.code ?? b.ispb ?? ''} - ${b.name}`)

  const limitsText = (() => {
    const fixed = user.negociated_pix_payment ? user.pix_fixed_charge : gateway.fixed_charge
    const percent = user.negociated_pix_payment ? user.pix_percent_charge : gateway.percent_charge
    return `Limites: ${formatCurrencyBR(pix.minimum_limit, '')}-${formatCurrencyBR(
      pix.maximum_limit,
      '',
    )}  Tarifa: ${formatCurrencyBR(fixed, '')} + ${percent}%`
  })()

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // ===== Utilitários de detecção de chave =====
  function detectPixType(raw: string): { type: Beneficiary['pix_key_type'] | null; needsChoice: boolean; formattedKey: string } {
    const v = raw.trim()
    if (!v) return { type: null, needsChoice: false, formattedKey: v }

    // e-mail
    if (isValidEmail(v)) return { type: 'EMAIL', needsChoice: false, formattedKey: v }

    // chave aleatória (uuid v4)
    if (isValidUUIDv4(v)) return { type: 'CHAVE_ALEATORIA', needsChoice: false, formattedKey: v }

    // internacional com "+"
    if (/^\+\d{8,15}$/.test(v)) {
      return { type: 'TELEFONE', needsChoice: false, formattedKey: v }
    }

    // numérico puro
    const d = digits(v)
    if (/^\d+$/.test(v) || d.length === v.length) {
      if (d.length === 14) {
        return { type: 'CNPJ', needsChoice: false, formattedKey: d }
      }
      if (d.length === 11) {
        // Pode ser CPF ou telefone BR sem DDI -> perguntar
        return { type: null, needsChoice: true, formattedKey: d }
      }
      if (d.length >= 10 && d.length <= 13) {
        // telefone provável -> assume BR com +55
        return { type: 'TELEFONE', needsChoice: false, formattedKey: ensurePhoneWithCountry(d) }
      }
    }

    // não conseguiu classificar
    return { type: null, needsChoice: false, formattedKey: v }
  }

  function calcCharges(amount: number) {
    const fixed = user.negociated_pix_payment ? user.pix_fixed_charge : gateway.fixed_charge
    const percent = user.negociated_pix_payment ? user.pix_percent_charge : gateway.percent_charge
    const fee = fixed + (amount * percent) / 100
    const total = amount + fee
    return { fixed, percent, fee, total }
  }

  // ========== LÓGICA DE OTP / AÇÕES ==========
  async function postUserAction(body: Record<string, any>) {
    const res = await fetch(`${apiBaseUrl}/user/action`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(json?.message || 'Falha ao processar a ação')
    }
    return json
  }

  function handleActionResponse(data: any, fallbackMsg: string) {
    if (data?.action_id || data?.status === 'pending_otp') {
      const id = data?.action_id ?? data?.action?.id
      const qs = id ? `?action_id=${encodeURIComponent(String(id))}` : ''
      router.push(`/user/verify/otp${qs}`)
      return
    }
    if (data?.status === 'success' && data?.redirect_to) {
      window.location.href = data.redirect_to
      return
    }
    showToast(data?.message ?? fallbackMsg)
  }

  // ===== Validação ao sair do campo (agora autodetect) =====
  function onPixKeyBlur() {
    const { type, needsChoice, formattedKey } = detectPixType(pixKeyValue)
    setPixKeyValue(formattedKey)
    if (needsChoice) {
      // vamos pedir a escolha (CPF x Telefone) quando o usuário for enviar
      return
    }
    if (type) setPixKeyType(type)
  }

  // ====== SUBMIT (abre modal de confirmação antes de enviar) ======
  async function submitPixKey(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseCurrencyBR(pixAmount)
    if (!pixKeyValue.trim()) return alert('Digite a chave')
    // if (amount < pix.minimum_limit || amount > pix.maximum_limit) return alert('Valor fora dos limites')

    const det = detectPixType(pixKeyValue)
    if (det.needsChoice) {
      // guardar contexto e abrir modal de escolha
      setChooseTypeContext({ rawKey: det.formattedKey, amount })
      setChooseTypeOpen(true)
      return
    }
    if (!det.type) return alert('Não foi possível identificar o tipo da chave. Verifique o valor informado.')
    // setar tipo e chamar modal de confirmação
    setPixKeyType(det.type)
    setPixKeyValue(det.formattedKey)
    setConfirmData({ type: det.type, key: det.formattedKey, amount, desc: pixDesc || undefined })
    setConfirmOpen(true)
  }

  async function confirmAndSendPix() {
    if (!confirmData) return
    setSubmitting(true)
    try {
      const data = await postUserAction({
        type: 'pix_transfer',
        id: 0,
        pix_key_type: confirmData.type,
        pix_key: confirmData.key,
        amount: confirmData.amount,
        pix_description: confirmData.desc,
        short_name: 'CONTA_CORRENTE',
        verification: otpEnabled && authModePix === 'Email' ? 2 : undefined,
      })
      handleActionResponse(data, 'Transferência criada.')
      setConfirmOpen(false)
      setPixDesc('')
      setPixAmount('')
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível criar a transferência.')
    } finally {
      setSubmitting(false)
    }
  }

  // ===== Account transfer (sem mudanças) =====
  async function submitAccountTransfer(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseCurrencyBR(accAmount)
    if (!bankName) return alert('Informe o nome do banco')
    if (!accType) return alert('Informe o tipo da conta')
    if (!accName) return alert('Informe o nome completo')
    if (!/^\d{11}$|^\d{14}$/.test(digits(cpfCnpj))) return alert('CPF/CNPJ inválido!')
    if (!branch || !accNumber || !accDigit) return alert('Preencha agência, conta e dígito')
    if (amount < pix.minimum_limit || amount > pix.maximum_limit) return alert('Valor fora dos limites')

    try {
      const data = await postUserAction({
        type: 'pix_transfer',
        id: 0,
        bank: bankName, // se necessário, enviar apenas o código (ex.: "001")
        short_name: accType,
        account_name: accName,
        cpf_cnpj: digits(cpfCnpj),
        bank_branch: branch,
        account_number: accNumber,
        account_digit: accDigit,
        amount,
        pix_description: accDesc || undefined,
        verification: otpEnabled && authModeAcc === 'Email' ? 2 : undefined,
      })
      handleActionResponse(data, 'Transferência criada.')
      setAccDesc('')
      setAccAmount('')
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível criar a transferência.')
    }
  }

  function openSendModalFrom(
    benef: { id: number; bank: Bank; account_name?: string },
    bankName: string,
  ) {
    setRecentTarget({
      id: benef.id,
      bank_name: bankName,
      name: benef.account_name || '—',
      limits: benef.bank,
    })
    setRecentAmount('')
    setRecentDesc('')
    setRecentModalOpen(true)
  }

  async function submitRecent(e: React.FormEvent) {
    e.preventDefault()
    if (!recentTarget) return
    const amount = parseCurrencyBR(recentAmount)
    if (amount < pix.minimum_limit || amount > pix.maximum_limit) return alert('Valor fora dos limites')

    try {
      const data = await postUserAction({
        type: 'pix_transfer',
        id: Number(recentTarget.id),
        amount,
        pix_description: recentDesc || undefined,
        short_name: 'CONTA_CORRENTE',
        verification: otpEnabled && authModeRecent === 'Email' ? 2 : undefined,
      })
      handleActionResponse(data, 'Pix enviado.')
      setRecentModalOpen(false)
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível enviar o Pix.')
    }
  }

  // ===== Exportações / filtros
  function filteredBenefs() {
    const q = searchBenef.trim().toLowerCase()
    if (!q) return transfers
    return transfers.filter(
      (b) =>
        (b.bank?.name || '').toLowerCase().includes(q) ||
        (b.account_name || '').toLowerCase().includes(q) ||
        (b.account_number || '').toLowerCase().includes(q) ||
        (b.pix_key || '').toLowerCase().includes(q),
    )
  }
  function copyTable() {
    const rows = filteredBenefs().map((b) => [
      b.bank?.name ?? '',
      b.account_number ? b.account_number : b.pix_key ?? '',
      b.account_name ?? '',
    ])
    const text = ['Banco\tConta/Chave\tNome', ...rows.map((r) => r.join('\t'))].join('\n')
    copyToClipboard(text)
    showToast('Tabela copiada')
  }
  function exportCSV() {
    const rows = filteredBenefs().map((b) => [
      `"${b.bank?.name ?? ''}"`,
      `"${b.account_number ? b.account_number : b.pix_key ?? ''}"`,
      `"${b.account_name ?? ''}"`,
    ])
    const csv = ['"Banco","Conta/Chave","Nome"', ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'minhas-transferencias-pix.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function filteredJobs() {
    const q = jobSearch.trim().toLowerCase()
    if (!q) return jobLogs
    return jobLogs.filter((j) => [j.id, j.status, j.message, j.created_at].join(' ').toLowerCase().includes(q))
  }
  function copyJobs() {
    const header = 'Job ID\tStatus\tMensagem\tCriado em'
    const rows = filteredJobs().map((j) => `${j.id}\t${j.status}\t${j.message}\t${j.created_at}`)
    copyToClipboard([header, ...rows].join('\n'))
    showToast('Importações copiadas')
  }
  function exportJobsCSV() {
    const header = '"Job ID","Status","Mensagem","Criado em"'
    const rows = filteredJobs().map((j) => `"${j.id}","${j.status}","${j.message}","${j.created_at}"`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'minhas-importacoes-pix.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ---- UI
  return (
    <div className="content">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Área Pix</p>
          <h2 className="text-lg font-medium">Transferência via Pix</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <Image src="/placeholder-avatar.png" alt="avatar" fill className="rounded-full object-cover" />
          </div>
          <div className="text-sm">
            <p className="font-medium">{user.name}</p>
            <p className="text-gray-500">Saldo: {formatCurrencyBR(user.balance)}</p>
          </div>
        </div>
      </div>

      {/* Tabs header */}
      <div className="intro-y col-span-12 lg:col-span-9">
        <ul className="nav nav-boxed-tabs active grid grid-cols-3 gap-2">
          <li className="nav-item">
            <button
              className={`nav-link w-full py-2 ${
                active === 'pix-key' ? 'active bg-blue-50 border border-blue-200 rounded-md' : 'bg-white border rounded-md'
              }`}
              onClick={() => setActive('pix-key')}
            >
              Chave Pix
            </button>
          </li>

          {user.transferencia_pix_planilha && (
            <li className="nav-item">
              <button
                className={`nav-link w-full py-2 ${
                  active === 'pix-import' ? 'active bg-blue-50 border border-blue-200 rounded-md' : 'bg-white border rounded-md'
                }`}
                onClick={() => setActive('pix-import')}
              >
                Importar Planilha
              </button>
            </li>
          )}

          {/* <li className="nav-item">
            <button
              className={`nav-link w-full py-2 ${
                active === 'account-transfer' ? 'active bg-blue-50 border border-blue-200 rounded-md' : 'bg-white border rounded-md'
              }`}
              onClick={() => setActive('account-transfer')}
            >
              Dados Bancários
            </button>
          </li> */}
        </ul>
      </div>

      {/* TAB CONTENT */}
      <div className="intro-y col-span-12 lg:col-span-9 mt-5">
        {/* --- TAB CHAVE PIX --- */}
        {active === 'pix-key' && (
          <div id="pix-key-tab" className={box}>
            <div className="flex items-center justify-between">
              <h4 className="text-gray-900">Dados da Chave Pix</h4>
              {user.my_user_beneficiarie_id !== 0 && myUserBeneficiary?.bank?.name !== '—' && (
                <button
                  className={clsBtn}
                  onClick={() =>
                    openSendModalFrom(
                      { id: myUserBeneficiary.id, bank: myUserBeneficiary.bank, account_name: myUserBeneficiary.account_name },
                      myUserBeneficiary.bank.name,
                    )
                  }
                >
                  Transferir para minha conta
                </button>
              )}
            </div>

            {/* FORM sem "Tipo de Chave" (auto) */}
            <form className="mt-4 space-y-4" onSubmit={submitPixKey}>
              <div>
                <label className={clsLabel}>Digite a chave *</label>
                <input
                  className={clsInput}
                  value={pixKeyValue}
                  onChange={(e) => setPixKeyValue(e.target.value)}
                  onBlur={onPixKeyBlur}
                  placeholder="E-mail, CNPJ, CPF, telefone ou chave aleatória"
                  required
                />
              </div>

              <div>
                <label className={clsLabel}>
                  Valor * <span className="text-xs text-gray-500 ml-2">{limitsText}</span>
                </label>
                <input
                  className={clsInput}
                  placeholder="0,00"
                  value={pixAmount}
                  onChange={(e) => setPixAmount(maskCurrencyInput(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className={clsLabel}>Descrição</label>
                <input className={clsInput} value={pixDesc} onChange={(e) => setPixDesc(e.target.value)} />
              </div>

              {/* Modo de autorização (OTP via email) */}
              {otpEnabled && (
                <div>
                  <label className={clsLabel}>Modo de autorização *</label>
                  <select className={clsInput} value={authModePix} onChange={(e) => setAuthModePix(e.target.value as any)} required>
                    <option value="Email">Email</option>
                  </select>
                </div>
              )}

              <div className="text-right">
                <button className={clsBtn} type="submit">
                  Enviar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- TAB IMPORTAR PLANILHA --- */}
        {active === 'pix-import' && user.transferencia_pix_planilha && (
          <div id="pix-key-import" className={box}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900">Minhas Importações</h2>
              <button className={clsBtn} onClick={() => setImportModalOpen(true)}>
                Importar Planilha
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex items-center gap-3">
                <button className="btn box border px-3 py-2 text-sm" onClick={copyJobs}>
                  Copiar Dados
                </button>
                <button className="btn box border px-3 py-2 text-sm" onClick={exportJobsCSV}>
                  Exportar para CSV
                </button>
                <button className="btn box border px-3 py-2 text-sm" onClick={() => window.print()}>
                  Exportar para PDF
                </button>
              </div>
              <div className="ml-auto">
                <input className={clsInput} placeholder="Search..." value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} />
              </div>
            </div>

            <div className="overflow-auto mt-4">
              <table className="table-auto w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Job ID</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Mensagem</th>
                    <th className="py-2 pr-3">Criado em</th>
                    <th className="py-2 pr-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs().map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="py-2 pr-3">{log.id}</td>
                      <td className="py-2 pr-3">{log.status}</td>
                      <td className="py-2 pr-3">{log.message}</td>
                      <td className="py-2 pr-3">{log.created_at}</td>
                      <td className="py-2 pr-3">
                        <button className="text-blue-600 hover:underline text-sm" onClick={() => alert(`Detalhes #${log.id} (simulação)`)}>
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredJobs().length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">
                        Sem registros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {importModalOpen && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h5 className="text-gray-900">Importar Planilha</h5>
                    <button onClick={() => setImportModalOpen(false)} className="text-gray-500">
                      ✕
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <a
                      href="/assets/docs/planilha-padrao-chave-pix.xlsx"
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Baixar Planilha Modelo
                    </a>
                    <p>
                      <strong>Após a importação da planilha:</strong>
                    </p>
                    <p>
                      Os dados serão validados e processados automaticamente. Você receberá um relatório com o status da
                      importação e quaisquer erros encontrados.
                    </p>

                    <div>
                      <label className={clsLabel}>Selecione a planilha *</label>
                      <input type="file" accept=".xlsx,.xls" className={clsInput} onChange={() => {}} />
                    </div>
                  </div>
                  <div className="p-4 border-t text-right">
                    <button
                      className={clsBtn}
                      onClick={() => {
                        setImportModalOpen(false)
                        showToast('Arquivo enviado (simulação)')
                      }}
                    >
                      Importar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB DADOS BANCÁRIOS --- */}
        {active === 'account-transfer' && (
          <div id="account-transfer-tab" className={box}>
            <div className="flex items-center justify-between">
              <h4 className="text-gray-900">Dados Bancários</h4>
              {user.my_user_beneficiarie_id !== 0 && myUserBeneficiary?.bank?.name !== '—' && (
                <button
                  className={clsBtn}
                  onClick={() =>
                    openSendModalFrom(
                      { id: myUserBeneficiary.id, bank: myUserBeneficiary.bank, account_name: myUserBeneficiary.account_name },
                      myUserBeneficiary.bank.name,
                    )
                  }
                >
                  Transferir para minha conta
                </button>
              )}
            </div>

            <form className="mt-4 space-y-4" onSubmit={submitAccountTransfer}>
              <div>
                <label className={clsLabel}>Nome do Banco *</label>
                <input
                  list="banks"
                  className={clsInput}
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Digite o nome do banco"
                  required
                />
                <datalist id="banks">
                  {bankOptions.map((opt, i) => (
                    <option key={i} value={opt} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className={clsLabel}>Tipo da Conta *</label>
                <select className={clsInput} value={accType} onChange={(e) => setAccType(e.target.value as any)} required>
                  <option value="">Escolha o tipo de conta</option>
                  <option value="CONTA_CORRENTE">Conta Corrente</option>
                  <option value="CONTA_POUPANCA">Poupança</option>
                  <option value="CONTA_PAGAMENTO">Conta Pagamento</option>
                  <option value="CONTA_FACIL">Conta Fácil</option>
                  <option value="ENTIDADES_PUBLICAS">Entidades Públicas</option>
                </select>
              </div>

              <div>
                <label className={clsLabel}>Nome Completo *</label>
                <input className={clsInput} value={accName} onChange={(e) => setAccName(e.target.value)} required />
              </div>

              <div>
                <label className={clsLabel}>CPF/CNPJ *</label>
                <input className={clsInput} value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={clsLabel}>Agência (sem dígito) *</label>
                  <input className={clsInput} value={branch} onChange={(e) => setBranch(e.target.value)} required />
                </div>
                <div>
                  <label className={clsLabel}>Número da Conta *</label>
                  <input className={clsInput} value={accNumber} onChange={(e) => setAccNumber(e.target.value)} required />
                </div>
                <div>
                  <label className={clsLabel}>Dígito da Conta *</label>
                  <input className={clsInput} value={accDigit} onChange={(e) => setAccDigit(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className={clsLabel}>
                  Valor * <span className="text-xs text-gray-500 ml-2">{limitsText}</span>
                </label>
                <input
                  className={clsInput}
                  placeholder="0,00"
                  value={accAmount}
                  onChange={(e) => setAccAmount(maskCurrencyInput(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className={clsLabel}>Descrição</label>
                <input className={clsInput} value={accDesc} onChange={(e) => setAccDesc(e.target.value)} />
              </div>

              {otpEnabled && (
                <div>
                  <label className={clsLabel}>Modo de autorização *</label>
                  <select className={clsInput} value={authModeAcc} onChange={(e) => setAuthModeAcc(e.target.value as any)} required>
                    <option value="Email">Email</option>
                  </select>
                </div>
              )}

              <div className="text-right">
                <button className={clsBtn} type="submit">
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ----------- Minhas Transferências Pix ----------- */}
      <div className="grid grid-cols-12 gap-6 mt-10">
        <div className="col-span-12 xl:col-span-9">
          <div className="intro-y grid grid-cols-12 gap-4">
            <div className="col-span-12">
              <h2 className="text-lg font-medium">Minhas Transferências Pix</h2>
            </div>

            <div className="col-span-12 flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex items-center gap-3">
                <button className="btn box border px-3 py-2 text-sm" onClick={copyTable}>
                  Copiar Dados
                </button>
                <button className="btn box border px-3 py-2 text-sm" onClick={exportCSV}>
                  Exportar para Excel (CSV)
                </button>
                <button className="btn box border px-3 py-2 text-sm" onClick={() => window.print()}>
                  Exportar para PDF
                </button>
              </div>
              <div className="ml-auto">
                <input className={clsInput} placeholder="Search..." value={searchBenef} onChange={(e) => setSearchBenef(e.target.value)} />
              </div>
            </div>

            <div className="col-span-12 overflow-auto">
              <table className="table-auto w-full text-sm mt-2">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-3">Bank</th>
                    <th className="py-2 pr-3">Conta.</th>
                    <th className="py-2 pr-3">Nome</th>
                    <th className="py-2 pr-3">Selecionar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBenefs().map((b) => (
                    <tr key={b.id} className="border-b">
                      <td className="py-2 pr-3 text-slate-600">{b.bank?.name}</td>
                      <td className="py-2 pr-3 text-slate-600">
                        {b.bank?.name === 'Dobank_PIX'
                          ? `${b.pix_key_type ?? ''} ${b.pix_key ?? ''}`
                          : b.account_number
                          ? b.account_number
                          : b.pix_key ?? ''}
                      </td>
                      <td className="py-2 pr-3 text-slate-600">{b.account_name || b.pix_key || '—'}</td>
                      <td className="py-2 pr-3">
                        <button className={`${clsBtn} w-24`} onClick={() => openSendModalFrom(b, b.bank?.name || '—')}>
                          Transferir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBenefs().length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
                        Sem registros
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Pix Recente */}
      {recentModalOpen && recentTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h5 className="text-gray-900">Pix Recente</h5>
              <button className="text-gray-500" onClick={() => setRecentModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={submitRecent}>
              <div className="p-6 space-y-4">
                <div>
                  <label className={clsLabel}>Bank *</label>
                  <input className={clsInput} value={recentTarget.bank_name} readOnly />
                </div>

                <div>
                  <label className={clsLabel}>Recipient</label>
                  <input className={clsInput} value={recentTarget.name} readOnly />
                </div>

                <div>
                  <label className={clsLabel}>
                    Valor *{' '}
                    <span className="text-xs text-gray-500 ml-2">
                      Limites: {formatCurrencyBR(recentTarget.limits.minimum_limit, '')}-
                      {formatCurrencyBR(recentTarget.limits.maximum_limit, '')}
                    </span>
                  </label>
                  <input
                    className={clsInput}
                    placeholder="0,00"
                    value={recentAmount}
                    onChange={(e) => setRecentAmount(maskCurrencyInput(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label className={clsLabel}>Descrição</label>
                  <input className={clsInput} value={recentDesc} onChange={(e) => setRecentDesc(e.target.value)} />
                </div>

                {otpEnabled && (
                  <div>
                    <label className={clsLabel}>Modo de autorização *</label>
                    <select className={clsInput} value={authModeRecent} onChange={(e) => setAuthModeRecent(e.target.value as any)} required>
                      <option value="Email">Email</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="p-4 border-t text-right">
                <button className={clsBtn} type="submit">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Escolha entre CPF ou Telefone (quando 11 dígitos) */}
      {chooseTypeOpen && chooseTypeContext && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h5 className="text-gray-900">Qual é o tipo da chave?</h5>
              <button className="text-gray-500" onClick={() => setChooseTypeOpen(false)}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                A chave digitada (<strong>{chooseTypeContext.rawKey}</strong>) pode ser <strong>CPF</strong> ou <strong>Telefone</strong>.
                Selecione uma opção para continuar.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 rounded-md py-2 text-sm"
                  onClick={() => {
                    setPixKeyType('CPF')
                    setPixKeyValue(chooseTypeContext.rawKey)
                    setChooseTypeOpen(false)
                    setConfirmData({ type: 'CPF', key: chooseTypeContext.rawKey, amount: chooseTypeContext.amount, desc: pixDesc || undefined })
                    setConfirmOpen(true)
                  }}
                >
                  CPF
                </button>
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 rounded-md py-2 text-sm"
                  onClick={() => {
                    const phone = ensurePhoneWithCountry(chooseTypeContext.rawKey)
                    setPixKeyType('TELEFONE')
                    setPixKeyValue(phone)
                    setChooseTypeOpen(false)
                    setConfirmData({ type: 'TELEFONE', key: phone, amount: chooseTypeContext.amount, desc: pixDesc || undefined })
                    setConfirmOpen(true)
                  }}
                >
                  Telefone
                </button>
              </div>
              <p className="text-xs text-gray-500">Se escolher Telefone, vamos usar o formato internacional automaticamente (ex.: +55...).</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmação antes de enviar */}
      {confirmOpen && confirmData && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h5 className="text-gray-900">Confirmar transferência</h5>
              <button className="text-gray-500" onClick={() => setConfirmOpen(false)}>✕</button>
            </div>
            <div className="p-6 space-y-3">
              <div className="text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Tipo de chave:</span><span className="font-medium">{confirmData.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Chave:</span><span className="font-medium break-all">{confirmData.key}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Valor:</span><span className="font-medium">{formatCurrencyBR(confirmData.amount)}</span></div>
                {(() => {
                  const { fixed, percent, fee, total } = calcCharges(confirmData.amount)
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tarifa:</span>
                        <span className="font-medium">
                          {formatCurrencyBR(fixed)} + {percent}% = {formatCurrencyBR(fee)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total a debitar:</span>
                        <span className="font-semibold">{formatCurrencyBR(total)}</span>
                      </div>
                    </>
                  )
                })()}
                {confirmData.desc && (
                  <div className="mt-2">
                    <span className="text-gray-600 text-sm">Descrição:</span>
                    <div className="text-sm">{confirmData.desc}</div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">Revise os dados. Ao confirmar, enviaremos o pedido e você será direcionado para a verificação por e-mail.</p>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button className="px-4 py-2 rounded-md border" onClick={() => setConfirmOpen(false)}>Cancelar</button>
              <button className={`${clsBtn} disabled:opacity-60`} onClick={confirmAndSendPix} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Confirmar e enviar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-md shadow">
          {toast}
        </div>
      )}
    </div>
  )
}
