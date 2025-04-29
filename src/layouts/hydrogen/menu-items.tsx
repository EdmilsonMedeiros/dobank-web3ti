import { routes } from "@/config/routes";
import { DUMMY_ID } from "@/config/constants";
import {
  PiShoppingCartDuotone,
  PiHeadsetDuotone,
  PiPackageDuotone,
  PiChartBarDuotone,
  PiCurrencyDollarDuotone,
  PiSquaresFourDuotone,
  PiGridFourDuotone,
  PiFeatherDuotone,
  PiChartLineUpDuotone,
  PiMapPinLineDuotone,
  PiUserGearDuotone,
  PiBellSimpleRingingDuotone,
  PiUserDuotone,
  PiEnvelopeSimpleOpenDuotone,
  PiStepsDuotone,
  PiCreditCardDuotone,
  PiTableDuotone,
  PiBrowserDuotone,
  PiHourglassSimpleDuotone,
  PiUserCircleDuotone,
  PiShootingStarDuotone,
  PiRocketLaunchDuotone,
  PiFolderLockDuotone,
  PiBinocularsDuotone,
  PiHammerDuotone,
  PiNoteBlankDuotone,
  PiUserPlusDuotone,
  PiShieldCheckDuotone,
  PiLockKeyDuotone,
  PiChatCenteredDotsDuotone,
  PiCalendarPlusDuotone,
  PiEnvelopeDuotone,
  PiCurrencyCircleDollarDuotone,
  PiBriefcaseDuotone,
  PiHouseLineDuotone,
  PiAirplaneTiltDuotone,
  PiFolder,
  PiCaretCircleUpDownDuotone,
  PiListNumbersDuotone,
  PiCoinDuotone,
  PiCalendarDuotone,
  PiShapesDuotone,
  PiNewspaperClippingDuotone,
  PiStairsDuotone,
  PiMoneyWavy,
} from "react-icons/pi";

import { 
  BsArrow90DegUp,
  BsArrow90DegDown,
} from "react-icons/bs";

import { 
  HiArrowsRightLeft,
} from "react-icons/hi2";

import { 
  MdOutlineAttachMoney,
 } from "react-icons/md";

 import { LuPanelLeft } from "react-icons/lu";

// Note: do not add href in the label object, it is rendering as label
export const menuItems = [
  // label start
  {
    name: "Overview",
  },
  // label end
  {
    name: "Início",
    href: "/",
    icon: <PiHouseLineDuotone />,
    badge: "",
  },
  {
    name: "Área PIX",
    href: "#",
    icon: <MdOutlineAttachMoney />,
    dropdownItems: [
      {
        name: "Depositar",
        href: routes.support.inbox,
      },
      {
        name: "Transferir",
        href: routes.support.snippets,
      },
      {
        name: "Historico de Transferência",
        href: routes.support.templates,
      },
    ],
  },
  {
    name: "Pagar",
    href: routes.appointment.dashboard,
    icon: <BsArrow90DegUp />,
  },
  {
    name: "Cobrar",
    href: routes.executive.dashboard,
    icon: <BsArrow90DegDown />,
  },
  {
    name: "P2P",
    href: routes.jobBoard.dashboard,
    icon: <HiArrowsRightLeft />,
  },
  // label start
  {
    name: "CONFIGURAÇÃO",
  },
  // label end
  {
    name: "Configurações",
    href: "#",
    icon: <LuPanelLeft />,
    dropdownItems: [
      {
        name: "Perfil",
        href: routes.auth.signUp1,
      },
      {
        name: "Mudar senha",
        href: routes.auth.signUp2,
      },
      {
        name: "Segurança 2FA",
        href: routes.auth.signUp3,
      },
      {
        name: "Sms pos",
        href: routes.auth.signUp4,
      },
      {
        name: "Api's",
        href: routes.auth.signUp5,
      },
      {
        name: "Indicações",
        href: routes.auth.signUp5,
      },
      {
        name: "Extrato P2P",
        href: routes.auth.signUp5,
      },
      {
        name: "Tickets de Suporte",
        href: routes.auth.signUp5,
      },
    ],
  },
];
