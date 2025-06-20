'use client';

import { useState } from 'react';
import { Input } from 'rizzui';
import { Button } from 'rizzui/button';
import WidgetCard from '@core/components/cards/widget-card';

export default function PaymentForm() {
  const [barcode, setBarcode] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Enviar código de barra:', barcode);
  }

  return (
    <WidgetCard
      title="Realizar pagamento"
      className="w-full"
      headerClassName="px-5 pt-5 lg:px-7 lg:pt-7 mb-6"
    >
      <form
        onSubmit={handleSubmit}
        className="px-5 pb-5 lg:px-7 lg:pb-7 flex flex-col space-y-4"
      >
        <Input
          label="Digite o código de barra"
          placeholder="Digite o código de barra"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          className="w-full"
        />

        <Button type="submit" className="self-end px-4 py-2">
          Enviar
        </Button>
      </form>
    </WidgetCard>
  );
}
