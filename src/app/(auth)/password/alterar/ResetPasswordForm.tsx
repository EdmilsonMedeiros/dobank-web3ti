// src/app/(auth)/password/alterar/ResetPasswordForm.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@core/ui/form';
import { Button, Text } from 'rizzui';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/validators/resetPassword.schema';

type Props = {
  emailFromQuery?: string;
  codeFromQuery?: string;
};

function PasswordField({
  label,
  error,
  ...rest
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          {...rest}
          type={show ? 'text' : 'password'}
          className={`block w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-3 my-auto text-xs font-medium text-gray-600"
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default function ResetPasswordForm({
  emailFromQuery = '',
  codeFromQuery = '',
}: Props) {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const [apiMessage, setApiMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  const defaultValues: ResetPasswordFormData = useMemo(
    () => ({
      email: emailFromQuery,
      code: codeFromQuery,
      password: '',
      password_confirmation: '',
    }),
    [emailFromQuery, codeFromQuery]
  );

  const onSubmit = async (data: ResetPasswordFormData) => {
    setApiErrors({});
    setApiMessage(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/password/reset`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            code: data.code, // já “limpo” pelo schema
            password: data.password,
            password_confirmation: data.password_confirmation,
          }),
        }
      );

      const json = await res.json();

      if (json?.errors) {
        setApiErrors(json.errors);
        return;
      }
      if (json?.status === 'error' && json?.message) {
        setApiMessage({ type: 'error', text: json.message });
        return;
      }

      setApiMessage({
        type: 'success',
        text: json?.message || 'Senha redefinida com sucesso.',
      });

      setTimeout(() => {
        router.push('/signin');
      }, 600);
    } catch {
      setApiMessage({
        type: 'error',
        text: 'Não foi possível redefinir a senha. Tente novamente.',
      });
    }
  };

  return (
    <Form<ResetPasswordFormData>
      validationSchema={resetPasswordSchema}
      onSubmit={onSubmit}
      useFormProps={{ defaultValues, mode: 'onTouched' }}
    >
      {({ register, formState: { errors } }) => (
        <div className="space-y-5">
          {apiMessage?.text && (
            <Text className={apiMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}>
              {apiMessage.text}
            </Text>
          )}

          <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Alterando senha para:{' '}
            <span className="font-medium text-gray-900">{emailFromQuery || '—'}</span>
          </div>

          {/* hidden fields */}
          <input type="hidden" {...register('email')} value={emailFromQuery} readOnly />
          <input type="hidden" {...register('code')} value={codeFromQuery} readOnly />

          <div className="text-xs text-gray-600">
            Sua senha deve ter ao menos 7 caracteres, incluindo letra maiúscula, letra minúscula,
            número e caractere especial.
          </div>

          <PasswordField
            label="Nova senha"
            autoComplete="new-password"
            {...register('password')}
            error={errors.password?.message || apiErrors.password?.[0]}
          />

          <PasswordField
            label="Confirmar nova senha"
            autoComplete="new-password"
            {...register('password_confirmation')}
            error={
              errors.password_confirmation?.message ||
              apiErrors.password_confirmation?.[0]
            }
          />

          <div className="flex justify-between pt-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Voltar
            </Button>
            <Button type="submit">Redefinir senha</Button>
          </div>
        </div>
      )}
    </Form>
  );
}
