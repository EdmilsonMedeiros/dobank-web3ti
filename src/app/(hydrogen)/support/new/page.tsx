// src/app/(hydrogen)/support/new/page.tsx
import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import SupportNewForm from './SupportNewForm'

export default async function SupportNewPage() {
  const session = await getServerSession(authOptions)

  const presetName =
    (session?.user?.name as string | undefined) ??
    '' // você pode montar "Firstname Lastname" se tiver estes campos na session
  const presetEmail = (session?.user?.email as string | undefined) ?? ''

  const initialData = {
    apiBaseUrl: env.NEXT_PUBLIC_API_BASE_URL ?? '',
    authToken: (session?.user?.accessToken as string | undefined) ?? '',
    presetName,
    presetEmail,
  }

  return <SupportNewForm initialData={initialData} />
}
