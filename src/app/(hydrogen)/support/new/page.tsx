// src/app/(hydrogen)/support/new/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import SupportNewForm from './SupportNewForm'

export default async function SupportNewPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  // Cast pontual para acessar campos opcionais
  const u = session.user as any

  const initialData = {
    apiBaseUrl: env.NEXT_PUBLIC_API_BASE_URL ?? '',
    authToken: u?.accessToken ?? '',
    // se não existir name no payload, cai para string vazia
    presetName: (u?.name ?? '') as string,
    // este já existe no seu tipo, mas mantive via `u` para ficar simétrico
    presetEmail: (u?.email ?? '') as string,
  }

  return <SupportNewForm initialData={initialData} />
}
