'use client';

import { OrdersDataType } from '@/app/shared/ecommerce/dashboard/recent-order';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import { createColumnHelper } from '@tanstack/react-table';
import { Text } from 'rizzui';

const columnHelper = createColumnHelper<OrdersDataType>();

export const ordersColumns = (expanded: boolean = true) => {
  return [
    columnHelper.display({
      id: 'id',
      size: 80,
      header: 'ID',
      cell: ({ row }) => <>#{row.original.id}</>,
    }),

    columnHelper.accessor('reference', {
      id: 'reference',
      size: 180,
      header: 'Trx',
      cell: ({ getValue }) => (
        <Text
          className="inline-block font-mono text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5"
        >
          {getValue()}
        </Text>
      ),
    }),

    columnHelper.accessor('date', {
      id: 'date',
      size: 120,
      header: 'Data',
      cell: ({ getValue }) => <Text>{getValue()}</Text>,
    }),

    columnHelper.accessor('details', {
      id: 'details',
      size: 300,
      header: 'Resumo',
      cell: ({ getValue }) => <Text>{getValue()}</Text>,
    }),

    columnHelper.accessor('status', {
      id: 'status',
      size: 120,
      header: 'Tipo',
      enableSorting: false,
      cell: ({ getValue }) => getStatusBadge(getValue() || ''),
    }),

    columnHelper.accessor('amount', {
      id: 'amount',
      size: 120,
      header: 'Total',
      cell: ({ getValue }) => (
        <Text className="font-medium">{getValue()}</Text>
      ),
    }),

    columnHelper.accessor('postBalance', {
      id: 'postBalance',
      size: 140,
      header: 'Saldo Final',
      cell: ({ getValue }) => (
        <Text className="font-medium">{getValue()}</Text>
      ),
    }),
  ];
};
