'use client';

import { productsReviewsColumns } from '@/app/shared/ecommerce/review/columns';
import { productReviews } from '@/data/product-reviews';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TableFooter from '@core/components/table/footer';
import TablePagination from '@core/components/table/pagination';
import Filters from './filters';

export type ReviewsDataType = (typeof productReviews)[number];

interface TableMeta {
  handleDeleteRow: (row: ReviewsDataType) => void;
  handleMultipleDelete: (rows: ReviewsDataType[]) => void;
}

export default function ReviewsTable() {
  const { table, setData } = useTanStackTable<ReviewsDataType>({
    tableData: productReviews,
    columnConfig: productsReviewsColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      meta: {
        handleDeleteRow: (row: ReviewsDataType) => {
          setData((prev) => prev.filter((r) => r.id !== row.id));
        },
        handleMultipleDelete: (rows: ReviewsDataType[]) => {
          setData((prev) => prev.filter((r) => !rows.includes(r)));
        },
      } as TableMeta,
      enableColumnResizing: false,
    },
  });

  return (
    <>
      <Filters table={table} />
      <Table
        table={table}
        variant="modern"
        classNames={{
          container: 'border border-muted rounded-md',
          rowClassName: 'last:border-0',
        }}
      />
      <TableFooter table={table} />
      <TablePagination table={table} className="py-4" />
    </>
  );
}
