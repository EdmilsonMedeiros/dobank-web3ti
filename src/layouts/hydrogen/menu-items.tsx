import { routes } from "@/config/routes";
import { DUMMY_ID } from "@/config/constants";

import { TbReportMoney } from "react-icons/tb";
 import { LuPanelLeft } from "react-icons/lu";
 import { GoHome } from "react-icons/go";
 import { BsCashCoin } from "react-icons/bs";
 import { AiOutlineDashboard } from "react-icons/ai";
 import { RiP2pFill } from "react-icons/ri";
 import { TbCashRegister } from "react-icons/tb";
 import { CiMoneyCheck1 } from "react-icons/ci";

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: "GERAL",
  },
  // label end
  {
    name: "Emitir cobrança",
    href: routes.support.inbox,
    icon: <TbReportMoney />,
    badge: "",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <GoHome />,
    badge: "",
  },
  {
    name: "Área PIX",
    href: "#",
    icon: <BsCashCoin />,
    dropdownItems: [
      {
        name: "Transferências",
        href: routes.support.inbox,
      },
      {
        name: "Meus limites",
        href: routes.support.snippets,
      },
    ],
  },
  {
    name: "Pagamentos",
    href: routes.jobBoard.dashboard,
    icon: <CiMoneyCheck1 />,
    badge: "",
  },
  {
    name: "Cobrança",
    href: routes.jobBoard.dashboard,
    icon: <TbCashRegister />,
    badge: "",
  },
  {
    name: "P2P",
    href: routes.jobBoard.dashboard,
    icon: <RiP2pFill />,
  },

  {
    name: "PDV",
    href: routes.jobBoard.dashboard,
    icon: <AiOutlineDashboard />,
  },
  // label start
  {
    name: "MAIS",
  },
  // label end
  {
    name: "Configurações",
    href: "#",
    icon: <LuPanelLeft />,
    dropdownItems: [
      {
        name: "Minha conta",
        href: routes.auth.signIn,
      },
      {
        name: "API's",
        href: routes.auth.signIn,
      },
      {
        name: "Indicações",
        href: routes.auth.signIn,
      },
      {
        name: "Suporte",
        href: routes.auth.signIn,
      },
      {
        name: "PDV",
        href: routes.auth.signIn,
      },
    ],
  },
];
