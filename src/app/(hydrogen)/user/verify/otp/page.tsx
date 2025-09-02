// src/app/(hydrogen)/user/verify/otp/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import VerifyOtp from './VerifyOtp'

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function VerifyOtpPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  const token = (session.user as any)?.accessToken as string
  const actionIdParam = Array.isArray(searchParams?.action_id)
    ? searchParams?.action_id[0]
    : searchParams?.action_id
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

  return (
    <VerifyOtp
      apiBaseUrl={env.NEXT_PUBLIC_API_BASE_URL}
      authToken={token}
      initialAction={data?.action}
      initialUser={data?.user}
      pageTitle={data?.pageTitle ?? 'OTP Verification'}
      initialActionId={actionIdParam ?? String(data?.action?.id ?? '')}
    />
  )
}
