// src/app/(auth)/register/senha/SenhaForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@core/ui/form';
import { Password, Button, Checkbox, Text } from 'rizzui';
import { senhaSchema, SenhaFormData } from '@/validators/senha.schema';

export default function SenhaForm({ preCadastroId }: { preCadastroId: number }) {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  const defaultValues: SenhaFormData = {
    preCadastroId,
    password: '',
    password_confirmation: '',
    PLDFT_term: false,
    privacy_term: false,
    use_term: false,
  };

  const onSubmit = async (data: SenhaFormData) => {
    setApiErrors({});

    const payload = {
      preCadastroId: data.preCadastroId,
      password: data.password,
      password_confirmation: data.password_confirmation,
      PLDFT_term: data.PLDFT_term ? 'on' : undefined,
      privacy_term: data.privacy_term ? 'on' : undefined,
      use_term: data.use_term ? 'on' : undefined,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/register/finalizar-cadastro`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 422 && json.errors) {
          // mapeia erros de campo vindos da API
          setApiErrors(json.errors);
        } else {
          // mensagem genérica
          setApiErrors({ _: [json.message || 'Erro inesperado.'] });
        }
      } else {
        router.push('/signin');
      }
    } catch (err) {
      console.error('Erro ao conectar na API:', err);
      setApiErrors({ _: ['Não foi possível conectar ao servidor.'] });
    }
  };

  return (
    <>
      <Form<SenhaFormData>
        validationSchema={senhaSchema}
        onSubmit={onSubmit}
        useFormProps={{ defaultValues, mode: 'onTouched' }}
      >
        {({ register, formState: { errors } }) => (
          <>
            <input type="hidden" {...register('preCadastroId')} />

            <Password
              label="Senha"
              {...register('password')}
              // mostra erro de validação cliente OU erro vindo da API
              error={errors.password?.message || apiErrors.password?.[0]}
            />
            <Password
              label="Confirme a senha"
              {...register('password_confirmation')}
              error={
                errors.password_confirmation?.message ||
                apiErrors.password_confirmation?.[0]
              }
            />

            <div className="space-y-2 mt-4">
              <Checkbox
                {...register('PLDFT_term')}
                label="Eu concordo com a Política da Empresa"
              />
              <Text className="text-red-600 text-sm">
                {errors.PLDFT_term?.message || apiErrors.PLDFT_term?.[0]}
              </Text>

              <Checkbox
                {...register('privacy_term')}
                label="Eu concordo com a Política de Privacidade"
              />
              <Text className="text-red-600 text-sm">
                {errors.privacy_term?.message || apiErrors.privacy_term?.[0]}
              </Text>

              <Checkbox
                {...register('use_term')}
                label="Eu concordo com os Termos de Serviço"
              />
              <Text className="text-red-600 text-sm">
                {errors.use_term?.message || apiErrors.use_term?.[0]}
              </Text>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => router.back()}>
                Voltar
              </Button>
              <Button type="submit">Abra sua conta</Button>
            </div>
          </>
        )}
      </Form>

      {apiErrors._ && (
        <Text className="mt-4 text-red-600 text-center">
          {apiErrors._[0]}
        </Text>
      )}
    </>
  );
}
