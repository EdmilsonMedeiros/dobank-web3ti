// src/app/(hydrogen)/support/[ticket]/SupportView.tsx
'use client'

import Link from 'next/link'
import React, { useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type StatusCode = 0 | 1 | 2 | 3
type PriorityCode = 1 | 2 | 3

type Attachment = {
  id?: number | string
  name?: string
  filename?: string
  url?: string
  download_url?: string
  attachment?: string // nome do arquivo salvo (alguns backends mandam assim)
}

type Message = {
  id: number
  admin_id: number // 0 = usuário, >0 = staff
  message: string
  created_at: string
  attachments?: Attachment[]
  admin?: { name?: string } | null
  ticket?: { name?: string } | null
}

type Ticket = {
  id: number
  ticket: string | number
  subject: string
  status: StatusCode
  priority: PriorityCode
  name?: string
  last_reply?: string
  created_at?: string
  updated_at?: string
}

interface Props {
  apiBaseUrl: string
  authToken: string
  ticketNumber: string
  initialTicket: Ticket
  initialMessages: Message[]
}

function StatusBadge({ status }: { status: StatusCode }) {
  const map: Record<StatusCode, { label: string; className: string }> = {
    0: { label: 'Open',     className: 'bg-emerald-100 text-emerald-800' },
    1: { label: 'Answered', className: 'bg-blue-100 text-blue-800' },
    2: { label: 'Replied',  className: 'bg-amber-100 text-amber-800' },
    3: { label: 'Closed',   className: 'bg-rose-100 text-rose-800' },
  }
  const { label, className } = map[status]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
}

function PriorityBadge({ priority }: { priority: PriorityCode }) {
  const map: Record<PriorityCode, { label: string; className: string }> = {
    1: { label: 'Low',    className: 'bg-gray-200 text-gray-800' },
    2: { label: 'Medium', className: 'bg-emerald-100 text-emerald-800' },
    3: { label: 'High',   className: 'bg-blue-100 text-blue-800' },
  }
  const { label, className } = map[priority]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
}

function formatWhen(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

type FileRow = { id: string; file?: File | null }

export default function SupportView({
  apiBaseUrl, authToken, ticketNumber, initialTicket, initialMessages,
}: Props) {
  const router = useRouter()

  const [ticket, setTicket] = useState<Ticket>(initialTicket)
  const [messages] = useState<Message[]>(initialMessages)

  // Form de resposta
  const [replyText, setReplyText] = useState('')
  const [files, setFiles] = useState<FileRow[]>([{ id: crypto.randomUUID(), file: null }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const allowExt = '.jpg,.jpeg,.png,.doc,.docx,.pdf'

  const canReply = ticket?.status !== 3 // não está fechado

  function addFileRow() {
    setFiles((prev) => [...prev, { id: crypto.randomUUID(), file: null }])
  }
  function removeFileRow(id: string) {
    setFiles((prev) => (prev.length > 1 ? prev.filter(f => f.id !== id) : prev))
  }
  function handleFileChange(id: string, f?: File | null) {
    setFiles(prev => prev.map(row => row.id === id ? { ...row, file: f ?? null } : row))
  }

  // Responder (multipart/form-data como no Blade)
  async function onSubmitReply(e: React.FormEvent) {
    e.preventDefault()
    if (!canReply || isSubmitting) return
    if (!replyText.trim()) {
      alert('Escreva sua resposta.')
      return
    }

    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('replayTicket', '1')
      fd.append('message', replyText)
      files.forEach((row) => { if (row.file) fd.append('attachments[]', row.file) })

      // ✅ Endpoint correto para reply/close:
      // POST /support/reply/{ticket}
      const res = await fetch(`${apiBaseUrl}/support/reply/${ticketNumber}`, {
        method: 'POST',
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : '',
          Accept: 'application/json',
        },
        body: fd,
      })

      if (!res.ok) {
        let msg = 'Falha ao enviar resposta.'
        try { const j = await res.json(); msg = j?.message ?? msg } catch {}
        throw new Error(msg)
      }

      setReplyText('')
      setFiles([{ id: crypto.randomUUID(), file: null }])
      router.refresh()
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível enviar a resposta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fechar (estável)
  const onClose = useCallback(async () => {
    if (!confirm('Tem certeza que deseja fechar este ticket?')) return
    setIsClosing(true)
    try {
      const res = await fetch(`${apiBaseUrl}/support/reply/${ticketNumber}`, {
        method: 'POST',
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : '',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replayTicket: 2 }),
      })
      if (!res.ok) {
        let msg = 'Falha ao fechar ticket.'
        try { const j = await res.json(); msg = j?.message ?? msg } catch {}
        throw new Error(msg)
      }

      // Marca como fechado localmente e força atualização
      setTicket((t) => ({ ...t, status: 3 }))
      router.refresh()
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível fechar o ticket.')
    } finally {
      setIsClosing(false)
    }
  }, [apiBaseUrl, authToken, ticketNumber, router])

  const headerStatusNode = useMemo(() => (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
        <span className="text-sm text-gray-700">
          [Ticket #{ticket.ticket}] {ticket.subject}
        </span>
      </div>

      {ticket.status !== 3 && (
        <button
          type="button"
          onClick={onClose}
          disabled={isClosing}
          className="bg-rose-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-rose-700 disabled:opacity-50"
          title="Fechar ticket"
        >
          Fechar
        </button>
      )}
    </div>
  ), [ticket, isClosing, onClose])

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-xl font-semibold">Tickets de Suporte</h1>
          <div className="flex items-center gap-2">
            <Link href="/support" className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50">
              Voltar ao Histórico
            </Link>
          </div>
        </div>

        {/* Card principal */}
        <div className="p-6 space-y-6">
          <div className="bg-white rounded-xl border">
            <div className="p-5 space-y-5">
              {headerStatusNode}

              {/* Form de resposta */}
              <form onSubmit={onSubmitReply} className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5">Sua resposta</label>
                  <textarea
                    rows={6}
                    className="w-full h-28 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Escreva sua mensagem…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={!canReply}
                  />
                </div>

                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5" htmlFor="inputAttachments">
                    Anexos
                  </label>

                  <div className="space-y-3">
                    {files.map((row, idx) => (
                      <div key={row.id} className="flex items-center gap-2">
                        <input
                          id={idx === 0 ? 'inputAttachments' : undefined}
                          type="file"
                          accept={allowExt}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md"
                          onChange={(e) => handleFileChange(row.id, e.currentTarget.files?.[0] ?? null)}
                          disabled={!canReply}
                        />
                        {files.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFileRow(row.id)}
                            className="shrink-0 px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
                            title="Remover"
                            disabled={!canReply}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Extensões permitidas: .jpg, .jpeg, .png, .pdf, .doc, .docx
                  </p>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={addFileRow}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border hover:bg-gray-50 disabled:opacity-50"
                      disabled={!canReply}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Adicionar arquivo
                    </button>
                  </div>
                </div>

                <div className="col-span-12">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                    disabled={!canReply || isSubmitting}
                  >
                    {isSubmitting ? 'Enviando…' : 'Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Lista de mensagens */}
          <div className="bg-white rounded-xl border">
            <div className="p-5 space-y-6">
              {messages.map((m) => {
                const isUser = m.admin_id === 0
                const who = isUser ? (m.ticket?.name ?? 'Você') : (m.admin?.name ?? 'Staff')
                const role = isUser ? null : 'Staff'

                return (
                  <div key={m.id} className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-3">
                      <h5 className="my-1 font-medium">{who}</h5>
                      {role && <p className="text-sm text-gray-500">{role}</p>}
                    </div>
                    <div className="col-span-12 lg:col-span-9">
                      <p className="text-sm text-gray-500 mb-2">
                        Postado em {formatWhen(m.created_at)}
                      </p>
                      <p className="whitespace-pre-wrap">{m.message}</p>

                      {m.attachments && m.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-3">
                          {m.attachments.map((att, idx) => {
                            const label = att.name || att.filename || att.attachment || `Anexo ${idx + 1}`
                            const href = att.url || att.download_url
                            return href ? (
                              <a
                                key={`${m.id}-${idx}`}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                  <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" stroke="currentColor" strokeWidth="1.5"/>
                                  <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                                {label}
                              </a>
                            ) : (
                              <span key={`${m.id}-${idx}`} className="inline-flex items-center gap-2 text-gray-700">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                  <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" stroke="currentColor" strokeWidth="1.5"/>
                                  <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                                {label}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className="col-span-12">
                      <hr className="border-gray-100" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
