'use client';

import { OrdersDataType } from '@/app/shared/ecommerce/dashboard/recent-order';
import { routes } from '@/config/routes';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import TableAvatar from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';
import { ActionIcon, Text } from 'rizzui';

const columnHelper = createColumnHelper<OrdersDataType>();

export const ordersColumns = (expanded: boolean = true) => {
  const columns = [
    columnHelper.display({
      id: 'id',
      size: 80,
      header: 'ID',
      cell: ({ row }) => <>#{row.original.id}</>,
    }),
    columnHelper.accessor('trx', {
      id: 'trx',
      size: 180,
      header: 'Trx',
      cell: ({ row }) => <Text className="inline-block font-mono text-xs text-gray-700 
                     bg-gray-50 border border-gray-200 
                     rounded-md px-2 py-0.5">{row.original.trx}</Text>,
    }),
    columnHelper.accessor('data', {
      id: 'data',
      size: 120,
      header: 'Data',
      cell: ({ row }) => <Text>{row.original.data}</Text>,
    }),
    columnHelper.accessor('resumo', {
      id: 'resumo',
      size: 300,
      header: 'Resumo',
      cell: ({ row }) => <Text>{row.original.resumo}</Text>,
    }),
    columnHelper.accessor('tipo', {
      id: 'tipo',
      size: 120,
      header: 'Tipo',
      enableSorting: false,
      cell: ({ row }) => getStatusBadge(row.original.tipo),
    }),
    columnHelper.accessor('total', {
      id: 'total',
      size: 120,
      header: 'Total',
      cell: ({ row }) => (
        <Text className="font-medium">{row.original.total}</Text>
      ),
    }),
    columnHelper.accessor('saldoFinal', {
      id: 'saldoFinal',
      size: 140,
      header: 'Saldo Final',
      cell: ({ row }) => (
        <Text className="font-medium">{row.original.saldoFinal}</Text>
      ),
    }),
  ];

  // se você quiser row expand para detalhes extra, basta copiar a lógica de expandedOrdersColumns
  return columns;
};