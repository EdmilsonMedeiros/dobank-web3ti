// src/app/(hydrogen)/support/[ticket]/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import SupportView from './SupportView'

type PageProps = {
  params: Promise<{ ticket: string }>
}

export default async function SupportTicketPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  const u = session.user as any
  const token = (u?.accessToken as string) ?? ''

  const { ticket } = await params

  // ✅ Endpoint correto da sua API:
  // GET /support/view/{ticket} -> { status, pageTitle, ticket, messages }
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/support/view/${ticket}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })

  if (res.status === 404) {
    return <p>Ticket não encontrado.</p>
  }
  if (!res.ok) {
    throw new Error('Erro ao carregar ticket')
  }

  const data = await res.json()
  // Se a API retornar 200 mas sem "ticket", trate como não encontrado
  if (!data?.ticket) {
    return <p>Ticket não encontrado.</p>
  }

  return (
    <SupportView
      apiBaseUrl={env.NEXT_PUBLIC_API_BASE_URL}
      authToken={token}
      ticketNumber={ticket}
      initialTicket={data.ticket}
      initialMessages={data.messages ?? []}
    />
  )
}
