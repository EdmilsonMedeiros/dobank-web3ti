// src/app/(hydrogen)/user/verify/otp/VerifyOtp.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type OtpType = 1 | 2 | 3
type Action = {
  id: number | string
  otp_type?: OtpType
  expired_at?: string // ISO
  send_at?: string    // ISO
  used_at?: string | null
}

interface Props {
  apiBaseUrl: string
  authToken: string
  initialAction: Action
  initialUser?: any
  initialActionId?: string
  pageTitle: string
}

export default function VerifyOtp({
  apiBaseUrl,
  authToken,
  initialAction,
  initialUser,
  pageTitle,
  initialActionId,
}: Props) {
  const router = useRouter()

  const [action, setAction] = useState<Action>(initialAction)
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  // segundos restantes (como no Blade, mas calculado no client)
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const now = Date.now()
    const exp = action?.expired_at ? new Date(action.expired_at).getTime() : now
    const s = Math.max(0, Math.floor((exp - now) / 1000))
    return s
  })

  // Atualiza contagem regressiva
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Texto de instrução conforme tipo (replicando a lógica do Blade)
  const instruction = useMemo(() => {
    const t = action?.otp_type
    if (t === 2) return 'Verifique seu e-mail para obter o OTP de 6 dígitos.'
    if (t === 3) return 'Informe o código de 6 dígitos recebido por SMS.'
    if (t === 1) return new Date().toLocaleTimeString('pt-BR')
    return ''
  }, [action?.otp_type])

  // Quando tipo = 1, atualiza relógio a cada segundo (como no Blade)
  const [clock, setClock] = useState<string>(() => new Date().toLocaleTimeString('pt-BR'))
  useEffect(() => {
    if (action?.otp_type !== 1) return
    const id = setInterval(() => setClock(new Date().toLocaleTimeString('pt-BR')), 1000)
    return () => clearInterval(id)
  }, [action?.otp_type])

  const expired = secondsLeft === 0

  async function refetchAction() {
    const q = initialActionId ? `?action_id=${encodeURIComponent(initialActionId)}` : ''
    const res = await fetch(`${apiBaseUrl}/verify/otp${q}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      const next = data?.action as Action
      setAction(next)

      // recalcula o timer
      const now = Date.now()
      const exp = next?.expired_at ? new Date(next.expired_at).getTime() : now
      setSecondsLeft(Math.max(0, Math.floor((exp - now) / 1000)))
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || expired) return
    if (!otp.trim()) {
      alert('Informe o OTP.')
      return
    }

    setSubmitting(true)
    try {
      const body: Record<string, any> = { otp }
      if (initialActionId) body.action_id = initialActionId

      const res = await fetch(`${apiBaseUrl}/verify/otp/check`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg =
          data?.message ||
          data?.errors?.otp?.[0] ||
          'Falha ao verificar o OTP. Tente novamente.'
        throw new Error(msg)
      }

      alert(data?.message ?? 'OTP verificado com sucesso!')
      // comportamento pós-sucesso: volte para a home (ajuste se quiser outro destino)
      router.push('/user/apis')
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível verificar o OTP.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    if (resending) return
    setResending(true)
    try {
      const body: Record<string, any> = {}
      if (initialActionId) body.action_id = initialActionId

      const res = await fetch(`${apiBaseUrl}/verify/otp/resend`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.message || 'Não foi possível reenviar o OTP.'
        throw new Error(msg)
      }

      alert(data?.message ?? 'OTP reenviado com sucesso!')
      // reconsulta a ação para atualizar o expired_at / timer
      await refetchAction()
    } catch (err: any) {
      alert(err?.message ?? 'Erro ao reenviar OTP.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-xl font-semibold">Verificar OTP</h1>
          <div className="flex items-center gap-2">
            <Link href="/user/apis" className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50">
              Voltar
            </Link>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div className="bg-white rounded-xl border p-5">
            <div className="grid grid-cols-12 gap-6">
              {/* Caixa esquerda (instruções + timer) */}
              <div className="col-span-12 xl:col-span-7">
                <div className="rounded-lg p-5" style={{ backgroundColor: '#131313', color: '#f4f4f4' }}>
                  <div className="text-center">
                    <h4 className="mb-2 font-medium">{pageTitle}</h4>

                    {(action?.otp_type === 2 || action?.otp_type === 3) && (
                      <>
                        <p>{instruction}</p>

                        <p className="mt-2 mb-5">O OTP expira em:</p>

                        {/* Círculo com contagem (estilo do Blade adaptado) */}
                        <div className="mx-auto" style={{ maxWidth: '9em', height: '9em' }}>
                          <div className={`expired-time-circle ${expired ? 'danger-border' : ''}`}>
                            <div className="exp-time text-2xl font-semibold">{secondsLeft}</div>
                            <div>Segundos</div>
                            <div
                              className="animation-circle"
                              style={{
                                animationDuration: `${Math.max(1, secondsLeft)}s`,
                              }}
                            />
                          </div>
                          <div className="border-circle" />
                        </div>

                        {/* Botão de tentar novamente (mostrar quando expirar) */}
                        {expired && (
                          <div className="try-btn-wrapper my-5">
                            <p className="text-red-600 font-medium mb-2">Seu OTP expirou</p>
                            <button
                              onClick={handleResend}
                              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                              disabled={resending}
                            >
                              {resending ? 'Reenviando…' : 'Reenviar OTP'}
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {action?.otp_type === 1 && (
                      <div className="text-center mt-4">
                        <div className="text-lg" id="otp-time">
                          {clock}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Caixa direita (form) */}
              <div className="col-span-12 xl:col-span-5">
                {!expired && (
                  <form onSubmit={handleVerify} className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="block text-sm text-gray-600">Digite seu OTP</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="******"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        autoComplete="one-time-code"
                        required
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                        disabled={submitting}
                      >
                        {submitting ? 'Verificando…' : 'Verificar'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 mb-10" />
        </div>
      </div>

      {/* Estilos equivalentes aos do Blade (adaptados) */}
      <style jsx>{`
        .expired-time-circle {
          position: relative;
          border: none !important;
          justify-content: center;
          height: 100%;
          display: flex;
          align-items: center;
          flex-direction: column;
        }
        .expired-time-circle::before {
          position: absolute;
          content: '';
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 4px solid #88fb3b;
        }
        .expired-time-circle.danger-border .animation-circle {
          border-color: #f44336 !important;
        }
        .animation-circle {
          position: absolute;
          top: 0;
          left: 0;
          border: 4px solid #f44336;
          height: 100%;
          width: 100%;
          border-radius: 100%;
          box-shadow: 1px 1px 1px 1px rgba(255, 0, 0, 0.5);
          transform: rotateY(180deg);
          animation-name: clipCircle;
          animation-iteration-count: 1;
          animation-timing-function: cubic-bezier(0, 0, 1, 1);
          z-index: 1;
        }
        @keyframes clipCircle {
          0% {
            clip-path: polygon(
              50% 50%,
              50% 0%,
              50% 0%,
              50% 0%,
              50% 0%,
              50% 0%,
              50% 0%,
              50% 0%,
              50% 0%,
              50% 0%
            );
          }
          12.5% {
            clip-path: polygon(50% 50%, 50% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%);
          }
          25% {
            clip-path: polygon(50% 50%, 50% 0%, 0% 0%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%, 0% 50%);
          }
          37.5% {
            clip-path: polygon(50% 50%, 50% 0%, 0% 0%, 0% 50%, 0% 100%, 0% 100%, 0% 100%, 0% 100%, 0% 100%, 0% 100%);
          }
          50% {
            clip-path: polygon(50% 50%, 50% 0%, 0% 0%, 0% 50%, 0% 100%, 50% 100%, 50% 100%, 50% 100%, 50% 100%, 50% 100%);
          }
          62.5% {
            clip-path: polygon(50% 50%, 50% 0%, 0% 0%, 0% 50%, 0% 100%, 50% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%);
          }
          75% {
            clip-path: polygon(
              50% 50%,
              50% 0%,
              0% 0%,
              0% 50%,
              0% 100%,
              50% 100%,
              100% 100%,
              100% 50%,
              100% 50%,
              100% 50%
            );
          }
          87.5% {
            clip-path: polygon(
              50% 50%,
              50% 0%,
              0% 0%,
              0% 50%,
              0% 100%,
              50% 100%,
              100% 100%,
              100% 50%,
              100% 0%,
              100% 0%
            );
          }
          100% {
            clip-path: polygon(
              50% 50%,
              50% 0%,
              0% 0%,
              0% 50%,
              0% 100%,
              50% 100%,
              100% 100%,
              100% 50%,
              100% 0%,
              50% 0%
            );
          }
        }
      `}</style>
    </div>
  )
}
