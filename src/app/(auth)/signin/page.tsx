import Image from 'next/image';
import SignInForm from './sign-in-form';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import UnderlineShape from '@core/components/shape/underline';
import { metaObject } from '@/config/site.config';
import signinImg from '@public/sign-in.webp';

export const metadata = {
  ...metaObject('Login 1'),
};

export default function SignIn() {
  return (
    <AuthWrapperOne
      title={
        <>
          Bem-vindo de volta! Por favor, faça{' '}
          <span className="relative inline-block">
            login
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-blue md:w-28 xl:-bottom-1.5 xl:w-28" />
          </span>{' '}
          para continuar.
        </>
      }
      description="Digite seu e-mail e senha para acessar sua conta e aproveitar todos os recursos exclusivos da plataforma Dobank."
      // bannerTitle="A forma mais simples de gerenciar seus pagamentos."
      // bannerDescription="Soluções práticas e seguras para facilitar sua rotina financeira e impulsionar seus resultados."
      isSocialLoginActive={true}
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px]">
          <Image
            src={signinImg}
            alt="Sign In Thumbnail"
            width={signinImg.width}
            height={signinImg.height}
            className="block mx-auto object-contain"
            priority
            sizes="(max-width: 768px) 100vw"
          />
        </div>
      }
    >
      <SignInForm />
    </AuthWrapperOne>
  );
}
