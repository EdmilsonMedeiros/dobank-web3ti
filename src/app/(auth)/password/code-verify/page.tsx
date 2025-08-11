// src/app/(auth)/password/code-verify/page.tsx
import Image from 'next/image';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import UnderlineShape from '@core/components/shape/underline';
import { metaObject } from '@/config/site.config';
import passwordImg from '@public/sign-in.webp';
import CodeVerifyForm from './CodeVerifyForm';

export const metadata = {
  ...metaObject('Verificar Código'),
};

export default async function CodeVerifyPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const emailRaw = Array.isArray(sp.email) ? sp.email[0] : sp.email;
  const email = typeof emailRaw === 'string' ? decodeURIComponent(emailRaw) : '';

  return (
    <AuthWrapperOne
      title={
        <>
          Verificar{' '}
          <span className="relative inline-block">
            código
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-blue" />
          </span>
        </>
      }
      description="Informe o código que enviamos para o seu e-mail"
      isSocialLoginActive={false}
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px]">
          <Image
            src={passwordImg}
            alt="Verificar código illustration"
            width={passwordImg.width}
            height={passwordImg.height}
            className="block mx-auto object-contain"
            priority
            sizes="(max-width: 768px) 100vw"
          />
        </div>
      }
    >
      <CodeVerifyForm emailFromQuery={email} />
    </AuthWrapperOne>
  );
}
