'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'

type StatusCode = 0 | 1 | 2 | 3
type PriorityCode = 1 | 2 | 3

export interface SupportItem {
  ticket: string
  subject: string
  status: StatusCode
  priority: PriorityCode
  last_reply: string // ISO date
}

interface Props {
  initialSupports: SupportItem[]
}

function StatusBadge({ status }: { status: StatusCode }) {
  const map: Record<
    StatusCode,
    { label: string; className: string }
  > = {
    0: { label: 'Open', className: 'bg-emerald-100 text-emerald-800' },
    1: { label: 'Answered', className: 'bg-blue-100 text-blue-800' },
    2: { label: 'Customer Reply', className: 'bg-amber-100 text-amber-800' },
    3: { label: 'Closed', className: 'bg-rose-100 text-rose-800' },
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
    1: { label: 'Low', className: 'bg-gray-200 text-gray-800' },
    2: { label: 'Medium', className: 'bg-emerald-100 text-emerald-800' },
    3: { label: 'High', className: 'bg-blue-100 text-blue-800' },
  }
  const { label, className } = map[priority]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

function timeAgoPt(iso: string) {
  const now = Date.now()
  const t = new Date(iso).getTime()
  const diff = Math.max(0, now - t)

  const minutes = Math.floor(diff / (60 * 1000))
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))

  if (minutes < 1) return 'agora mesmo'
  if (minutes < 60) return `há ${minutes} min`
  if (hours < 24) return `há ${hours} h`
  return `há ${days} d`
}

export default function SupportTable({ initialSupports }: Props) {
  const [supports] = useState<SupportItem[]>(initialSupports)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { pageItems, totalPages } = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      pageItems: supports.slice(start, end),
      totalPages: Math.max(1, Math.ceil(supports.length / pageSize)),
    }
  }, [supports, page])

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-sm">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-xl font-semibold">Histórico de Tickets de Suporte</h1>
          <Link
            href="/support/new"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Abrir Novo Ticket
          </Link>
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
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 sm:px-6 py-4 text-sm text-gray-700"
                      colSpan={5}
                    >
                      Data Not Found
                    </td>
                  </tr>
                ) : (
                  pageItems.map((s) => (
                    <tr key={s.ticket} className="text-sm">
                      <td className="px-4 sm:px-6 py-4">
                        <Link
                          href={`/support/${s.ticket}`}
                          className="text-blue-600 hover:underline"
                        >
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
                          // href={`/support/${s.ticket}`}
                          href={`/support/new`}
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

          {/* Paginação (simples, estática) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50 disabled:opacity-50"
                  disabled={page === 1}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 text-sm rounded-md border hover:bg-gray-50 disabled:opacity-50"
                  disabled={page === totalPages}
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
