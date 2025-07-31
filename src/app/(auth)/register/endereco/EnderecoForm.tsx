// src/app/(auth)/register/endereco/EnderecoForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@core/ui/form';
import { Input, Button, Text } from 'rizzui';
import { enderecoSchema, EnderecoFormData } from '@/validators/endereco.schema';

export default function EnderecoForm({ preCadastroId }: { preCadastroId: number }) {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  const defaultValues: EnderecoFormData = {
    preCadastroId,
    zip: '',
    city: '',
    uf: '',
    address: '',
    address_number: '',
    address_complement: '',
    district: '',
  };

  const onSubmit = async (data: EnderecoFormData) => {
    setApiErrors({});
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/register/senha`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    const json = await res.json();
    if (json.errors) {
      setApiErrors(json.errors);
    } else {
      router.push(`/auth/register/senha?preCadastroId=${json.preCadastroId}`);
    }
  };

  return (
    <>
      <Form<EnderecoFormData>
        validationSchema={enderecoSchema}
        onSubmit={onSubmit}
        useFormProps={{ defaultValues, mode: 'onTouched' }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            {/* Hidden para incluir preCadastroId no body */}
            <input type="hidden" {...register('preCadastroId')} />

            <Input
              label="CEP"
              {...register('zip')}
              error={errors.zip?.message || apiErrors.zip?.[0]}
            />
            <Input
              label="Cidade"
              {...register('city')}
              error={errors.city?.message || apiErrors.city?.[0]}
            />
            <Input
              label="UF"
              {...register('uf')}
              error={errors.uf?.message || apiErrors.uf?.[0]}
            />
            <Input
              label="Endereço completo"
              {...register('address')}
              error={errors.address?.message || apiErrors.address?.[0]}
            />
            <Input
              label="Número"
              {...register('address_number')}
              error={errors.address_number?.message || apiErrors.address_number?.[0]}
            />
            <Input
              label="Complemento"
              {...register('address_complement')}
              error={
                errors.address_complement?.message ||
                apiErrors.address_complement?.[0]
              }
            />
            <Input
              label="Bairro"
              {...register('district')}
              error={errors.district?.message || apiErrors.district?.[0]}
            />

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Voltar
              </Button>
              <Button type="submit">Próximo</Button>
            </div>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center text-red-600">
        {/* Exibe mensagem geral caso necessário */}
        {apiErrors._ ? apiErrors._[0] : null}
      </Text>
    </>
  );
}
