'use client';

import BannerCard from '@core/components/banners/banner-card';
import { Text } from 'rizzui/typography';
import { PiInfoFill } from 'react-icons/pi';
import Link from 'next/link';

export default function ProfitWidget({ className }: { className?: string }) {
  return (
    <div className={className}>
      <BannerCard
        title="Resumo da Conta"
        className="min-h-[200px] overflow-hidden rounded-lg bg-gradient-to-r from-pink-400 via-red-400 to-yellow-400"
      >
        <div className="flex flex-col h-full p-5">
          <Text className="text-white text-4xl font-bold">
            R$ 382,78
          </Text>

          <Text className="text-white/80 mt-2.5 flex items-center">
            <PiInfoFill className="inline-flex h-4 w-4 mr-1 text-white/80" />
            Valor total sem taxas incluídas.
          </Text>

          {/* Campos adicionais lado a lado */}
          <div className="flex mt-4 space-x-8">
            {/* Saldo Bloqueado */}
            <div className="flex flex-col">
              <Text className="text-white/80 text-sm">
                Saldo bloqueado
              </Text>
              <Text className="text-white text-xl font-bold">
                R$ 0,00
              </Text>
            </div>
            {/* Bloqueios MED */}
            <div className="flex flex-col">
              <Text className="text-white/80 text-sm">
                Bloqueios MED
              </Text>
              <Text className="text-white text-xl font-bold">
                R$ 0,00
              </Text>
            </div>
          </div>

          <Text className="text-white/80 text-sm">
            Número da conta
          </Text>
          <Text className="text-white/80 mt-auto text-lg sm:text-xl font-medium">
            001CC2304251132
          </Text>
        </div>
        <Link
          href={'/file'}
          className="inline-block rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-900 dark:bg-gray-100"
        >
          Ver mais
        </Link>
      </BannerCard>
    </div>
  );
}
