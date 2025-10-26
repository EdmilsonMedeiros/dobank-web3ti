'use client'
import { atom } from 'jotai'

export type ResultVariant = 'success' | 'error' | 'info'

export type ResultModalState = {
  open: boolean
  loading: boolean
  title?: string
  message?: string
  details?: any
  variant?: ResultVariant
  /** se setado, o botão "Fechar" redireciona pra cá */
  redirectTo?: string | null
}

export const resultModalAtom = atom<ResultModalState>({
  open: false,
  loading: false,
  title: undefined,
  message: undefined,
  details: undefined,
  variant: 'info',
  redirectTo: null,
})

/** Abre o modal em modo "processando..." */
export const showResultLoadingAtom = atom(null, (get, set, title?: string) => {
  const curr = get(resultModalAtom)
  set(resultModalAtom, {
    ...curr,
    open: true,
    loading: true,
    title: title ?? 'Processando...',
    message: undefined,
    details: undefined,
    variant: 'info',
    redirectTo: null,
  })
})

/** Mostra o resultado (sucesso/erro/info) */
export const showResultAtom = atom(
  null,
  (get, set, payload: Partial<ResultModalState> & { variant?: ResultVariant }) => {
    const curr = get(resultModalAtom)
    set(resultModalAtom, {
      ...curr,
      open: true,
      loading: false,
      title: payload.title ?? curr.title,
      message: payload.message ?? curr.message,
      details: payload.details,
      variant: payload.variant ?? 'info',
      redirectTo: payload.redirectTo ?? null,
    })
  }
)

/** Fecha (e opcionalmente navega) */
export const closeResultAtom = atom(null, (get, set, navigate?: (to: string)=>void) => {
  const { redirectTo } = get(resultModalAtom)
  set(resultModalAtom, (s) => ({ ...s, open: false, loading: false }))
  if (redirectTo && navigate) navigate(redirectTo)
})
