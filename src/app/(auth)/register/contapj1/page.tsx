// src/app/(auth)/register/contapj1/page.tsx
import Image from 'next/image';
import Contapj1Loader from './Contapj1Loader';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import UnderlineShape from '@core/components/shape/underline';
import { metaObject } from '@/config/site.config';
import signupImg from '@public/sign-in.webp';

export const metadata = {
  ...metaObject('Sign Up 1'),
};

export default function Contapj1Page() {
  return (
    <AuthWrapperOne
      title={
        <>
          Informe os dados{' '}
          <span className="relative inline-block">
            necessários
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-blue" />
          </span>
        </>
      }
      description="Durante o cadastro iremos pedir alguns dados importantes"
      description2="Sua conta passará por uma análise antes de ser aprovada, você será informado por e-mail."
      isSocialLoginActive={true}
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px]">
          <Image
            src={signupImg}
            alt="Cadastro illustration"
            width={signupImg.width}
            height={signupImg.height}
            className="block mx-auto object-contain"
            priority
            sizes="(max-width: 768px) 100vw"
          />
        </div>
      }
    >
      <Contapj1Loader />
    </AuthWrapperOne>
  );
}
