// /home/vinny/isomorphic/isomorphic-dev/isomorphic/apps/isomorphic-starter/src/app/(hydrogen)/user/receipt/history/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import React from 'react'
import ReceiptHistoryTable from './ReceiptHistoryTable'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type ReceiptItem = {
  id: number
  trx: string
  invoice: string | null
  payer_name: string
  tax_id: string
  valor: string
  status: string
  created_at: string
  updated_at: string
}

export default async function ReceiptHistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return <p>Você precisa estar logado.</p>
  }

  const token = (session.user as any)?.accessToken as string

  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/receipt/history`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error('Erro ao carregar histórico de cobranças')
  }

  const { pageTitle, receiptHistory } = (await res.json()) as {
    pageTitle: string
    receiptHistory: ReceiptItem[]
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold">{pageTitle || 'Boletos de Cobrança'}</h1>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Link
              href="/user/receipt/create"
              className="btn bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Criar Cobrança
            </Link>
            {/* Quando houver condição de Sankhya, habilite este: 
            {isSankhyaActive && (
              <a
                href="/user/receipt/sankhya"
                className="btn text-sm px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: 'darkgreen' }}
              >
                Criar Cobrança - Sankhya
              </a>
            )} */}
          </div>
        </div>

        <div className="mt-6">
          <ReceiptHistoryTable rows={receiptHistory} />
        </div>
      </div>
    </div>
  )
}
