// /src/app/shared/charge/charge-form/step-two.tsx
'use client';

import { useAtom } from 'jotai';
import { useSession } from 'next-auth/react';
import { Text, Title, Button } from 'rizzui';
import ChargeHeader from './header';
import { depositResponseAtom, confirmResponseAtom } from './index';
import { useStepperCharge } from './index';

export default function ChargeStepTwo() {
  const { data: session } = useSession();
  const [deposit] = useAtom(depositResponseAtom);
  const [, setConfirm] = useAtom(confirmResponseAtom);
  const { gotoNextStep, gotoPrevStep } = useStepperCharge();

  if (!deposit) {
    return (
      <div className="flex items-center justify-center p-6">
        <Text>Carregando dados da cobrança...</Text>
      </div>
    );
  }

  const handleConfirm = async () => {
    let json;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/deposits/${deposit.trx}/confirm`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          body: JSON.stringify({}),  // corpo vazio, mas agora o Laravel vai interpretar como JSON
        }
      );
      
      // if (!res.ok) {
      //   console.error('Confirm API retornou status:', res.status);
      // }
      json = await res.json();
    } catch (err) {
      console.error('Erro na requisição:', err);
      json = {
        error: true,
        message: 'Erro de rede ao confirmar.',
        trx: deposit.trx,
        original_value: deposit.payable,
        image_base64: '',
        copy_code: '',
      };
    }

    setConfirm({
      error: Boolean(json.error),
      message: json.message,
      trx: json.trx || deposit.trx,
      original_value: json.original_value ?? deposit.payable,
      image_base64: json.image_base64 ?? '',
      copy_code: json.copy_code ?? '',
    });

    if (!json.error) {
      gotoNextStep();
    }
  };

  return (
    <div className="flex flex-col">
      <ChargeHeader
        title="Emitir cobrança"
        description="Confira os detalhes e confirme."
      />

      <div className="px-5 pb-6 pt-5 md:px-7 md:pb-9 md:pt-7 space-y-3">
        <Title as="h4">Transação: {deposit.trx}</Title>
        <Text>Valor: R$ {deposit.amount.toFixed(2)}</Text>
        <Text>Taxa: R$ {deposit.charge.toFixed(2)}</Text>
        <Text>Total a pagar: R$ {deposit.payable.toFixed(2)}</Text>
      </div>

      <footer className="flex items-center justify-between border-t px-5 py-5">
        <Button variant="outline" onClick={gotoPrevStep} rounded="lg">
          Voltar
        </Button>
        <Button onClick={handleConfirm} rounded="lg">
          Confirmar
        </Button>
      </footer>
    </div>
  );
}
