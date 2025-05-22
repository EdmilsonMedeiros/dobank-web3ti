'use client';

import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Checkbox, Password, Button, Input, Text } from 'rizzui';
import { Form } from '@core/ui/form';
import { routes } from '@/config/routes';
import { loginSchema, LoginSchema } from '@/validators/login.schema';

export default function SignInForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: LoginSchema) => {
    setErrorMessage(null);

    // 1) Autentica via NextAuth (authorize no servidor)
    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl: routes.eCommerce.dashboard,
    });

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }

    // 2) Se existir legacyLoginUrl, redireciona full para lá (Laravel trata e volta)
    const session = await getSession();
    const legacyUrl = session?.user?.legacyLoginUrl;
    if (legacyUrl) {
      window.location.href = legacyUrl;
      return;
    }

    // 3) Caso não haja legacyUrl, cai aqui
    router.push(result?.url || routes.eCommerce.dashboard);
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
              error={errors.email?.message}
            />
            <Password
              label="Password"
              {...register('password')}
              error={errors.password?.message}
            />
            <div className="flex items-center justify-between">
              <Checkbox {...register('rememberMe')} label="Remember Me" />
              <Link href={routes.auth.forgotPassword1}>
                Forget Password?
              </Link>
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </div>
        )}
      </Form>
      <Text className="mt-6 text-center">
        Don’t have an account? <Link href={routes.auth.signUp1}>Sign Up</Link>
      </Text>
    </>
  );
}
