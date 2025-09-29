// /home/vinny/isomorphic/isomorphic-dev/isomorphic/apps/isomorphic-starter/src/app/(hydrogen)/user/transfer/log/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs'
import TransferLogForm from './TransferLogForm'

type Paginator<T> = {
  current_page: number
  data: T[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: { url: string | null; label: string; active: boolean }[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

export default async function TransferLogPage({
  searchParams,
}: {
  searchParams?: { page?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) return <p>Você precisa estar logado.</p>

  const token = (session.user as any)?.accessToken as string

  const apiUrl = new URL(`${env.NEXT_PUBLIC_API_BASE_URL}/transfer/log`)
  apiUrl.searchParams.set('per_page', '10')
  if (searchParams?.page) apiUrl.searchParams.set('page', searchParams.page)

  const res = await fetch(apiUrl.toString(), {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!res.ok) {
    return <p>Falha ao carregar dados de transferências ({res.status}).</p>
  }

  const data = await res.json()

  const pageTitle = data?.pageTitle ?? 'Transfer History'
  const emptyMessage = data?.emptyMessage ?? 'No transfer yet'

  // Paginator padrão para evitar undefined
  const emptyPaginator: Paginator<any> = {
    current_page: 1,
    data: [],
    first_page_url: '',
    from: 0,
    last_page: 1,
    last_page_url: '',
    links: [],
    next_page_url: null,
    path: '',
    per_page: 10,
    prev_page_url: null,
    to: 0,
    total: 0,
  }

  const transfers: Paginator<any> = data?.transfers ?? emptyPaginator

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{pageTitle}</h1>

      <TransferLogForm
        emptyMessage={emptyMessage}
        transfers={transfers}
      />
    </div>
  )
}
