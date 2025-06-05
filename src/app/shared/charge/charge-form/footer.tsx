'use client';

import { Button } from 'rizzui';
import cn from '@core/utils/class-names';
import { useStepperCharge } from '@/app/shared/charge/charge-form';

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  const { step, gotoPrevStep } = useStepperCharge();

  return (
    <footer
      className={cn(
        'flex w-full items-center justify-between border-t border-gray-300 px-5 py-5 md:px-7',
        className
      )}
    >
      <div className="flex shrink-0 gap-1.5">
        {Array.from([0, 1], (x) => (
          <Button
            key={`step-${x}`}
            variant="text"
            className={cn(
              'h-2 p-0',
              x === step ? 'w-4 bg-gray-400' : 'w-3 bg-gray-200'
            )}
          />
        ))}
      </div>

      <div className="flex gap-3">
        {step > 0 && step < 3 && (
          <Button
            onClick={gotoPrevStep}
            variant="outline"
            className="!w-auto"
            rounded="lg"
          >
            Voltar
          </Button>
        )}
        {step === 0 && (
          <Button type="submit" rounded="lg">
            Gerar Cobrança
          </Button>
        )}
      </div>
    </footer>
  );
}
