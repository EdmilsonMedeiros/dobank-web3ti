// src/app/(auth)/password/resetar/PasswordResetForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@core/ui/form';
import { Input, Button, Select, Text } from 'rizzui';
import { Controller } from 'react-hook-form';
import { passwordResetSchema, PasswordResetFormData } from '@/validators/passwordReset.schema';

// Tipo das opções do Select
type OptionType = {
  value: PasswordResetFormData['type'];
  label: string;
};

export default function PasswordResetForm() {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const [apiErrorMessage, setApiErrorMessage] = useState<string>('');

  const defaultValues: PasswordResetFormData = {
    type: 'email',
    value: '',
    captcha: ''
  };

  const onSubmit = async (data: PasswordResetFormData) => {
    // limpa erros anteriores
    setApiErrors({});
    setApiErrorMessage('');

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/password/resetar`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    const json = await res.json();

    // erros de campo (422)
    if (json.errors) {
      setApiErrors(json.errors);
      return;
    }

    // erro genérico vindo do back
    if (json.status === 'error' && json.message) {
      setApiErrorMessage(json.message);
      return;
    }

    // sucesso: redireciona
    router.push(`/password/code-verify?email=${encodeURIComponent(data.value)}`);
  };

  // opções do select
  const typeOptions: OptionType[] = [
    { value: 'email', label: 'E-mail' }
  ];

  return (
    <Form<PasswordResetFormData>
      validationSchema={passwordResetSchema}
      onSubmit={onSubmit}
      useFormProps={{ defaultValues, mode: 'onTouched' }}
    >
      {({ register, control, formState: { errors } }) => (
        <div className="space-y-5">
          {/* Mensagem de erro genérico */}
          {apiErrorMessage && (
            <Text className="text-red-600">{apiErrorMessage}</Text>
          )}

          {/* Tipo: apenas email por enquanto */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => {
              const selected = typeOptions.find(o => o.value === field.value) || null;
              return (
                <Select
                  label="Tipo"
                  options={typeOptions}
                  value={selected}
                  onChange={(opt: OptionType) => field.onChange(opt.value)}
                  error={errors.type?.message || apiErrors.type?.[0]}
                />
              );
            }}
          />

          {/* Input simples para e-mail */}
          <Input
            label="Digite seu E-mail"
            type="email"
            {...register('value')}
            error={errors.value?.message || apiErrors.value?.[0]}
          />

          {/* reCAPTCHA (se for usar, registre via Controller/setValue) */}
          {/* 
          <Controller
            name="captcha"
            control={control}
            render={({ field }) => (
              <Recaptcha onChange={field.onChange} />
            )}
          />
          {apiErrors.captcha && (
            <Text className="mt-2 text-red-600">
              {apiErrors.captcha[0]}
            </Text>
          )}
          */}

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => router.back()}>
              Voltar
            </Button>
            <Button type="submit">
              Enviar
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
