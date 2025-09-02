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

export default function SupportNewForm({ initialData }: { initialData: InitialData }) {
  const router = useRouter()

  // ----- Form state (equivalente ao Blade) -----
  const [name, setName] = useState(initialData.presetName)
  const [email, setEmail] = useState(initialData.presetEmail)
  const [subject, setSubject] = useState('')
  const [priority, setPriority] = useState<PriorityCode>(2) // default "Medium"
  const [message, setMessage] = useState('')

  // Anexos dinâmicos (attachments[])
  const [inputs, setInputs] = useState<FileInputItem[]>([
    { id: crypto.randomUUID(), file: null },
  ])
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const accept =
    '.jpg,.jpeg,.png,.docx,.doc,.pdf' // Allowed File Extensions (como no Blade)

  function addFileInput() {
    setInputs((prev) => [...prev, { id: crypto.randomUUID(), file: null }])
  }

  function removeFileInput(id: string) {
    setInputs((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev))
  }

  function handleFileChange(id: string, file?: File | null) {
    setInputs((prev) =>
      prev.map((i) => (i.id === id ? { ...i, file: file ?? null } : i)),
    )
  }

  // ----- Submit (equivalente à action="ticket.store" com multipart/form-data) -----
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return

    // Validações simples (iguais às do Blade: required)
    if (!name.trim() || !email.trim() || !subject.trim()) {
      alert('Preencha nome, e-mail e assunto.')
      return
    }

    setIsSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('email', email)
      fd.append('subject', subject)
      fd.append('priority', String(priority)) // 3 High, 2 Medium, 1 Low
      fd.append('message', message)

      inputs.forEach((item) => {
        if (item.file) {
          fd.append('attachments[]', item.file)
        }
      })

      // No Blade: route('ticket.store') → por convenção REST do Laravel é POST /ticket
      // Ajuste a URL se sua API usar outro path (ex: /tickets/store)
      const res = await fetch(`${initialData.apiBaseUrl}/ticket`, {
        method: 'POST',
        headers: {
          // NÃO defina 'Content-Type' manualmente ao enviar FormData
          Authorization: initialData.authToken ? `Bearer ${initialData.authToken}` : '',
          Accept: 'application/json',
        },
        body: fd,
      })

      if (!res.ok) {
        let msg = 'Falha ao abrir o ticket.'
        try {
          const data = await res.json()
          msg = data?.message || msg
        } catch {}
        throw new Error(msg)
      }

      // Sucesso
      alert('Ticket enviado com sucesso!')
      router.push('/support')
    } catch (err: any) {
      alert(err?.message ?? 'Não foi possível enviar seu ticket.')
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
            <Link
              href="/support"
              className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50"
            >
              Voltar ao Histórico
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="p-6">
          <div className="bg-white rounded-xl border">
            <div className="p-5">
              <div className="flex items-center mb-6">
                <h2 className="text-base font-medium">Abrir Novo Ticket</h2>
              </div>

              <form
                ref={formRef}
                onSubmit={onSubmit}
                encType="multipart/form-data"
                className="grid grid-cols-12 gap-6"
              >
                {/* Name */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5">Nome</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Digite seu nome"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Digite seu e-mail"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Subject */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5">Assunto</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Assunto"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Priority */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5">
                    Prioridade *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value) as PriorityCode)}
                  >
                    <option value={3}>High</option>
                    <option value={2}>Medium</option>
                    <option value={1}>Low</option>
                  </select>
                </div>

                {/* Message */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5">Mensagem</label>
                  <textarea
                    rows={6}
                    className="w-full h-28 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Descreva o problema..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {/* Attachments + Add button (como no Blade) */}
                <div className="col-span-12 lg:col-span-6">
                  <label className="block text-sm text-gray-600 mb-1.5" htmlFor="inputAttachments">
                    Anexos
                  </label>

                  {/* Inputs dinâmicos */}
                  <div className="space-y-3">
                    {inputs.map((it, idx) => (
                      <div key={it.id} className="flex items-center gap-2">
                        <input
                          id={idx === 0 ? 'inputAttachments' : undefined}
                          type="file"
                          accept={accept}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md"
                          onChange={(e) =>
                            handleFileChange(it.id, e.currentTarget.files?.[0] ?? null)
                          }
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
                  </p>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={addFileInput}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Adicionar arquivo
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="col-span-12">
                  <button
                    type="submit"
                    id="recaptcha"
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
