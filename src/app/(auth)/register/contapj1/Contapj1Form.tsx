// src/app/(auth)/register/contapj1/Contapj1Form.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Form } from '@core/ui/form';
import { Controller } from 'react-hook-form';
import { contapj1Schema, Contapj1FormData } from '@/validators/contapj1.schema';
import { Input, Select, Button, Text } from 'rizzui';
import { useState } from 'react';

interface InitialData {
  pageTitle: string;
  countries: Record<string, { country: string; dial_code: string }>;
  mobile_code: string;
  preCadastroId: number;
}

export default function Contapj1Form({ initialData }: { initialData: InitialData }) {
  const router = useRouter();
  const backTo = '/signin';
  const nextPath = '/register/endereco';

  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  const defaultValues: Contapj1FormData = {
    preCadastroId: initialData.preCadastroId,
    razaoSocial: '',
    nomeFantasia: '',
    numeroCNPJ: '',
    numeroCPF: '',
    nomeResponsavel: '',
    sobrenomeResponsavel: '',
    email: '',
    country: initialData.countries[initialData.mobile_code].country,
    country_code: initialData.mobile_code,
    mobile_code: `+${initialData.countries[initialData.mobile_code].dial_code}`,
    telefone: '',
  };

  const onSubmit = async (data: Contapj1FormData) => {
    setApiErrors({});

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/register/endereco`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',   // garante retorno JSON
          },
          body: JSON.stringify(data),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 422 && json.errors) {
          setApiErrors(json.errors);
        } else {
          setApiErrors({ _: [json.message || 'Erro inesperado.'] });
        }
        return;
      }

      router.push(`${nextPath}?preCadastroId=${json.preCadastroId}`);
    } catch (err) {
      console.error(err);
      setApiErrors({ _: ['Não foi possível conectar ao servidor.'] });
    }
  };

  return (
    <>
      <Form<Contapj1FormData>
        validationSchema={contapj1Schema}
        onSubmit={onSubmit}
        useFormProps={{ defaultValues, mode: 'onTouched' }}
      >
        {({ register, control, formState: { errors } }) => (
          <div className="flex flex-col gap-x-4 gap-y-5 md:grid md:grid-cols-2 lg:gap-5">
            {/* campos ocultos */}
            <input type="hidden" {...register('preCadastroId')} />
            <input type="hidden" {...register('country')} />

            <Input
              size="lg"
              label="Razão Social"
              {...register('razaoSocial')}
              error={errors.razaoSocial?.message ?? apiErrors.razaoSocial?.[0]}
            />

            <Input
              size="lg"
              label="Nome Fantasia"
              {...register('nomeFantasia')}
              error={errors.nomeFantasia?.message ?? apiErrors.nomeFantasia?.[0]}
            />

            <Input
              size="lg"
              label="Número do CNPJ"
              placeholder="00.000.000/0000-00"
              {...register('numeroCNPJ')}
              error={
                errors.numeroCNPJ?.message
                ?? apiErrors.numeroCNPJ?.[0]
                ?? apiErrors.document_number?.[0]
              }
            />

            <Input
              size="lg"
              label="Número do CPF"
              placeholder="000.000.000-00"
              {...register('numeroCPF')}
              error={
                errors.numeroCPF?.message
                ?? apiErrors.numeroCPF?.[0]
                ?? apiErrors.document_number?.[0]
              }
            />

            <Input
              size="lg"
              label="Nome do Responsável"
              {...register('nomeResponsavel')}
              error={errors.nomeResponsavel?.message ?? apiErrors.nomeResponsavel?.[0]}
            />

            <Input
              size="lg"
              label="Sobrenome do Responsável"
              {...register('sobrenomeResponsavel')}
              error={errors.sobrenomeResponsavel?.message ?? apiErrors.sobrenomeResponsavel?.[0]}
            />

            <Input
              type="email"
              size="lg"
              label="E-mail"
              {...register('email')}
              error={errors.email?.message ?? apiErrors.email?.[0]}
              className="col-span-2"
            />

            <Controller
              name="country_code"
              control={control}
              defaultValue={defaultValues.country_code}
              render={({ field }) => (
                <Select
                  {...field}
                  size="lg"
                  label="País"
                  options={Object.entries(initialData.countries).map(
                    ([code, { country }]) => ({ value: code, label: country })
                  )}
                  invalid={Boolean(errors.country_code || apiErrors.country_code)}
                />
              )}
            />
            {(errors.country_code?.message ?? apiErrors.country_code?.[0]) && (
              <Text className="col-span-2 text-red-600 text-sm">
                {errors.country_code?.message ?? apiErrors.country_code?.[0]}
              </Text>
            )}

            <Input
              size="lg"
              label="DDI"
              disabled
              {...register('mobile_code')}
            />

            <Input
              size="lg"
              label="Telefone"
              placeholder="(XX) XXXXX-XXXX"
              {...register('telefone')}
              error={errors.telefone?.message ?? apiErrors.telefone?.[0]}
            />

            <div className="col-span-2 flex justify-between mt-2">
              <Button variant="outline" onClick={() => router.push(backTo)}>
                Voltar
              </Button>
              <Button size="lg" type="submit">
                Próximo
              </Button>
            </div>

            {apiErrors._ && (
              <Text className="col-span-2 text-center text-red-600">
                {apiErrors._[0]}
              </Text>
            )}
          </div>
        )}
      </Form>

      <Text className="mt-6 text-center text-gray-500">
        Já tem uma conta?{' '}
        <Link href={backTo} className="font-semibold text-gray-700 hover:text-blue">
          Faça login aqui!
        </Link>
      </Text>
    </>
  );
}
