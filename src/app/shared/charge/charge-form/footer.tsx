'use client';

import { Button } from 'rizzui';
import cn from '@core/utils/class-names';
import { useStepperCharge } from './index';
// ⚠️ ADIÇÃO: ler status da sessão
import { useSession } from 'next-auth/react';

export default function Footer({ className }: { className?: string }) {
  const { step, gotoPrevStep } = useStepperCharge();

  // ⚠️ ADIÇÃO: verificar se a sessão está pronta
  const { data: session, status } = useSession();
  const isReady = status === 'authenticated' && !!session?.user?.accessToken;

  return (
    <footer className={cn('flex w-full items-center justify-between border-t border-gray-300 px-5 py-5 md:px-7', className)}>
      <div className="flex shrink-0 gap-1.5">
        {[0, 1, 2].map((x) => (
          <Button
            key={x}
            variant="text"
            className={cn('h-2 p-0', x === step ? 'w-4 bg-gray-400' : 'w-3 bg-gray-200')}
          />
        ))}
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <Button onClick={gotoPrevStep} variant="outline" rounded="lg">
            Voltar
          </Button>
        )}
        {step === 0 && (
          <Button
            type="submit"
            rounded="lg"
            // ⚠️ ADIÇÃO: desabilitar enquanto a sessão não estiver pronta
            disabled={!isReady}
            title={!isReady ? 'Aguardando sessão...' : undefined}
          >
            Gerar Cobrança
          </Button>
        )}
      </div>
    </footer>
  );
}
