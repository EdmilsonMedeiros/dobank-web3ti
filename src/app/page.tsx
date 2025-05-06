// src/app/page.tsx
import { Title } from "rizzui/typography";
import WelcomeBanner from '@core/components/banners/welcome'
import StatCards from '@shared/ecommerce/dashboard/stat-cards'
import ProfitWidget from '@shared/ecommerce/dashboard/profit-widget'
import SalesReport from '@shared/ecommerce/dashboard/sales-report'
import QrCode from '@shared/ecommerce/dashboard/qr-code'
import RecentOrder from '@shared/ecommerce/dashboard/recent-order'
import UpgradeStorage from '@shared/ecommerce/dashboard/upgrade-storage'
import HandWaveIcon from '@core/components/icons/hand-wave'
import welcomeImg from '@public/shop-illustration.png'

import { Button } from 'rizzui/button'
import { FaRegCopy } from "react-icons/fa"

export default function Home() {
  return (
    <div className="@container">
      {/*
        1) mobile: 1 coluna
        2) a partir de @4xl: 2 colunas (70% / 30%)
      */}
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-[70%_29%]">

        {/* ← Coluna Esquerda (70%) */}
        <div className="flex flex-col space-y-6">
          <WelcomeBanner
            title={(
              <>
                Bem vindo, <br /> Vinícius Aquino de Melo{' '}
                <HandWaveIcon className="inline-flex h-8 w-8" />
              </>
            )}
            description="Aqui está seu centro de operações: tudo o que você precisa para gerenciar seus pagamentos."
            media={
              <div className="absolute -bottom-6 end-4 hidden w-[300px] @2xl:block">
                <img src={welcomeImg.src} alt="Shop illustration" />
              </div>
            }
            contentClassName="@2xl:max-w-[calc(100%-340px)]"
            className="border border-muted bg-gray-0 pb-8 w-full"
          >
            <div className="mt-4 flex items-center space-x-2">
              <input
                type="text"
                disabled
                readOnly
                value="https://dobank.com.br?reference=viniciusaquino.tech"
                className="w-48 sm:w-64 md:w-80 lg:w-96 border border-gray-300 rounded-md px-3 py-2 bg-white text-sm cursor-text flex-shrink-0"
              />
              <Button className="px-3 py-2">
                <FaRegCopy />
              </Button>
            </div>
          </WelcomeBanner>

          {/*
            StatCards:
            - 1 col (mobile)
            - 2 cols (sm)
            - 3 cols (@2xl)
          */}
          <StatCards className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" />

          <SalesReport className="w-full" />

          <RecentOrder className="w-full" />
        </div>

        {/* Coluna Direita (30%) → */}
        <div className="flex flex-col space-y-6">
          <ProfitWidget className="w-full h-auto" />

          <QrCode
            qrValue="https://dobank.com.br?reference=viniciusaquino.tech"
            className="w-full"
          />

          <UpgradeStorage className="w-full" />
        </div>
      </div>
    </div>
  )
}
