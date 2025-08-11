// src/app/(auth)/password/alterar/page.tsx
import Image from 'next/image';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import UnderlineShape from '@core/components/shape/underline';
import { metaObject } from '@/config/site.config';
import passwordImg from '@public/sign-in.webp';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata = {
  ...metaObject('Redefinir Senha'),
};

// ✅ searchParams é Promise; a página é async
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};

  // pegue o primeiro valor se vier array
  const emailRaw = Array.isArray(sp.email) ? sp.email[0] : sp.email;
  const codeRaw = Array.isArray(sp.code) ? sp.code[0] : sp.code;

  // normalmente o Next já entrega decodificado; se quiser manter:
  const email = typeof emailRaw === 'string' ? decodeURIComponent(emailRaw) : '';
  const code = typeof codeRaw === 'string' ? decodeURIComponent(codeRaw) : '';

  return (
    <AuthWrapperOne
      title={
        <>
          Escolha{' '}
          <span className="relative inline-block">
            sua nova senha
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-blue" />
          </span>
        </>
      }
      description="Defina uma senha forte para acessar sua conta"
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
      <ResetPasswordForm emailFromQuery={email} codeFromQuery={code} />
    </AuthWrapperOne>
  );
}
