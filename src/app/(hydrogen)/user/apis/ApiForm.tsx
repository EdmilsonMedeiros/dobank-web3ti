// src/app/(hydrogen)/user/apis/ApiForm.tsx
'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'

type TipoCobranca = 'descontar' | 'adicionar'
type ModoAutorizacao = 'Email'

interface RecebimentosTaxas {
  pixMin: string
  pixMax: string
  pixTaxaFixa: string
  pixTaxaQrCode: string
  pixTaxaPercentual: string
  btcMin: string
  btcMax: string
  btcTaxaFixa: string
  btcTaxaPercentual: string
}
interface PagamentosTaxas {
  taxaPercentual: string
  taxaFixa: string
  minDiario: string
  maxDiario: string
  minNoturno: string
  maxNoturno: string
}

interface InitialData {
  apiBaseUrl: string
  authToken: string
  userId: number

  avatarUrl: string
  docsUrl: string
  pagamentosHabilitado: boolean
  otpEmailEnabled: boolean

  termoHtml: string
  recebimentos: {
    taxas: RecebimentosTaxas
    token: string | null
    hasToken: boolean
    autorizacaoSelecionada: ModoAutorizacao
    webhookUrl: string
    tipoCobranca: TipoCobranca
  }
  pagamentos: {
    taxas: PagamentosTaxas
    token: string | null
    autorizacaoSelecionada: ModoAutorizacao
    webhookUrl: string
  }
}

interface ApiFormProps {
  initialData: InitialData
}

export default function ApiForm({ initialData }: ApiFormProps) {
  const [activeTab, setActiveTab] = useState<'recebimentos' | 'pagamentos'>('recebimentos')

  // ===== Recebimentos (state) =====
  const [recTaxas] = useState(initialData.recebimentos.taxas)
  const [recToken, setRecToken] = useState<string | null>(initialData.recebimentos.token)
  const [recTokenVisible, setRecTokenVisible] = useState(false)
  const [isRevealingRecToken, setIsRevealingRecToken] = useState(false)
  const [recAutorizacao, setRecAutorizacao] = useState<ModoAutorizacao>(
    initialData.recebimentos.autorizacaoSelecionada,
  )
  const [termoAceito, setTermoAceito] = useState(false)
  const [recWebhookUrl, setRecWebhookUrl] = useState(initialData.recebimentos.webhookUrl)
  const [tipoCobranca, setTipoCobranca] = useState<TipoCobranca>(initialData.recebimentos.tipoCobranca)

  // ===== Pagamentos (state) =====
  const [pgTaxas] = useState(initialData.pagamentos.taxas)
  const [pgToken] = useState<string | null>(initialData.pagamentos.token)
  const [pgAutorizacao, setPgAutorizacao] = useState<ModoAutorizacao>(
    initialData.pagamentos.autorizacaoSelecionada,
  )
  const [pgWebhookUrl, setPgWebhookUrl] = useState(initialData.pagamentos.webhookUrl)

  const inputClass =
    'w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelClass = 'block text-sm text-gray-600 mb-1.5'

  const TabButton: React.FC<{
    id: 'recebimentos' | 'pagamentos'
    children: React.ReactNode
    disabled?: boolean
  }> = ({ id, children, disabled }) => (
    <button
      onClick={() => !disabled && setActiveTab(id)}
      className={[
        'px-4 py-2 rounded-md text-sm font-medium border',
        activeTab === id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
      type="button"
      aria-pressed={activeTab === id}
      disabled={disabled}
    >
      {children}
    </button>
  )

  const handleCopy = async (value: string | null) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      alert('Token copiado para a área de transferência!')
    } catch {
      alert('Não foi possível copiar o token.')
    }
  }

  // -------------------------------
  // AÇÕES (seguem a mesma lógica/contratos do Blade):
  // - Gerar token recebimentos: type = "get_api_token", verification = 2 (Email)
  // - Atualizar config recebimentos: type = "update_api_data"
  // - Trocar token pagamentos: type = "get_api_token_pg"
  // - Atualizar config pagamentos: type = "update_api_data_pagamento"
  // Endpoint de ação: POST /user.action
  // -------------------------------
  async function postUserAction(body: Record<string, any>) {
    const res = await fetch(`${initialData.apiBaseUrl}/user/action`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${initialData.authToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      // tenta extrair {message} antes de cair no texto cru
      try {
        const j = await res.json()
        throw new Error(j?.message || 'Falha na operação')
      } catch {
        const err = await res.text().catch(() => '')
        throw new Error(err || 'Falha na operação')
      }
    }
    return res.json().catch(() => ({}))
  }

  // >>> ADICIONADO: trata respostas que exigem redirecionamento (OTP / redirect_to)
  function handleActionResponse(data: any, fallbackMsg: string) {
    if (data?.status === 'pending_otp' && data?.action_id) {
      const qs = `?action_id=${data.action_id}`
      window.location.href = `/user/verify/otp${qs}`
      return
    }
    if (data?.status === 'success' && data?.redirect_to) {
      window.location.href = data.redirect_to
      return
    }
    alert(data?.message ?? fallbackMsg)
  }

  // Revela e copia o token de RECEBIMENTO (marca como visto no backend)
  async function handleRevealAndCopyRecToken() {
    setIsRevealingRecToken(true)
    try {
      const res = await fetch(`${initialData.apiBaseUrl}/apis/token-seen`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${initialData.authToken}`,
          Accept: 'application/json',
        },
      })

      if (!res.ok) {
        let msg = 'Não foi possível exibir o token.'
        try {
          const data = await res.json()
          if (res.status === 403) {
            msg = data?.message ?? 'Você não tem permissão para visualizar o token novamente.'
          } else if (res.status === 404) {
            msg = data?.message ?? 'Token não encontrado.'
          }
        } catch {}
        alert(msg)
        return
      }

      const data = await res.json()
      const token = data?.token ?? ''
      if (!token) {
        alert('Token vazio ou inválido.')
        return
      }

      setRecToken(token)
      setRecTokenVisible(true)

      try {
        await navigator.clipboard.writeText(token)
        alert('Token exibido e copiado com sucesso!')
      } catch {
        alert('Token exibido. Não foi possível copiar automaticamente.')
      }
    } catch {
      alert('Falha ao contatar o servidor.')
    } finally {
      setIsRevealingRecToken(false)
    }
  }

  // Igual ao Blade: após solicitar/renovar, ir para a tela de OTP
  const gerarOuTrocarTokenRecebimentos = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termoAceito) {
      alert('Você precisa aceitar o termo para gerar o token.')
      return
    }
    try {
      const { action_id } = await postUserAction({
        id: initialData.userId,
        type: 'get_api_token',
        verification: recAutorizacao === 'Email' ? 2 : undefined,
      })
      const qs = action_id ? `?action_id=${action_id}` : ''
      window.location.href = `/user/verify/otp${qs}`
    } catch (err: any) {
      alert(`Erro ao solicitar token: ${err?.message ?? 'tente novamente'}`)
    }
  }

  const atualizarConfigRecebimentos = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = await postUserAction({
        id: initialData.userId,
        type: 'update_api_data',
        api_tipo_cobranca: tipoCobranca,
        webhook_url: recWebhookUrl,
        verification: recAutorizacao === 'Email' ? 2 : undefined,
      })
      handleActionResponse(data, 'Configurações de recebimento atualizadas.')
    } catch (err: any) {
      alert(`Erro ao atualizar configurações: ${err?.message ?? 'tente novamente'}`)
    }
  }

  // Igual ao Blade: após trocar token de pagamentos, ir para a tela de OTP
  const trocarTokenPagamentos = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { action_id } = await postUserAction({
        id: initialData.userId,
        type: 'get_api_token_pg',
        verification: pgAutorizacao === 'Email' ? 2 : undefined,
      })
      const qs = action_id ? `?action_id=${action_id}` : ''
      window.location.href = `/user/verify/otp${qs}`
    } catch (err: any) {
      alert(`Erro ao solicitar token (pagamentos): ${err?.message ?? 'tente novamente'}`)
    }
  }

  const atualizarConfigPagamentos = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = await postUserAction({
        id: initialData.userId,
        type: 'update_api_data_pagamento',
        webhook_url_pagamento: pgWebhookUrl,
        verification: pgAutorizacao === 'Email' ? 2 : undefined,
      })
      handleActionResponse(data, 'Configurações de pagamento atualizadas.')
    } catch (err: any) {
      alert(`Erro ao atualizar configurações (pagamentos): ${err?.message ?? 'tente novamente'}`)
    }
  }

  const termoNode = useMemo(
    () => (
      <div className="prose prose-sm max-w-none">
        <div dangerouslySetInnerHTML={{ __html: initialData.termoHtml }} />
      </div>
    ),
    [initialData.termoHtml],
  )

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-xl font-semibold">APIs</h1>

          <div className="flex items-center gap-4">
            <a
              href={initialData.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded-md hover:bg-gray-200 border"
            >
              Ver Documentação
            </a>
            <div className="w-16 h-16 relative">
              <Image src={initialData.avatarUrl} alt="Avatar" fill className="rounded-lg object-cover" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6 border-b">
          <div className="flex gap-2">
            <TabButton id="recebimentos">Recebimentos</TabButton>
            <TabButton id="pagamentos" disabled={!initialData.pagamentosHabilitado}>
              Pagamentos
            </TabButton>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {activeTab === 'recebimentos' ? (
            <div className="grid grid-cols-12 gap-6">
              {/* Coluna Taxas / Limites */}
              <div className="col-span-12 lg:col-span-4 2xl:col-span-3">
                <div className="bg-white rounded-xl border">
                  <div className="p-5">
                    <div className="grid gap-3">
                      <h3 className="text-base font-medium">Taxas e Limites de Recebimento</h3>

                      <div>
                        <label className={labelClass}>PIX Mínimo</label>
                        <input className={inputClass} value={recTaxas.pixMin} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>PIX Máximo</label>
                        <input className={inputClass} value={recTaxas.pixMax} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>PIX Taxa Fixa</label>
                        <input className={inputClass} value={recTaxas.pixTaxaFixa} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>PIX Taxa QRCode</label>
                        <input className={inputClass} value={recTaxas.pixTaxaQrCode} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>PIX Taxa Percentual</label>
                        <input className={inputClass} value={recTaxas.pixTaxaPercentual} disabled />
                      </div>

                      <div className="pt-2 border-t" />

                      <div>
                        <label className={labelClass}>BTC Mínimo</label>
                        <input className={inputClass} value={recTaxas.btcMin} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>BTC Máximo</label>
                        <input className={inputClass} value={recTaxas.btcMax} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>BTC Taxa Fixa</label>
                        <input className={inputClass} value={recTaxas.btcTaxaFixa} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>BTC Taxa Percentual</label>
                        <input className={inputClass} value={recTaxas.btcTaxaPercentual} disabled />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Formulários */}
              <div className="col-span-12 lg:col-span-8 2xl:col-span-9">
                <div className="bg-white rounded-xl border">
                  <div className="p-5 space-y-10">
                    {/* API de Recebimento - Token */}
                    <section className="grid gap-4">
                      <h2 className="text-base font-medium">API de Recebimento</h2>

                      <div className="grid gap-2">
                        <label className={labelClass}>API Token</label>
                        <textarea
                          className="w-full h-28 p-3 bg-gray-50 border border-gray-200 rounded-md"
                          value={recTokenVisible && recToken ? recToken : ''}
                          placeholder='Clique em "Copiar Token" para revelar.'
                          disabled
                        />
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={handleRevealAndCopyRecToken}
                            disabled={isRevealingRecToken}
                            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isRevealingRecToken ? 'Revelando...' : 'Copiar Token'}
                          </button>
                        </div>
                      </div>

                      <form onSubmit={gerarOuTrocarTokenRecebimentos} className="grid gap-4">
                        <div>
                          <label className={labelClass}>Authorization Mode *</label>
                          <select
                            className={inputClass}
                            value={recAutorizacao}
                            onChange={(e) => setRecAutorizacao(e.target.value as ModoAutorizacao)}
                            required
                          >
                            {initialData.otpEmailEnabled && <option value="Email">Email</option>}
                          </select>
                        </div>

                        {/* Termo */}
                        <div>
                          <div className="h-64 overflow-y-auto bg-gray-50 border border-gray-200 rounded-md p-4">
                            {termoNode}
                          </div>
                          <label className="mt-3 flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={termoAceito}
                              onChange={(e) => setTermoAceito(e.target.checked)}
                              required
                            />
                            <span>
                              Declaro que li e estou de acordo com o Termo de Consentimento e
                              Compartilhamento dos dados
                            </span>
                          </label>
                        </div>

                        <div className="flex justify-center pt-2">
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                          >
                            {initialData.recebimentos.hasToken ? 'Gerar novo token' : 'Gerar token'}
                          </button>
                        </div>
                      </form>
                    </section>

                    {/* Forma de cobrança */}
                    <section className="grid gap-3">
                      <h3 className="text-base font-medium text-center">Forma de cobrança das taxas</h3>
                      <p className="text-sm text-center text-gray-600">
                        <b>Descontar:</b> O cliente paga R$ 100,00 e você recebe já com a taxa descontada. Ex: R$
                        97,50
                        <br />
                        <b>Adicionar:</b> O cliente paga R$ 100,00 + taxa (Ex: R$ 102,50) e você recebe R$ 100,00.
                      </p>

                      {/* Toggle */}
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setTipoCobranca(tipoCobranca === 'descontar' ? 'adicionar' : 'descontar')
                          }
                          className={[
                            'relative w-full h-14 rounded-md transition-colors border',
                            tipoCobranca === 'descontar'
                              ? 'bg-green-500 border-green-600'
                              : 'bg-red-500 border-red-600',
                          ].join(' ')}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                            {tipoCobranca === 'descontar' ? 'Descontar' : 'Adicionar'}
                          </span>
                        </button>
                      </div>
                    </section>

                    {/* Webhook + aplicar alterações */}
                    <section className="grid gap-4">
                      <h3 className="text-base font-medium">Configuração do Webhook</h3>

                      <div>
                        <label className={labelClass}>URL do Webhook</label>
                        <input
                          className={inputClass}
                          value={recWebhookUrl}
                          onChange={(e) => setRecWebhookUrl(e.target.value)}
                          placeholder="https://"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Authorization Mode *</label>
                        <select
                          className={inputClass}
                          value={recAutorizacao}
                          onChange={(e) => setRecAutorizacao(e.target.value as ModoAutorizacao)}
                          required
                        >
                          {initialData.otpEmailEnabled && <option value="Email">Email</option>}
                        </select>
                      </div>

                      <form onSubmit={atualizarConfigRecebimentos}>
                        <div className="flex justify-center">
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                          >
                            Atualizar configurações
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // ======= Aba Pagamentos =======
            <div className="grid grid-cols-12 gap-6">
              {/* Coluna Taxas / Limites */}
              <div className="col-span-12 lg:col-span-4 2xl:col-span-3">
                <div className="bg-white rounded-xl border">
                  <div className="p-5">
                    <div className="grid gap-3">
                      <h3 className="text-base font-medium">Taxas e Limites de Pagamentos</h3>

                      <div>
                        <label className={labelClass}>Taxa Percentual</label>
                        <input className={inputClass} value={pgTaxas.taxaPercentual} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>Taxa Fixa</label>
                        <input className={inputClass} value={pgTaxas.taxaFixa} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>Valor mínimo diário</label>
                        <input className={inputClass} value={pgTaxas.minDiario} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>Valor máximo diário</label>
                        <input className={inputClass} value={pgTaxas.maxDiario} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>Valor mínimo noturno</label>
                        <input className={inputClass} value={pgTaxas.minNoturno} disabled />
                      </div>
                      <div>
                        <label className={labelClass}>Valor máximo noturno</label>
                        <input className={inputClass} value={pgTaxas.maxNoturno} disabled />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Formulários */}
              <div className="col-span-12 lg:col-span-8 2xl:col-span-9">
                <div className="bg-white rounded-xl border">
                  <div className="p-5 space-y-10">
                    {/* API de Pagamento - Token */}
                    <section className="grid gap-4">
                      <h2 className="text-base font-medium">API de Pagamento</h2>

                      <div className="grid gap-2">
                        <label className={labelClass}>API Token</label>
                        <textarea
                          className="w-full h-28 p-3 bg-gray-50 border border-gray-200 rounded-md"
                          value={pgToken ?? ''}
                          disabled
                        />
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleCopy(pgToken)}
                            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
                          >
                            Copiar Token
                          </button>
                        </div>
                      </div>

                      <form onSubmit={trocarTokenPagamentos} className="grid gap-4">
                        <div>
                          <label className={labelClass}>Authorization Mode *</label>
                          <select
                            className={inputClass}
                            value={pgAutorizacao}
                            onChange={(e) => setPgAutorizacao(e.target.value as ModoAutorizacao)}
                            required
                          >
                            {initialData.otpEmailEnabled && <option value="Email">Email</option>}
                          </select>
                        </div>

                        <div className="flex justify-center pt-2">
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                          >
                            Trocar Token
                          </button>
                        </div>
                      </form>
                    </section>

                    <section className="grid gap-3">
                      <h3 className="text-base font-medium text-center">Forma de cobrança das taxas</h3>
                      <p className="text-sm text-center text-gray-600">
                        Você paga ao beneficiário R$ 100,00; você é descontado em R$ 100,00 + taxa (Ex: R$ 102,50).
                      </p>
                    </section>

                    {/* Webhook + aplicar alterações */}
                    <section className="grid gap-4">
                      <h3 className="text-base font-medium">Configuração do Webhook</h3>
                      <p className="text-sm text-gray-600">Esta API não retorna informações ao seu webhook.</p>

                      <div>
                        <label className={labelClass}>URL do Webhook</label>
                        <input
                          className={inputClass}
                          value={pgWebhookUrl}
                          onChange={(e) => setPgWebhookUrl(e.target.value)}
                          placeholder="https://"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Authorization Mode *</label>
                        <select
                          className={inputClass}
                          value={pgAutorizacao}
                          onChange={(e) => setPgAutorizacao(e.target.value as ModoAutorizacao)}
                          required
                        >
                          {initialData.otpEmailEnabled && <option value="Email">Email</option>}
                        </select>
                      </div>

                      <form onSubmit={atualizarConfigPagamentos}>
                        <div className="flex justify-center">
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                          >
                            Atualizar configurações
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
