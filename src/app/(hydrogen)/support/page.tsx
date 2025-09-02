// src/app/(hydrogen)/support/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import SupportTable, { SupportItem, PaginationMeta } from './SupportTable'

type ApiSupportsResponse = {
  supports: {
    current_page: number
    data: Array<{
      id: number
      user_id: number
      name: string
      email: string
      ticket: string | number
      subject: string
      status: 0 | 1 | 2 | 3
      priority: 1 | 2 | 3
      last_reply: string // "YYYY-MM-DD HH:mm:ss"
      created_at: string
      updated_at: string
    }>
    first_page_url: string | null
    from: number | null
    last_page: number
    last_page_url: string | null
    links: Array<{ url: string | null; label: string; active: boolean }>
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number | null
    total: number
  }
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams?: { page?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  const page = Number(searchParams?.page ?? '1')
  const token = (session.user as any)?.accessToken as string

  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/support?page=${page}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Erro ao carregar tickets de suporte')
  }

  const json: ApiSupportsResponse = await res.json()
  const p = json.supports

  const items: SupportItem[] = (p.data ?? []).map((it) => ({
    ticket: String(it.ticket ?? ''),
    subject: it.subject ?? '',
    status: (Number(it.status) as 0 | 1 | 2 | 3) ?? 0,
    priority: (Number(it.priority) as 1 | 2 | 3) ?? 1,
    // Mantemos a string vinda da API; o componente faz o time-ago robusto
    last_reply: it.last_reply || it.updated_at || it.created_at,
  }))

  const pagination: PaginationMeta = {
    currentPage: p.current_page ?? page,
    lastPage: p.last_page ?? 1,
    hasPrev: p.prev_page_url !== null,
    hasNext: p.next_page_url !== null,
    total: p.total ?? items.length,
  }

  return <SupportTable initialSupports={items} pagination={pagination} />
}
