// src/app/(auth)/password/resetar/page.tsx
import Image from 'next/image';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import UnderlineShape from '@core/components/shape/underline';
import { metaObject } from '@/config/site.config';
import passwordImg from '@public/sign-in.webp';
import PasswordResetForm from './PasswordResetForm';

export const metadata = {
  ...metaObject('Redefinir Senha'),
};

export default function PasswordResetPage() {
  return (
    <AuthWrapperOne
      title={
        <>
          Redefinir{' '}
          <span className="relative inline-block">
            senha
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-blue" />
          </span>
        </>
      }
      description="Informe seu e-mail para receber o código de redefinição de senha"
      isSocialLoginActive={false}
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px]">
          <Image
            src={passwordImg}
            alt="Redefinir Senha illustration"
            width={passwordImg.width}
            height={passwordImg.height}
            className="block mx-auto object-contain"
            priority
            sizes="(max-width: 768px) 100vw"
          />
        </div>
      }
    >
      <PasswordResetForm />
    </AuthWrapperOne>
  );
}
