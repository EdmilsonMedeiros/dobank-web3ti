// /src/app/shared/charge/charge-form/step-one.tsx
'use client';

import { z } from 'zod';
import { useAtom } from 'jotai';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { Input, Textarea, FieldError } from 'rizzui';
import ChargeHeader from './header';
import ChargeFooter from './footer';
import { formDataAtom, useStepperCharge } from '@/app/shared/charge/charge-form';
import { formatCurrency } from "@/utils/formatCurrency";

const chargeStepOneSchema = z.object({
  amount: z
    .string()
    .min(1, { message: 'O valor é obrigatório' })
    .regex(/^\d+(,\d{1,2})?$/, {
      message: 'Insira um valor numérico válido (ex: 100 ou 100,50)',
    }),
  description: z.string().optional(),
});

type FormSchemaType = z.infer<typeof chargeStepOneSchema>;

export default function ChargeStepOne() {
  const { gotoNextStep } = useStepperCharge();
  const [formData, setFormData] = useAtom(formDataAtom);

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(chargeStepOneSchema),
    defaultValues: {
      amount: formData.amount,
      description: formData.description,
    },
  });

  const onSubmit: SubmitHandler<FormSchemaType> = (data) => {
    setFormData((prev) => ({
      ...prev,
      amount: data.amount,
      description: data.description ?? '',
    }));
    gotoNextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <ChargeHeader
        title="Emitir cobrança"
        description="Informe o valor e clique em 'Gerar'. Em seguida, um QR Code da cobrança será exibido para você compartilhar e receber o pagamento"
      />

      {/* Campos do step 1: Valor em cima e Descrição embaixo */}
      <div className="space-y-5 px-5 pb-6 pt-5 md:px-7 md:pb-9 md:pt-7">
        {/* Campo “Valor (R$)” */}
        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange } }) => {
            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const raw = e.target.value;
              const formatted = formatCurrency(raw);
              onChange(formatted);
            };

            return (
              <Input
                label="Valor da cobrança (R$)"
                type="text"
                prefix="R$"
                placeholder="00,00"
                value={value}
                onChange={handleChange}
                error={errors.amount?.message}
                className="w-full"
              />
            );
          }}
        />
        {/* {errors.amount && (
          <FieldError error={errors.amount.message} className="px-5" />
        )} */}

        {/* Campo “Descrição” (abaixo) */}
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <Textarea
              label="Descrição da cobrança (Opcional)"
              placeholder="A descrição informada será impressa na fatura"
              value={value}
              onChange={onChange}
              error={errors.description?.message}
              className="w-full"
              textareaClassName="h-20"
            />
          )}
        />
        {errors.description && (
          <FieldError error={errors.description.message} className="px-5" />
        )}
      </div>

      <ChargeFooter />
    </form>
  );
}