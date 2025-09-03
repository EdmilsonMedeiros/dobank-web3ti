// src/app/(hydrogen)/user/verify/otp/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import VerifyOtp from './VerifyOtp'

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function VerifyOtpPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  const token = (session.user as any)?.accessToken as string

  const sp = (await searchParams) ?? {}
  const actionIdParamRaw = sp['action_id']
  const actionIdParam = Array.isArray(actionIdParamRaw) ? actionIdParamRaw[0] : actionIdParamRaw
  const query = actionIdParam ? `?action_id=${encodeURIComponent(actionIdParam)}` : ''

  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/verify/otp${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (res.status === 404) {
    return <p>Nenhuma ação de OTP encontrada.</p>
  }
  if (!res.ok) {
    throw new Error('Erro ao carregar verificação de OTP')
  }

  const data = await res.json()
  const serverNow = Date.now()
  const expMs = data?.action?.expired_at ? new Date(data.action.expired_at).getTime() : serverNow
  const initialSecondsLeft = Math.max(0, Math.floor((expMs - serverNow) / 1000))
  const initialClock = new Date(serverNow).toLocaleTimeString('pt-BR')

  return (
    <VerifyOtp
      apiBaseUrl={env.NEXT_PUBLIC_API_BASE_URL}
      authToken={token}
      initialAction={data?.action}
      initialUser={data?.user}
      pageTitle={data?.pageTitle ?? 'OTP Verification'}
      initialActionId={actionIdParam ?? String(data?.action?.id ?? '')}
      initialSecondsLeft={initialSecondsLeft}
      initialClock={initialClock}
    />
  )
}
