import TruckSolidIcon from '@core/components/icons/truck-solid';
import BrushSolidIcon from '@core/components/icons/brush-solid';
import CubeSolidIcon from '@core/components/icons/cube-solid';
import FileStackIcon from '@core/components/icons/file-stack';
import CloudTaskIcon from '@core/components/icons/cloud-task';
import ShoppingBagSolidIcon from '@core/components/icons/shopping-bag-solid';
import BulbSolidIcon from '@core/components/icons/bulb-solid';
import ParcelMapIcon from '@core/components/icons/parcel-map';
import { SlExclamation } from "react-icons/sl";

export const notificationsData = [
  {
    id: 6,
    name: 'Saldo adicionado pelo admin. Motivo: Necessidade de teste',
    icon: SlExclamation,
    unRead: false, // read_status = 1
    sendTime: '2024-01-04T02:09:47.000Z',
  },
  {
    id: 7,
    name: 'Saldo adicionado pelo admin. Motivo: Teste',
    icon: SlExclamation,
    unRead: true, // read_status = 0
    sendTime: '2024-10-07T14:53:23.000Z',
  },
  {
    id: 8,
    name: 'Saldo subtraído pelo admin. Motivo: Teste',
    icon: SlExclamation,
    unRead: false, // read_status = 1
    sendTime: '2025-02-04T02:26:14.000Z',
  },
  {
    id: 9,
    name: 'Saldo adicionado pelo admin. Motivo: Teste',
    icon: SlExclamation,
    unRead: true, // read_status = 0
    sendTime: '2025-03-06T01:54:46.000Z',
  },
];
