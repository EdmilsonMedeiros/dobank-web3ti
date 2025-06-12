'use client';

import { useAtom } from 'jotai';
import { FaRegCopy } from 'react-icons/fa';
import { Text, Input, Button } from 'rizzui';
import ChargeHeader from './header';
import { confirmResponseAtom, Step } from './index';
import { useStepperCharge } from './index';
import { useModal } from '@/app/shared/modal-views/use-modal';

export default function ChargeStepThree() {
  const [confirm] = useAtom(confirmResponseAtom);
  const { closeModal } = useModal();
  const { setStep } = useStepperCharge();

  // Exibe loader enquanto a resposta não estiver definida
  if (!confirm) {
    return (
      <div className="flex items-center justify-center p-6">
        <Text>Carregando confirmação...</Text>
      </div>
    );
  }

  const handleClose = () => {
    closeModal();
    setStep(Step.StepOne);
  };

  return (
    <div className="flex flex-col">
      <ChargeHeader title="Cobrança Confirmada" description="Sua cobrança foi gerada com sucesso." />

      <div className="px-5 pb-6 pt-5 md:px-7 md:pb-9 md:pt-7 space-y-4">
        {/* <Text>Erro: {confirm.error ? 'Sim' : 'Não'}</Text> */}
        <Text>Transação: {confirm.trx}</Text>
        {/* <Text>Valor Original: R$ {confirm.original_value.toFixed(2)}</Text> */}

        <div className="flex justify-center">
          <img
            src={`data:image/png;base64,${confirm.image_base64}`}
            alt="QR Code"
            className="h-48 w-48"
          />
        </div>

        <Input
          label="Código Pix"
          readOnly
          value={confirm.copy_code}
          suffix={
            <Button onClick={() => navigator.clipboard.writeText(confirm.copy_code)}>
              <FaRegCopy />
            </Button>
          }
        />
      </div>

      <footer className="flex justify-end border-t px-5 py-5">
        <Button onClick={handleClose}>Fechar</Button>
      </footer>
    </div>
  );
}