'use client';

import dynamic from 'next/dynamic';
import { SessionProvider } from 'next-auth/react';
import { atomWithStorage, atomWithReset, useResetAtom } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// 1) Tipo e estado do formulário
export type FormDataType = {
  amount: string;
  description: string;
  clientName: string;
  clientEmail: string;
};

export const initialChargeData: FormDataType = {
  amount: '',
  description: '',
  clientName: '',
  clientEmail: '',
};

export const formDataAtom = atomWithStorage<FormDataType>(
  'chargeStepFormStore',
  initialChargeData
);

// 2) Enum de passos e estado do stepper
export enum Step {
  StepOne = 0,
  StepTwo = 1,
  StepThree = 2,
}
const firstStep = Step.StepOne;

export const stepperAtomCharge = atomWithReset<Step>(firstStep);

export function useStepperCharge() {
  const [step, setStep] = useAtom(stepperAtomCharge);
  function gotoNextStep() {
    setStep(prev => prev + 1);
  }
  function gotoPrevStep() {
    setStep(prev => (prev > firstStep ? prev - 1 : prev));
  }
  function resetStepper() {
    setStep(firstStep);
  }
  return { step, setStep, resetStepper, gotoNextStep, gotoPrevStep };
}

// 3) Atomos para guardar as respostas da API
export const depositResponseAtom = atomWithReset<{
  trx: string;
  amount: number;
  charge: number;
  payable: number;
} | null>(null);

export const confirmResponseAtom = atomWithReset<{
  error: boolean;
  message?: string;
  trx: string;
  original_value: number;
  image_base64: string;
  copy_code: string;
} | null>(null);

// 4) Import dinâmico dos componentes de cada step
const ChargeStepOne = dynamic(() => import('./step-one'), { ssr: false });
const ChargeStepTwo = dynamic(() => import('./step-two'), { ssr: false });
const ChargeStepThree = dynamic(() => import('./step-three'), { ssr: false });

const MAP_STEP_TO_COMPONENT = {
  [Step.StepOne]: ChargeStepOne,
  [Step.StepTwo]: ChargeStepTwo,
  [Step.StepThree]: ChargeStepThree,
};

export default function CreateChargeForm() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [step] = useAtom(stepperAtomCharge);
  const [, setFormData] = useAtom(formDataAtom);
  const resetStep = useResetAtom(stepperAtomCharge);
  const [, resetDeposit] = useAtom(depositResponseAtom);
  const [, resetConfirm] = useAtom(confirmResponseAtom);

  useEffect(() => {
    // resetar quando modal fecha ou rota muda
    resetStep();
    setFormData(initialChargeData);
    resetDeposit();
    resetConfirm();
  }, [pathname, searchParams, resetStep, setFormData, resetDeposit, resetConfirm]);

  const Component = MAP_STEP_TO_COMPONENT[step];

  return (
    <SessionProvider>
      <div className="relative flex justify-center md:items-center">
        <div className="w-full max-w-lg">
          <Component />
        </div>
      </div>
    </SessionProvider>
  );
}