// /src/app/shared/charge/charge-form/step-two.tsx
'use client';

import { useAtom } from 'jotai';
import { Textarea, Input, Button, Text, Title } from 'rizzui';
import { FaRegCopy } from 'react-icons/fa';
import ChargeHeader from './header';
import { formDataAtom, useStepperCharge } from '@/app/shared/charge/charge-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import cn from '@core/utils/class-names';
import { useCallback } from 'react';
import ChargeFooter from './footer';

export default function ChargeStepTwo() {
  const { setStep } = useStepperCharge();
  const { closeModal } = useModal();
  const [formData] = useAtom(formDataAtom);
  // const code = formData.pix_payload || '';

  // const copyCode = useCallback(() => {
  //   navigator.clipboard.writeText(code);
  // }, [code]);

  const handleClose = () => {
    closeModal();
    setStep(0);
  };

  return (
    <div className="flex flex-col">
      {/* Cabeçalho com “Emitir cobrança” e botão X */}
      <ChargeHeader
        title="Emitir cobrança"
        description="Copie o código manualmente abaixo para compartilhar e receber o pagamento."
      />

      {/* Conteúdo: apenas o campo de texto com o código e o botão de copiar */}
      <div className="px-5 pb-6 pt-5 md:px-7 md:pb-9 md:pt-7 flex flex-col items-center">

        <div className={cn('flex w-full max-w-md items-center space-x-2')}>
          <input
            type="text"
            readOnly
            // value={code}
            className="flex-grow cursor-text rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800"
          />
          <Button className="px-3 py-2">
            <FaRegCopy />
          </Button>
        </div>
      </div>

      {/* Footer próprio: botão “Fechar” */}
      <ChargeFooter />
    </div>
  );
}
