// /src/app/shared/charge/charge-form/index.tsx
'use client';

import dynamic from 'next/dynamic';
import { atomWithStorage, atomWithReset, useResetAtom } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type FormDataType = {
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

enum Step {
  StepOne,
  StepTwo,
}

const firstStep = Step.StepOne;
export const stepperAtomCharge = atomWithReset<Step>(firstStep);

export function useStepperCharge() {
  const [step, setStep] = useAtom(stepperAtomCharge);
  function gotoNextStep() {
    setStep((prev) => prev + 1);
  }
  function gotoPrevStep() {
    setStep((prev) => (prev > firstStep ? prev - 1 : prev));
  }
  function resetStepper() {
    setStep(firstStep);
  }
  return {
    step,
    setStep,
    resetStepper,
    gotoNextStep,
    gotoPrevStep,
  };
}

const ChargeStepOne = dynamic(() => import('./step-one'), { ssr: false });
const ChargeStepTwo = dynamic(() => import('./step-two'), { ssr: false });

const MAP_STEP_TO_COMPONENT = {
  [Step.StepOne]: ChargeStepOne,
  [Step.StepTwo]: ChargeStepTwo,
};

export default function CreateChargeForm() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [step] = useAtom(stepperAtomCharge);
  const [, setFormData] = useAtom(formDataAtom);
  const resetStepAtom = useResetAtom(stepperAtomCharge);

  useEffect(() => {
    // sempre que trocar de rota (ou o modal for fechado), resetamos
    resetStepAtom();
    setFormData(initialChargeData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  const Component = MAP_STEP_TO_COMPONENT[step];

  return (
    <div className="relative flex justify-center md:items-center">
      <div className="w-full max-w-lg">
        <Component />
      </div>
    </div>
  );
}
