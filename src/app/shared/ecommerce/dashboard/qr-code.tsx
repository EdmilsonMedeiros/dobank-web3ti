'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Badge, Title, Text } from 'rizzui';
import { Button } from 'rizzui/button';
import { FaRegCopy } from 'react-icons/fa';
import WidgetCard from '@core/components/cards/widget-card';
import cn from '@core/utils/class-names';
import { useCallback } from 'react';

interface PaymentQrCodeProps {
  className?: string;
  qrValue: string;      // base64 do PNG ou string a codificar
  manualCode?: string;  // código em texto
}

export default function PaymentQrCode({
  className,
  qrValue,
  manualCode,
}: PaymentQrCodeProps) {
  const code = manualCode ?? qrValue;

  const copyQr = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  // detecta se é um PNG base64 (começa com iVBOR)
  const isBase64 = qrValue.startsWith('iVBOR');

  return (
    <WidgetCard className={cn('@container', className)}>
      <div className="flex flex-col items-center text-center space-y-4 py-8">
        <Title as="h6">QR Code de pagamento</Title>
        <Text>Compartilhe este código para receber seus pagamentos.</Text>

        <div onClick={copyQr} className="cursor-pointer">
          {isBase64 ? (
            <img
              src={`data:image/png;base64,${qrValue}`}
              alt="QR Code estático"
              className="56 w-56"
            />
          ) : (
            <QRCodeSVG value={qrValue} className="h-40 w-40" />
          )}
        </div>

        <Text className="text-gray-500">ou copie o código manualmente</Text>

        <div className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            disabled
            readOnly
            value={code}
            className="w-32 sm:w-40 md:w-56 lg:w-64 border border-gray-300 rounded-md px-3 py-2 bg-white text-sm cursor-text flex-shrink-0"
          />
          <Button onClick={copyCode} className="px-3 py-2">
            <FaRegCopy />
          </Button>
        </div>
      </div>
    </WidgetCard>
  );
}
