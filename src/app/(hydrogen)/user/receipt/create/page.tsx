// /home/vinny/isomorphic/isomorphic-dev/isomorphic/apps/isomorphic-starter/src/app/(hydrogen)/user/receipt/create/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import CreateReceiptForm from './CreateReceiptForm'
import React from 'react'

export const dynamic = 'force-dynamic'

export default async function ReceiptCreatePage() {
  const session = await getServerSession(authOptions)
  if (!session) return <p>Você precisa estar logado.</p>

  const token = (session.user as any)?.accessToken as string

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold">Realizar cobrança</h1>
      </div>
      <div className="p-6">
        <CreateReceiptForm apiBaseUrl={env.NEXT_PUBLIC_API_BASE_URL} token={token} />
      </div>
    </div>
  )
}
