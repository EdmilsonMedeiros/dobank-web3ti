// src/app/(auth)/register/senha/page.tsx
import Image from 'next/image';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import UnderlineShape from '@core/components/shape/underline';
import { metaObject } from '@/config/site.config';
import senhaImg from '@public/sign-in.webp';
import SenhaForm from './SenhaForm';

export const metadata = {
  ...metaObject('Senha'),
};

export default function SenhaPage({ searchParams }: any) {
  // Desestruturamos searchParams como any para compatibilidade com PageProps
  const preCadastroId = Number(searchParams?.preCadastroId || 0);

  return (
    <AuthWrapperOne
      title={
        <>
          Escolha uma{' '}
          <span className="relative inline-block">
            senha
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-blue" />
          </span>
        </>
      }
      description="Sua senha precisa ter acima de 6 caracteres, com números, letras MAIÚSCULAS, minúsculas e caracteres especiais."
      isSocialLoginActive={false}
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px]">
          <Image
            src={senhaImg}
            alt="Senha illustration"
            width={senhaImg.width}
            height={senhaImg.height}
            className="block mx-auto object-contain"
            priority
            sizes="(max-width: 768px) 100vw"
          />
        </div>
      }
    >
      <SenhaForm preCadastroId={preCadastroId} />
    </AuthWrapperOne>
  );
}
