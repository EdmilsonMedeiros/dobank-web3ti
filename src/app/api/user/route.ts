import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth-options'
import { env } from '@/env.mjs';

export async function GET() {
  // 1) Busca sessão com NextAuth
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const apiBase = env.NEXT_PUBLIC_API_BASE_URL;

  // 2) Chama o backend passando o token
  const res = await fetch(`${apiBase}/user`, {
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: res.status })
  }
  const data = await res.json()

  // 3) Retorna o JSON puro
  return NextResponse.json(data)
}
