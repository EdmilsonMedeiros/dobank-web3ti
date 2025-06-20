'use client';

import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import { createColumnHelper } from '@tanstack/react-table';
import { Text } from 'rizzui';
import { Row as OrdersDataType } from '@/app/shared/payments/recent-order';

const columnHelper = createColumnHelper<OrdersDataType>();

export const ordersColumns = () => [
  columnHelper.display({
    id: 'id',
    size: 80,
    header: 'ID',
    cell: ({ row }) => <>#{row.original.id}</>,
  }),
  
  columnHelper.accessor('reference', {
    id: 'reference',
    size: 250,
    header: 'Código de Barras',
    cell: ({ getValue }) => (
      <Text
      className="inline-block font-mono text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5"
      >
        {getValue()}
      </Text>
    ),
  }),
  
  columnHelper.accessor('amount', {
    id: 'amount',
    size: 120,
    header: 'Valor',
    cell: ({ getValue }) => (
      <Text className="font-medium">{getValue()}</Text>
    ),
  }),

  columnHelper.accessor('status', {
    id: 'status',
    size: 120,
    header: 'Status',
    enableSorting: false,
    cell: ({ getValue }) => getStatusBadge(getValue() || ''),
  }),

  columnHelper.accessor('date', {
    id: 'date',
    size: 120,
    header: 'Data',
    cell: ({ getValue }) => <Text>{getValue()}</Text>,
  }),

  columnHelper.accessor('date_verify', {
    id: 'date_verify',
    size: 120,
    header: 'Data Verificação',
    cell: ({ getValue }) => <Text>{getValue()}</Text>,
  }),

  // columnHelper.accessor('details', {
  //   id: 'details',
  //   size: 200,
  //   header: 'Lote',
  //   cell: ({ getValue }) => <Text>{getValue()}</Text>,
  // }),
];
