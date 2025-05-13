'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
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

    // chama o NextAuth, que por sua vez roda o authorize() no servidor
    const result = await signIn('credentials', {
      redirect: false,                             // impede redirecionamento automático
      email: data.email,
      password: data.password,
      callbackUrl: routes.eCommerce.dashboard      // para onde queremos ir após login
    });

    if (result?.error) {
      // exibe mensagem de erro vinda do authorize()
      setErrorMessage(result.error);
    } else {
      // usa a URL retornada (ou a dashboard como fallback)
      router.push(result?.url || routes.eCommerce.dashboard);
    }
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
        Don’t have an account?{' '}
        <Link href={routes.auth.signUp1}>Sign Up</Link>
      </Text>
    </>
  );
}
