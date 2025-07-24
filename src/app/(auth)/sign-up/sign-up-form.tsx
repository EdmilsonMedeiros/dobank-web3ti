'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { PiArrowRightBold } from 'react-icons/pi';
import { Checkbox, Button, Input, Text, Select } from 'rizzui';
import { Form } from '@core/ui/form';
import { routes } from '@/config/routes';
import { SignUpSchema, signUpSchema } from '@/validators/signup.schema';

const initialValues = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  cpf: '',
  nomeResponsavel: '',
  sobrenomeResponsavel: '',
  email: '',
  pais: 'BR',       // valor padrão “Brazil”
  ddi: '+55',       // DDI fixo
  telefone: '',
  isAgreed: false,  // necessário para o checkbox
};

export default function SignUpForm() {
  const [reset, setReset] = useState<typeof initialValues>(initialValues);

  const onSubmit: SubmitHandler<SignUpSchema> = (data) => {
    console.log(data);
    setReset(initialValues);
  };

  return (
    <>
      <Form
        validationSchema={signUpSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          defaultValues: initialValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="flex flex-col gap-x-4 gap-y-5 md:grid md:grid-cols-2 lg:gap-5">
            <Input
              type="text"
              size="lg"
              label="Razão Social"
              placeholder="Digite a razão social"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('razaoSocial')}
              error={errors.razaoSocial?.message}
            />
            <Input
              type="text"
              size="lg"
              label="Nome Fantasia"
              placeholder="Digite o nome fantasia"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('nomeFantasia')}
              error={errors.nomeFantasia?.message}
            />
            <Input
              type="text"
              size="lg"
              label="Número do CNPJ"
              placeholder="00.000.000/0000-00"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('cnpj')}
              error={errors.cnpj?.message}
            />
            <Input
              type="text"
              size="lg"
              label="Número do CPF"
              placeholder="000.000.000-00"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('cpf')}
              error={errors.cpf?.message}
            />
            <Input
              type="text"
              size="lg"
              label="Nome do Responsável"
              placeholder="Digite o nome do responsável"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('nomeResponsavel')}
              error={errors.nomeResponsavel?.message}
            />
            <Input
              type="text"
              size="lg"
              label="Sobrenome do Responsável"
              placeholder="Digite o sobrenome do responsável"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('sobrenomeResponsavel')}
              error={errors.sobrenomeResponsavel?.message}
            />
            <Input
              type="email"
              size="lg"
              label="Endereço de E-mail"
              placeholder="Digite seu e-mail"
              className="col-span-2 [&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('email')}
              error={errors.email?.message}
            />

            {/* Grupo de telefone */}
            <div className="col-span-2 grid grid-cols-3 gap-x-4">
              <Select
                size="lg"
                label="País"
                className="text-sm [&>label>span]:font-medium"
                {...register('pais')}
                options={[
                  { value: 'BR', label: 'Brazil' },
                  { value: 'US', label: 'USA' },
                  // outras opções...
                ]}
                error={errors.pais?.message}
              />
              <Input
                type="text"
                size="lg"
                label="DDI"
                placeholder="+55"
                className="[&>label>span]:font-medium"
                inputClassName="text-sm"
                disabled
                {...register('ddi')}
              />
              <Input
                type="text"
                size="lg"
                label="Telefone"
                placeholder="(XX) XXXXX-XXXX"
                className="[&>label>span]:font-medium"
                inputClassName="text-sm"
                {...register('telefone')}
                error={errors.telefone?.message}
              />
            </div>

            <div className="col-span-2 flex items-start">
              <Checkbox
                {...register('isAgreed')}
                className="[&>label>span]:font-medium [&>label]:items-start"
                label={
                  <>
                    Ao se cadastrar, você concorda com os{' '}
                    <Link
                      href="/"
                      className="font-medium text-blue transition-colors hover:underline"
                    >
                      Termos
                    </Link>{' '}
                    e a{' '}
                    <Link
                      href="/"
                      className="font-medium text-blue transition-colors hover:underline"
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </>
                }
              />
            </div>

            <Button size="lg" type="submit" className="col-span-2 mt-2">
              <span>Criar Conta</span>{' '}
              <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
            </Button>
          </div>
        )}
      </Form>

      <Text className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        Já tem uma conta?{' '}
        <Link
          href={routes.auth.signIn}
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          Faça login aqui!
        </Link>
      </Text>
    </>
  );
}
