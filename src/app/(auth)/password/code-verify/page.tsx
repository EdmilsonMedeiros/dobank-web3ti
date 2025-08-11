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

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function CodeVerifyPage({ searchParams }: PageProps) {
  const emailParam = searchParams?.email;
  const email =
    typeof emailParam === 'string' ? decodeURIComponent(emailParam) : '';

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
