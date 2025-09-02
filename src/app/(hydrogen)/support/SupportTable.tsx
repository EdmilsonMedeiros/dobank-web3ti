'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'

export type StatusCode = 0 | 1 | 2 | 3
export type PriorityCode = 1 | 2 | 3

export interface SupportItem {
  ticket: string
  subject: string
  status: StatusCode
  priority: PriorityCode
  last_reply: string // ISO-like or "YYYY-MM-DD HH:mm:ss"
}

export interface PaginationMeta {
  currentPage: number
  lastPage: number
  hasPrev: boolean
  hasNext: boolean
  total: number
}

interface Props {
  initialSupports: SupportItem[]
  pagination: PaginationMeta
}

function StatusBadge({ status }: { status: StatusCode }) {
  const map: Record<
    StatusCode,
    { label: string; className: string }
  > = {
    0: { label: 'Open',            className: 'bg-emerald-100 text-emerald-800' },
    1: { label: 'Answered',        className: 'bg-blue-100 text-blue-800' },
    2: { label: 'Customer Reply',  className: 'bg-amber-100 text-amber-800' },
    3: { label: 'Closed',          className: 'bg-rose-100 text-rose-800' },
  }
  const { label, className } = map[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: PriorityCode }) {
  const map: Record<
    PriorityCode,
    { label: string; className: string }
  > = {
    1: { label: 'Low',    className: 'bg-gray-200 text-gray-800' },
    2: { label: 'Medium', className: 'bg-emerald-100 text-emerald-800' },
    3: { label: 'High',   className: 'bg-blue-100 text-blue-800' },
  }
  const { label, className } = map[priority]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function parseApiDate(input: string): Date {
  // Tenta ISO direto
  const d1 = new Date(input)
  if (!isNaN(d1.getTime())) return d1
  // Tenta "YYYY-MM-DD HH:mm:ss"
  const d2 = new Date(input.replace(' ', 'T'))
  if (!isNaN(d2.getTime())) return d2
  // Fallback: agora
  return new Date()
}

function timeAgoPt(input: string) {
  const t = parseApiDate(input).getTime()
  const now = Date.now()
  const diff = Math.max(0, now - t)

  const minutes = Math.floor(diff / (60 * 1000))
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))

  if (minutes < 1) return 'agora mesmo'
  if (minutes < 60) return `há ${minutes} min`
  if (hours < 24) return `há ${hours} h`
  return `há ${days} d`
}

export default function SupportTable({ initialSupports, pagination }: Props) {
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const qn = q.trim().toLowerCase()
    if (!qn) return initialSupports
    return initialSupports.filter((s) => {
      const subj = (s.subject || '').toLowerCase()
      const tick = (s.ticket || '').toLowerCase()
      return subj.includes(qn) || tick.includes(qn)
    })
  }, [initialSupports, q])

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-6 border-b">
          <h1 className="text-xl font-semibold">Histórico de Tickets de Suporte</h1>

          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pesquisar chamado"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <Link
              href="/support/new"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 whitespace-nowrap"
            >
              + Abrir Novo Ticket
            </Link>
          </div>
        </div>

        {/* Tabela */}
        <div className="p-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 sm:px-6 py-3">Assunto</th>
                  <th className="px-4 sm:px-6 py-3">Status</th>
                  <th className="px-4 sm:px-6 py-3">Prioridade</th>
                  <th className="px-4 sm:px-6 py-3">Última Resposta</th>
                  <th className="px-4 sm:px-6 py-3">Ação</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {list.length === 0 ? (
                  <tr>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-700" colSpan={5}>
                      Data Not Found
                    </td>
                  </tr>
                ) : (
                  list.map((s) => (
                    <tr key={s.ticket} className="text-sm">
                      <td className="px-4 sm:px-6 py-4">
                        <Link href={`/support/${s.ticket}`} className="text-blue-600 hover:underline">
                          [Ticket #{s.ticket}] {s.subject}
                        </Link>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <PriorityBadge priority={s.priority} />
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-600">
                        {timeAgoPt(s.last_reply)}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <Link
                          href={`/support/${s.ticket}`}
                          className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs hover:bg-blue-700"
                          aria-label="Ver Ticket"
                          title="Ver Ticket"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="w-4 h-4"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação do backend */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Página {pagination.currentPage} de {pagination.lastPage}
            </p>
            <div className="flex gap-2">
              <Link
                aria-disabled={!pagination.hasPrev}
                href={pagination.hasPrev ? `/support?page=${Math.max(1, pagination.currentPage - 1)}` : '#'}
                className={[
                  'px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50',
                  !pagination.hasPrev ? 'pointer-events-none opacity-50' : '',
                ].join(' ')}
              >
                Anterior
              </Link>
              <Link
                aria-disabled={!pagination.hasNext}
                href={
                  pagination.hasNext
                    ? `/support?page=${Math.min(pagination.lastPage, pagination.currentPage + 1)}`
                    : '#'
                }
                className={[
                  'px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50',
                  !pagination.hasNext ? 'pointer-events-none opacity-50' : '',
                ].join(' ')}
              >
                Próxima
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
