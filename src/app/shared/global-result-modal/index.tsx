'use client'

import { useAtom } from 'jotai'
import { closeResultAtom, resultModalAtom } from './state'
import { useRouter } from 'next/navigation'
import { PiCheckCircleBold, PiInfoBold, PiWarningCircleBold, PiXBold } from 'react-icons/pi'

function Spinner() {
  return (
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
  )
}

export default function GlobalResultModal() {
  const [state] = useAtom(resultModalAtom)
  const [, close] = useAtom(closeResultAtom)
  const router = useRouter()

  if (!state.open) return null

  const icon =
    state.variant === 'success' ? (
      <PiCheckCircleBold className="h-6 w-6" />
    ) : state.variant === 'error' ? (
      <PiWarningCircleBold className="h-6 w-6" />
    ) : (
      <PiInfoBold className="h-6 w-6" />
    )

  const iconWrapClass =
    state.variant === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : state.variant === 'error'
      ? 'bg-red-100 text-red-700'
      : 'bg-blue-100 text-blue-700'

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center justify-center rounded-full p-1.5 ${iconWrapClass}`}>
              {icon}
            </div>
            <h3 className="text-base font-semibold">
              {state.loading ? (state.title ?? 'Processando...') : (state.title ?? 'Aviso')}
            </h3>
          </div>
          <button
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
            onClick={() => close((to)=>router.push(to))}
            aria-label="Fechar"
            title="Fechar"
          >
            <PiXBold className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {state.loading ? (
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <p className="text-sm text-gray-600">Aguardando resposta do servidor…</p>
            </div>
          ) : (
            <>
              {state.message && <p className="text-gray-800">{state.message}</p>}
              {state.details && (
                <pre className="mt-3 max-h-52 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-700">
                  {JSON.stringify(state.details, null, 2)}
                </pre>
              )}
            </>
          )}
        </div>

        {!state.loading && (
          <div className="flex justify-end gap-2 border-t p-4">
            <button
              onClick={() => close((to)=>router.push(to))}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
