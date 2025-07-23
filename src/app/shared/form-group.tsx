'use client';

import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';

interface FormGroupProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export default function FormGroup({
  title,
  description,
  className,
  children,
}: FormGroupProps) {
  return (
    <div className={cn('pb-7', className)}>
      <Title as="h6" className="mb-2 text-base font-semibold">
        {title}
      </Title>
      {description && (
        <Text className="mb-6 text-sm leading-relaxed text-gray-500">
          {description}
        </Text>
      )}
      <div className="grid grid-cols-2 gap-5 @lg:gap-7">{children}</div>
    </div>
  );
} 