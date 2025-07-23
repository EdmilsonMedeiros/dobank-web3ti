import '@tanstack/table-core';

declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    handleDeleteRow?: (row: TData) => void;
    handleMultipleDelete?: (rows: TData[]) => void;
  }
} 