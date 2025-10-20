// /src/app/shared/charge/charge-form/step-one.tsx
'use client';

import { z } from 'zod';
import { useAtom } from 'jotai';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { Input, Textarea, FieldError } from 'rizzui';
import ChargeHeader from './header';
import ChargeFooter from './footer';
import { formDataAtom, depositResponseAtom, useStepperCharge } from './index';
import { formatCurrency } from '@/utils/formatCurrency';
import { useEffect } from 'react';

// ✅ Esquema condicional com união discriminada
const common = {
  amount: z.string()
    .min(1, { message: 'O valor é obrigatório' })
    .regex(/^\d+(,\d{1,2})?$/, { message: 'Insira um valor válido' }),
  description: z.string().optional(),
};

const schema = z.discriminatedUnion('anonymousPayer', [
  z.object({
    anonymousPayer: z.literal(true),
    ...common,
    clientName: z.string().optional(),
    payer_doc: z.string().optional(),
  }),
  z.object({
    anonymousPayer: z.literal(false),
    ...common,
    clientName: z.string().min(5, { message: 'Informe o nome completo do pagador' }),
    payer_doc: z.string().regex(/^\d{11}$/, 'Use apenas números (11 dígitos)'),
  }),
]);

type FormDataType = z.infer<typeof schema>;

export default function ChargeStepOne() {
  const { data: session } = useSession();
  const { gotoNextStep } = useStepperCharge();
  const [formData, setFormData] = useAtom(formDataAtom);
  const [, setDeposit] = useAtom(depositResponseAtom);

  const {
    control,
    watch,
    formState: { errors },
    handleSubmit,
    unregister,
    clearErrors,
    setValue,
  } = useForm<FormDataType>({
    resolver: zodResolver(schema),
    // ✅ desregistra inputs quando são removidos do DOM (evita validação invisível)
    shouldUnregister: true,
    defaultValues: {
      amount: formData.amount || '',
      description: formData.description || '',
      clientName: formData.clientName || '',
      payer_doc: '',
      anonymousPayer: formData.anonymousPayer ?? false,
    },
  });

  const anonymousPayer = watch('anonymousPayer');

  // ✅ Quando virar anônimo, limpamos valores/erros de nome/CPF
  useEffect(() => {
    if (anonymousPayer) {
      setValue('clientName', '');
      setValue('payer_doc', '');
      clearErrors(['clientName', 'payer_doc']);
      unregister('clientName');
      unregister('payer_doc');
    }
  }, [anonymousPayer, clearErrors, unregister, setValue]);

  const onSubmit: SubmitHandler<FormDataType> = async (data) => {
    // Persiste no atom (apenas para manter o estado do modal)
    setFormData(prev => ({
      ...prev,
      amount: data.amount,
      description: data.description || '',
      clientName: data.anonymousPayer ? '' : (data.clientName || ''),
      anonymousPayer: data.anonymousPayer,
    }));

    const parsedAmount = Number(data.amount.replace(/\./g, '').replace(',', '.'));

    const body: Record<string, any> = {
      amount: parsedAmount,
      description: data.description || '',
    };

    if (data.anonymousPayer) {
      // ✅ backend usa dados do titular
      body.anonymous_payer = true;
    } else {
      body.payer = data.clientName;
      body.payer_doc = (data.payer_doc || '').replace(/\D+/g, '');
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/deposits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.message || 'Falha ao iniciar cobrança Dobank');
    }

    const json = await res.json();
    // { trx, amount, charge, payable }
    setDeposit(json);
    gotoNextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <ChargeHeader
        title="Emitir cobrança (Dobank)"
        description="Informe o valor e os dados do pagador para gerar a cobrança."
      />

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

        {/* Checkbox anônimo (sempre visível) */}
        <Controller
          control={control}
          name="anonymousPayer"
          render={({ field: { value, onChange } }) => (
            <label className="flex items-start gap-3 rounded-md border border-gray-200 p-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
              />
              <span className="text-sm leading-5">
                <strong>Não identificar pagador —</strong> utilizar os dados do titular da conta para registro
              </span>
            </label>
          )}
        />

        {/* Campos do pagador — renderiza só quando NÃO for anônimo
            (com shouldUnregister: true, eles saem do form e param de validar) */}
        {!anonymousPayer && (
          <>
            <Controller
              control={control}
              name="clientName"
              render={({ field }) => (
                <Input
                  label="Nome completo do pagador"
                  placeholder="Ex.: João da Silva"
                  {...field}
                  error={errors.clientName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="payer_doc"
              render={({ field: { value, onChange } }) => (
                <Input
                  label="CPF do pagador (apenas números)"
                  placeholder="Ex.: 12345678901"
                  value={value}
                  onChange={e => onChange(e.target.value.replace(/\D+/g, ''))}
                  error={errors.payer_doc?.message}
                />
              )}
            />
          </>
        )}

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea
              placeholder="Descrição (Opcional)"
              {...field}
              className="w-full"
              textareaClassName="h-20"
            />
          )}
        />
      </div>

      <ChargeFooter />
    </form>
  );
}
