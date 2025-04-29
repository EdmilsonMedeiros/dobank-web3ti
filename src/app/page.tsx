import { Title } from "rizzui/typography";
import WelcomeBanner from '@core/components/banners/welcome'
import StatCards from '@shared/ecommerce/dashboard/stat-cards'
import ProfitWidget from '@shared/ecommerce/dashboard/profit-widget'
import SalesReport from '@shared/ecommerce/dashboard/sales-report'
import PromotionalSales from '@shared/ecommerce/dashboard/promotional-sales'
import RecentOrder from '@shared/ecommerce/dashboard/recent-order'
import HandWaveIcon from '@core/components/icons/hand-wave'
import welcomeImg from '@public/shop-illustration.png'
import { Button } from 'rizzui/button'
import { FaRegCopy } from "react-icons/fa";
import Link from 'next/link'
import { routes } from '@/config/routes'

export default function Home() {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2 @7xl:grid-cols-12">
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
          className="border border-muted bg-gray-0 pb-8 @4xl:col-span-2 @7xl:col-span-8"
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

        <StatCards className="@2xl:grid-cols-3 @4xl:col-span-2 @7xl:col-span-8" />
        <ProfitWidget className="h-[464px] @sm:h-[520px] @7xl:col-span-4 @7xl:col-start-9 @7xl:row-start-1 @7xl:row-end-3 @7xl:h-full" />

        <SalesReport className="@4xl:col-span-2 @7xl:col-span-8" />

        <PromotionalSales className="@4xl:col-start-2 @4xl:row-start-3 @7xl:col-span-4 @7xl:col-start-auto @7xl:row-start-auto" />

        <RecentOrder className="relative @4xl:col-span-2 @7xl:col-span-12" />
      </div>
    </div>
  )
}


