'use client';

import { useMemo } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@/app/shared/ecommerce/dashboard/table-pagination';
import { ordersColumns } from '@/app/shared/payments/columns';
import { Input } from 'rizzui';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import cn from '@core/utils/class-names';

type Boleto = {
  id: number;
  barcode: string;
  valor: string;
  status: string;
  created_at: string;
  updated_at: string;
  lote_id: string;
};

type Row = {
  id: number;
  date: string;
  reference: string;   // barcode
  details: string;     // lote_id
  amount: string;      // valor formatado
  postBalance: string; // não aplicável aqui, deixamos em branco
  status: string;      // status
  date_verify: string;

};

export default function RecentOrder({
  className,
  transactions,
}: {
  className?: string;
  transactions: Boleto[];
}) {
  const fmtBRL = (v: string) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(v));

    const data: Row[] = useMemo(() => {
      return transactions.map((b) => ({
        id: b.id,
        date: new Date(b.created_at).toLocaleDateString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        reference: b.barcode,
        details: b.lote_id,
        amount: fmtBRL(b.valor),
        postBalance: '',       // opcional, pode deixar em branco ou remover coluna
        status: b.status,      // ex: "SUCESSO", "FINALIZADO"
        date_verify: new Date(b.updated_at).toLocaleDateString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
      }));
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
      title="Meus Pagamentos"
      className={cn('p-0 lg:p-0', className)}
      headerClassName="px-5 pt-5 lg:px-7 lg:pt-7 mb-6"
      action={
        <Input
          type="search"
          clearable
          inputClassName="h-[36px]"
          placeholder="Buscar boleto..."
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
      {/* <TablePagination table={table} className="p-4" /> */}
    </WidgetCard>
  );
}
