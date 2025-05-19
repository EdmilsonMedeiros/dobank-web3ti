'use client';

import { useMemo } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { ordersColumns } from '@/app/shared/ecommerce/order/order-list/columns';
import { Input } from 'rizzui';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import cn from '@core/utils/class-names';

type Transaction = {
  id: number;
  amount: string;
  charge: string;
  post_balance: string;
  trx_type: '+' | '-';
  trx: string;
  details: string;
  created_at: string;
};

type Row = {
  id: number;
  date: string;
  reference: string;
  details: string;
  amount: string;
  postBalance: string;
  status: string;
};

export default function RecentOrder({
  className,
  transactions,
}: {
  className?: string;
  transactions: Transaction[];
}) {
  // 1) helper pra formatar BRL igual ao ProfitWidget
  const fmtBRL = (value: string) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(Number(value));

  // 2) transformar a API pro shape que a tabela espera
  const data: Row[] = useMemo(() => {
    return transactions.map((tx) => {
      const sign = tx.trx_type === '-' ? '-' : '';
      return {
        id: tx.id,
        date: new Date(tx.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        reference: tx.trx,
        details: tx.details,
        // aplica o fmtBRL e preserva o sinal + ou –
        amount: `${sign}${fmtBRL(tx.amount)}`,
        postBalance: fmtBRL(tx.post_balance),
        status: tx.trx_type === '+' ? 'PIX_IN' : 'TRANSFER_OTHER_BANK',
      };
    });
  }, [transactions]);

  const { table, setData } = useTanStackTable<Row>({
    tableData: data,
    columnConfig: ordersColumns(false),
    options: {
      initialState: { pagination: { pageIndex: 0, pageSize: 7 } },
      meta: {
        handleDeleteRow: (row) => {
          setData((prev) => prev.filter((r) => r.id !== row.id));
        },
      },
      enableColumnResizing: false,
    },
  });

  return (
    <WidgetCard
      title="Últimas movimentações"
      className={cn('p-0 lg:p-0', className)}
      headerClassName="px-5 pt-5 lg:px-7 lg:pt-7 mb-6"
      action={
        <Input
          type="search"
          clearable
          inputClassName="h-[36px]"
          placeholder="Buscar transação..."
          onClear={() => table.setGlobalFilter('')}
          value={table.getState().globalFilter ?? ''}
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="w-full @3xl:order-3 @3xl:ms-auto @3xl:max-w-72"
        />
      }
    >
      <Table
        table={table}
        variant="modern"
        classNames={{
          cellClassName: 'first:ps-6',
          headerCellClassName: 'first:ps-6',
        }}
      />
      <TablePagination table={table} className="p-4" />
    </WidgetCard>
  );
}
