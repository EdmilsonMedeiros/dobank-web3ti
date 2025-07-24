import Image from 'next/image';
import UnderlineShape from '@core/components/shape/underline';
import SignUpForm from './sign-up-form';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import { metaObject } from '@/config/site.config';
import signinImg from '@public/sign-in.webp';

export const metadata = {
  ...metaObject('Sign Up 1'),
};

export default function SignUp() {
  return (
    <AuthWrapperOne
      title={
        <>
          Informe os dados {' '}
          {/* <span className="relative inline-block">
            CADASTRE-SE!
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-28 text-blue xl:-bottom-1.5 xl:w-36" />
          </span> */}
        </>
      }
      description="Durante o cadastro iremos pedir alguns dados importantes"
      description2="Sua conta passará por uma análise antes de ser aprovada, você será informado por e-mail."
      // bannerTitle="The simplest way to manage your workspace."
      // bannerDescription="Amet minim mollit non deserunt ullamco est sit aliqua dolor do
      // amet sint velit officia consequat duis."
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
      <SignUpForm />
    </AuthWrapperOne>
  );
}
