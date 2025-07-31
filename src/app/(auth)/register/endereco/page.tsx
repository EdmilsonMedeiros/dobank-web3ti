// src/app/(auth)/register/endereco/page.tsx
import Image from 'next/image';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import UnderlineShape from '@core/components/shape/underline';
import { metaObject } from '@/config/site.config';
import enderecoImg from '@public/sign-in.webp';
import EnderecoForm from './EnderecoForm';

export const metadata = {
  ...metaObject('Endereço'),
};

export default function EnderecoPage({ searchParams }: any) {
  const preCadastroId = Number(searchParams?.preCadastroId || 0);

  return (
    <AuthWrapperOne
      title={
        <>
          Informe seu{' '}
          <span className="relative inline-block">
            endereço
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-blue" />
          </span>
        </>
      }
      description="Preencha seu endereço para prosseguir no cadastro"
      isSocialLoginActive={false}
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px]">
          <Image
            src={enderecoImg}
            alt="Endereço illustration"
            width={enderecoImg.width}
            height={enderecoImg.height}
            className="block mx-auto object-contain"
            priority
            sizes="(max-width: 768px) 100vw"
          />
        </div>
      }
    >
      <EnderecoForm preCadastroId={preCadastroId} />
    </AuthWrapperOne>
  );
}
