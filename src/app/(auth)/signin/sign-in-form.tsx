'use client';

import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Checkbox, Password, Button, Input, Text, PinCode } from 'rizzui';
import { Form } from '@core/ui/form';
import { routes } from '@/config/routes';
import { loginSchema, LoginSchema } from '@/validators/login.schema';

export default function SignInForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: LoginSchema) => {
    setErrorMessage(null);

    // 1) Autentica via NextAuth (sem redirecionar automaticamente)
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl: routes.core.dashboard,
    });

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }

    // 2) Força a leitura/hidratação da sessão no seu domínio
    const session = await getSession();
    if (!session) {
      setErrorMessage('Falha ao iniciar sessão. Tente novamente.');
      return;
    }

    // 3) Se existir URL do legado, sai do app e deixa o Laravel tratar
    const legacyUrl = session.user?.legacyLoginUrl;
    if (legacyUrl) {
      // (opcional) pequeno delay para garantir flush do cookie antes de trocar de domínio
      await new Promise((r) => setTimeout(r, 50));
      window.location.href = legacyUrl;
      return;
    }

    // 4) Caso não tenha legado, segue o fluxo normal
    router.push(result?.url || routes.core.dashboard);
  };

  return (
    <>
      <Form<LoginSchema>
        validationSchema={loginSchema}
        onSubmit={onSubmit}
        useFormProps={{
          mode: 'onChange',
          defaultValues: { email: '', password: '', rememberMe: true },
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            {errorMessage && (
              <Text className="text-red-600">{errorMessage}</Text>
            )}
            <Input
              type="email"
              label="Email"
              {...register('email')}
            // error={errors.email?.message}
            />
            <Password
              label="Password"
              {...register('password')}
              error={errors.password?.message}
            />
            <div className="flex items-center justify-between">
              <Checkbox {...register('rememberMe')} label="Remember Me" />
              <Link href={routes.auth.resetPassword}>
                Esqueceu a senha?
              </Link>
            </div>

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center leading-loose text-gray-500 lg:mt-8 lg:text-start">
        Não tem uma conta?{' '}
        <Link
          href={routes.auth.contapj1}
          className="font-semibold text-gray-700 transition-colors hover:text-blue"
        >
          Abra uma aqui!
        </Link>
      </Text>
    </>
  );
}
