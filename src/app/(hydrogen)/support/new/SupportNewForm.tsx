// src/app/(hydrogen)/support/new/SupportNewForm.tsx
'use client'

import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type PriorityCode = 1 | 2 | 3

interface InitialData {
  apiBaseUrl: string
  authToken: string
  presetName: string
  presetEmail: string
}

interface FileInputItem {
  id: string
  file?: File | null
}

const allowedExts = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'] as const
const MAX_FILES = 5
const MAX_MB = 2

function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

async function fileToBase64NoPrefix(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buf)
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as any)
  }
  return btoa(binary)
}

export default function SupportNewForm({ initialData }: { initialData: InitialData }) {
  const router = useRouter()

  // ----- Form state (como no Blade) -----
  const [name, setName] = useState(initialData.presetName)
  const [email, setEmail] = useState(initialData.presetEmail)
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState<PriorityCode>(2) // Medium por padrão
  const [message, setMessage] = useState('')

  // Anexos dinâmicos
  const [inputs, setInputs] = useState<FileInputItem[]>([{ id: uuid(), file: null }])
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accept = '.jpg,.jpeg,.png,.docx,.doc,.pdf'

  function addFileInput() {
    setInputs((prev) => (prev.length >= MAX_FILES ? prev : [...prev, { id: uuid(), file: null }]))
  }

  function removeFileInput(id: string) {
    setInputs((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev))
  }

  function handleFileChange(id: string, file?: File | null) {
    setInputs((prev) => prev.map((i) => (i.id === id ? { ...i, file: file ?? null } : i)))
  }

  function validate(): string | null {
    if (!name.trim()) return 'Preencha o nome.'
    if (!email.trim()) return 'Preencha o e-mail.'
    if (!subject.trim()) return 'Preencha o assunto.'
    if (!message.trim()) return 'Preencha a mensagem.'

    const files = inputs.map((i) => i.file).filter(Boolean) as File[]
    if (files.length > MAX_FILES) return `Máximo de ${MAX_FILES} arquivos.`

    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase() || ''
      if (!allowedExts.includes(ext as any)) {
        return 'Apenas arquivos jpg, jpeg, png, pdf, doc, docx são permitidos.'
      }
      const sizeMB = f.size / 1_000_000
      if (sizeMB > MAX_MB) return `Tamanho máximo por arquivo: ${MAX_MB}MB.`
    }
    return null
  }

  // ----- Envio: POST /support/create (JSON) -----
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    const err = validate()
    if (err) {
      alert(err)
      return
    }

    setIsSubmitting(true)
    try {
      const files = inputs.map((i) => i.file).filter(Boolean) as File[]
      const attachments = await Promise.all(
        files.map(async (file) => ({
          filename: file.name,
          content: await fileToBase64NoPrefix(file), // sem prefixo data:
        })),
      )

      const payload: any = {
        name,
        email,
        subject,
        message,
        priority, // 3 High, 2 Medium, 1 Low
      }
      if (attachments.length) payload.attachments = attachments

      const res = await fetch(`${initialData.apiBaseUrl}/support/create`, {
        method: 'POST',
        headers: {
          Authorization: initialData.authToken ? `Bearer ${initialData.authToken}` : '',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let msg = 'Falha ao abrir o ticket.'
        try {
          const data = await res.json()
          msg = data?.message || msg
        } catch {}
        throw new Error(msg)
      }

      const data = await res.json().catch(() => null)
      const ticketNum = data?.ticket?.ticket ?? null

      alert('Ticket enviado com sucesso!')
      router.push(ticketNum ? `/support/${String(ticketNum)}` : '/support')
    } catch (e: any) {
      alert(e?.message ?? 'Não foi possível enviar seu ticket.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

        {/* Card do Form */}
        <div className="p-6">
          <div className="bg-white rounded-xl border">
            <div className="p-5">
              <div className="flex items-center mb-6">
                <h2 className="text-base font-medium">Abrir Novo Ticket</h2>
              </div>

              <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-12 gap-6">
                {/* Nome */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5">Nome</label>
                  <input
                    type="text"
                    placeholder="Digite seu nome"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Assunto */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5">Assunto</label>
                  <input
                    type="text"
                    placeholder="Assunto"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Prioridade */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5">Prioridade *</label>
                  <select
                    required
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value) as PriorityCode)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={3}>High</option>
                    <option value={2}>Medium</option>
                    <option value={1}>Low</option>
                  </select>
                </div>

                {/* Mensagem */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5">Mensagem</label>
                  <textarea
                    rows={6}
                    placeholder="Descreva o problema..."
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-28 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Anexos */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5" htmlFor="inputAttachments">
                    Anexos
                  </label>

                  <div className="space-y-3">
                    {inputs.map((it, idx) => (
                      <div key={it.id} className="flex items-center gap-2">
                        <input
                          id={idx === 0 ? 'inputAttachments' : undefined}
                          type="file"
                          accept={accept}
                          onChange={(e) => handleFileChange(it.id, e.currentTarget.files?.[0] ?? null)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md"
                        />
                        {inputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFileInput(it.id)}
                            className="shrink-0 px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
                            title="Remover"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Extensões permitidas: .jpg, .jpeg, .png, .pdf, .doc, .docx
                    <br />
                    Máximo de {MAX_FILES} arquivos; até {MAX_MB}MB por arquivo.
                  </p>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={addFileInput}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border hover:bg-gray-50 disabled:opacity-50"
                      disabled={inputs.length >= MAX_FILES}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      Adicionar arquivo
                    </button>
                  </div>
                </div>

                {/* Enviar */}
                <div className="col-span-12">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando…' : 'Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
