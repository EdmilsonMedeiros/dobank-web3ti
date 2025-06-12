'use client';

import { z } from 'zod';
import { useAtom } from 'jotai';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { Input, Textarea, FieldError } from 'rizzui';
import ChargeHeader from './header';
import ChargeFooter from './footer';
import { formDataAtom, initialChargeData, depositResponseAtom } from './index';
import { useStepperCharge } from './index';
import { formatCurrency } from '@/utils/formatCurrency';

const schema = z.object({
  amount: z
    .string()
    .min(1, { message: 'O valor é obrigatório' })
    .regex(/^\d+(,\d{1,2})?$/, { message: 'Insira um valor válido' }),
  description: z.string().optional(),
});

type FormDataType = z.infer<typeof schema>;

export default function ChargeStepOne() {
  const { data: session } = useSession();
  const { gotoNextStep } = useStepperCharge();
  const [formData, setFormData] = useAtom(formDataAtom);
  const [, setDeposit] = useAtom(depositResponseAtom);

  const { control, formState: { errors }, handleSubmit } = useForm<FormDataType>({
    resolver: zodResolver(schema),
    defaultValues: formData,
  });

  const onSubmit: SubmitHandler<FormDataType> = async data => {
    setFormData({ amount: data.amount, description: data.description || '' });
    const parsed = Number(data.amount.replace(/\./g, '').replace(',', '.'));
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/deposits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
      body: JSON.stringify({ amount: parsed }),
    });
    if (!res.ok) throw new Error('Falha ao gerar cobrança');
    const json = await res.json();
    setDeposit(json);
    gotoNextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <ChargeHeader title="Emitir cobrança" description="Informe o valor e clique em 'Gerar'." />

      <div className="space-y-5 px-5 pb-6 pt-5 md:px-7 md:pb-9 md:pt-7">
        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange } }) => (
            <Input
              label="Valor da cobrança (R$)"
              prefix="R$"
              placeholder="00,00"
              value={value}
              onChange={e => onChange(formatCurrency(e.target.value))}
              error={errors.amount?.message}
              className="w-full"
            />
          )}
        />
        {errors.amount && <FieldError error={errors.amount.message} />}

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea placeholder="Descrição (Opcional)" {...field} className="w-full" textareaClassName="h-20" />
          )}
        />
      </div>

      <ChargeFooter />
    </form>
  );
}
