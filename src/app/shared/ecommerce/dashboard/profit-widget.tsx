"use client";

import BannerCard from '@core/components/banners/banner-card';
import { Text } from 'rizzui/typography';
import { PiInfoFill } from 'react-icons/pi';
import Link from 'next/link';

interface ProfitWidgetProps {
  className?: string;
  balance: string;
  balanceBloqueado?: string;
  bloqueiosMed?: string;
  accountNumber: string;
}

export default function ProfitWidget({
  className,
  balance,
  balanceBloqueado,
  bloqueiosMed,
  accountNumber,
}: ProfitWidgetProps) {
  // formata string "42.67000000" para "R$ 42,67"
  const fmtBRL = (value: string) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(Number(value));

  // checa se existem valores positivos
  const hasBloqueado = balanceBloqueado !== undefined && Number(balanceBloqueado) > 0;
  const hasMed = bloqueiosMed !== undefined && !isNaN(Number(bloqueiosMed)) && Number(bloqueiosMed) > 0;

  return (
    <div className={className}>
      <BannerCard
        title="Resumo da Conta"
        className="min-h-[200px] overflow-hidden rounded-lg bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400"
      >
        <div className="flex flex-col h-full p-5">
          {/* Valor Total */}
          <Text className="text-white text-4xl font-bold">
            {fmtBRL(balance)}
          </Text>

          <Text className="text-white/80 mt-2.5 flex items-center">
            <PiInfoFill className="inline-flex h-4 w-4 mr-1 text-white/80" />
            Valor total sem taxas incluídas.
          </Text>

          {/* Campos adicionais lado a lado, só se existir */}
          {(hasBloqueado || hasMed) && (
            <div className="flex mt-4 space-x-8">
              {hasBloqueado && (
                <div className="flex flex-col">
                  <Text className="text-white/80 text-sm">
                    Saldo bloqueado
                  </Text>
                  <Text className="text-white text-xl font-bold">
                    {fmtBRL(balanceBloqueado!)}
                  </Text>
                </div>
              )}

              {hasMed && (
                <div className="flex flex-col">
                  <Text className="text-white/80 text-sm">
                    Bloqueios MED
                  </Text>
                  <Text className="text-white text-xl font-bold">
                    {fmtBRL(bloqueiosMed!)}
                  </Text>
                </div>
              )}
            </div>
          )}

          {/* Número da Conta */}
          <Text className="text-white/80 text-sm mt-4">
            Número da conta
          </Text>
          <Text className="text-white/80 mt-1 text-lg sm:text-xl font-medium">
            {accountNumber}
          </Text>
        </div>

        <Link
          href="/file"
          className="inline-block rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-900 dark:bg-gray-100"
        >
          Ver mais
        </Link>
      </BannerCard>
    </div>
  );
}
