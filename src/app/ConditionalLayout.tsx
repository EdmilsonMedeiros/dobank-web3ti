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
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password')

  if (isPublicRoute) {
    return <>{children}</>
  }
  return <HydrogenLayout>{children}</HydrogenLayout>
}
