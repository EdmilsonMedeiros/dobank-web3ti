'use client'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import HydrogenLayout from '@/layouts/hydrogen/layout'

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  // ajuste aqui para todas as rotas “públicas”
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/landing') ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/register/contapj1') ||
    pathname.startsWith('/register/endereco') ||
    pathname.startsWith('/register/senha') ||
    pathname.startsWith('/forgot-password')

  if (isPublicRoute) {
    return <>{children}</>
  }
  return <HydrogenLayout>{children}</HydrogenLayout>
}
