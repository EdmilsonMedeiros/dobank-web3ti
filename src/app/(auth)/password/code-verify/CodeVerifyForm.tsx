// src/app/(auth)/password/code-verify/CodeVerifyForm.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@core/ui/form';
import { Input, Button, Text } from 'rizzui';
import {
  codeVerifySchema,
  type CodeVerifyFormData,
} from '@/validators/codeVerify.schema';

type Props = {
  emailFromQuery?: string;
};

function cleanCode(v: string) {
  return v.replace(/\W/gi, '').toUpperCase();
}
function formatCode(v: string) {
  const c = cleanCode(v).slice(0, 9);
  return c.replace(/(.{3})/g, '$1 ').trim();
}

export default function CodeVerifyForm({ emailFromQuery = '' }: Props) {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});
  const [apiMessage, setApiMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [codeDisplay, setCodeDisplay] = useState<string>('');

  const defaultValues: CodeVerifyFormData = useMemo(
    () => ({
      email: emailFromQuery,
      code: '',
    }),
    [emailFromQuery]
  );

  const handleResend = async () => {
    setApiErrors({});
    setApiMessage(null);

    if (!emailFromQuery) {
      setApiMessage({ type: 'error', text: 'E-mail não informado. Volte e preencha seu e-mail.' });
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/password/resetar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email', value: emailFromQuery }),
      });
      const json = await res.json();

      if (json?.errors) {
        setApiErrors(json.errors);
        return;
      }
      if (json?.status === 'error' && json?.message) {
        setApiMessage({ type: 'error', text: json.message });
        return;
      }

      setApiMessage({ type: 'success', text: 'Código reenviado com sucesso. Confira seu e-mail.' });
    } catch {
      setApiMessage({ type: 'error', text: 'Falha ao reenviar o código. Tente novamente.' });
    }
  };

  const onSubmit = async (data: CodeVerifyFormData) => {
    setApiErrors({});
    setApiMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/password/code-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // data.code já vem “limpo” pelo schema
        body: JSON.stringify({ email: data.email, code: data.code }),
      });

      const json = await res.json();

      if (json?.errors) {
        setApiErrors(json.errors);
        return;
      }
      if (json?.status === 'error' && json?.message) {
        setApiMessage({ type: 'error', text: json.message });
        return;
      }

      // sucesso: siga para a próxima etapa (definir nova senha)
      router.push(
        `/password/alterar?email=${encodeURIComponent(data.email)}&code=${encodeURIComponent(
          data.code
        )}`
      );
    } catch {
      setApiMessage({ type: 'error', text: 'Não foi possível validar o código. Tente novamente.' });
    }
  };

  return (
    <Form<CodeVerifyFormData>
      validationSchema={codeVerifySchema}
      onSubmit={onSubmit}
      useFormProps={{ defaultValues, mode: 'onTouched' }}
    >
      {({ register, setValue, formState: { errors } }) => (
        <div className="space-y-5">
          {/* mensagens globais */}
          {apiMessage?.text && (
            <Text className={apiMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}>
              {apiMessage.text}
            </Text>
          )}

          {/* info do email */}
          <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Enviamos um código para: <span className="font-medium text-gray-900">{emailFromQuery || '—'}</span>
          </div>

          {/* campo hidden para enviar o email junto */}
          <input type="hidden" {...register('email')} value={emailFromQuery} readOnly />

          {/* código: agrupa a cada 3 caracteres, até 9 (ex.: ABC DEF GHI) */}
          <Input
            label="Código"
            placeholder="ABC DEF GHI"
            value={codeDisplay}
            onChange={(e) => {
              const formatted = formatCode(e.target.value);
              setCodeDisplay(formatted);
              // mantemos no form o mesmo texto; o schema fará o “clean”
              setValue('code', formatted, { shouldValidate: true });
            }}
            onBlur={(e) => {
              // garante formatação ao sair do campo
              const formatted = formatCode(e.target.value);
              setCodeDisplay(formatted);
              setValue('code', formatted, { shouldValidate: true });
            }}
            inputClassName="uppercase tracking-wider"
            error={errors.code?.message || apiErrors.code?.[0]}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Voltar
            </Button>

            <div className="flex items-center gap-3">
              <Button type="button" variant="text" onClick={handleResend}>
                Reenviar código
              </Button>
              <Button type="submit">Validar</Button>
            </div>
          </div>
        </div>
      )}
    </Form>
  );
}
