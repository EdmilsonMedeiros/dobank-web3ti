import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import WelcomeBanner from "@core/components/banners/welcome";
import HandWaveIcon from "@core/components/icons/hand-wave";
import welcomeImg from "@public/shop-illustration.png";
import StatCards from "@shared/ecommerce/dashboard/stat-cards";
import ProfitWidget from "@shared/ecommerce/dashboard/profit-widget";
import RecentOrder from "@shared/ecommerce/dashboard/recent-order";
import UpgradeStorage from "@shared/ecommerce/dashboard/upgrade-storage";
import QrCode from '@shared/ecommerce/dashboard/qr-code'

import { Button } from "rizzui/button";
import { FaRegCopy } from "react-icons/fa";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) return <p>Você precisa estar logado.</p>;

  const token = session.user.accessToken;
  const res = await fetch("https://crypto.web3ti.com.br/api/user", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erro ao buscar user");

  const { user } = (await res.json()) as {
    user: {
      firstname: string;
      lastname: string;
      username: string;
      balance: string;
      balance_bloqueado: string;
      account_number: string;
      qrcode_static: string;
      copiaecola: string;
      transactions: Array<{
        id: number;
        amount: string;
        charge: string;
        post_balance: string;
        trx_type: "+" | "-";
        trx: string;
        details: string;
        created_at: string;
      }>;
    };
  };

  const fullName = `${user.firstname} ${user.lastname}`;
  const referralUrl = `https://dobank.com.br?reference=${user.username}`;

  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-[70%_29%]">
        {/* Coluna Esquerda */}
        <div className="flex flex-col space-y-6">
          <WelcomeBanner
            title={
              <>
                Bem vindo, <br /> {fullName}{" "}
                <HandWaveIcon className="inline-flex h-8 w-8" />
              </>
            }
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
                value={referralUrl}
                className="w-48 sm:w-64 md:w-80 lg:w-96 border border-gray-300 rounded-md px-3 py-2 bg-white text-sm cursor-text flex-shrink-0"
              />
              <Button className="px-3 py-2">
                <FaRegCopy />
              </Button>
            </div>
          </WelcomeBanner>

          <StatCards className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" />

          <RecentOrder className="w-full" transactions={user.transactions} />
        </div>

        {/* Coluna Direita */}
        <div className="flex flex-col space-y-6">
          <ProfitWidget
            className="w-full h-auto"
            balance={user.balance}
            balanceBloqueado={user.balance_bloqueado}
            bloqueiosMed="N/A"
            accountNumber={user.account_number}
          />

          <QrCode
            qrValue={user.qrcode_static}
            manualCode={user.copiaecola}
            className="w-full"
          />

          {/* <UpgradeStorage className="w-full" /> */}
        </div>
      </div>
    </div>
  );
}
