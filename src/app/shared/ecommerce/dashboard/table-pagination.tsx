'use client';

import Link from 'next/link';
import { type Table as ReactTableType } from '@tanstack/react-table';
import { Flex } from 'rizzui';
import { Button } from 'rizzui/button';
import cn from '@core/utils/class-names';
import { routes } from '@/config/routes';

export default function TablePagination<TData extends Record<string, any>>({
  table,
  className,
}: {
  table: ReactTableType<TData>;
  className?: string;
}) {
  return (
    <Flex justify="center" className={cn('@container', className)}>
      <Link href={routes.core.transactions()}>
        <Button size="sm" variant="outline">
          Ver mais
        </Button>
      </Link>
    </Flex>
  );
}
