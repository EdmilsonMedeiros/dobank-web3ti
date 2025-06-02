// /src/app/shared/charge/charge-form/header.tsx
'use client';

import { ActionIcon, Title, Text } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import ScheduleLightIcon from '@core/components/icons/schedule-light';
import cn from '@core/utils/class-names';
import { TbReportMoney } from "react-icons/tb";

interface ChargeHeaderProps {
  title?: string;
  description?: string; // opcional: texto abaixo do título
  className?: string;
}

export default function ChargeHeader({
  title = 'Emitir cobrança',
  description,
  className,
}: ChargeHeaderProps) {
  const { closeModal } = useModal();

  return (
    <div className={cn('relative', className)}>
      {/* Botão de fechar no canto superior direito */}
      <ActionIcon
        size="sm"
        variant="text"
        onClick={() => closeModal()}
        className="absolute end-3.5 top-3.5 p-0 text-gray-500 hover:!text-gray-900 md:end-7 md:top-7"
      >
        <PiXBold className="h-5 w-5" />
      </ActionIcon>

      {/* Área centralizada com ícone, título e descrição */}
      <div className="mx-auto flex max-w-md flex-col items-center gap-2.5 px-5 pb-7 pt-8 text-center md:px-7 md:pb-10 md:pt-12">
        <ScheduleLightIcon className="w-12 text-gray-400" />

        <Title
          as="h3"
          className="text-lg font-semibold text-gray-900 md:text-2xl"
        >
          {title}
        </Title>

        {description && (
          <p className="leading-relaxed text-gray-500 md:pt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
