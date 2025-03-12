import { StepperStep } from "@/lib/types";

interface ConfigurationStepperProps {
  steps: StepperStep[];
  activeStep: number;
  onStepClick: (step: number) => void;
}

export default function ConfigurationStepper({
  steps,
  activeStep,
  onStepClick
}: ConfigurationStepperProps) {
  return (
    <div className="border-b border-[#E2E8F0]">
      <nav className="flex">
        {steps.map((step) => (
          <button
            key={step.id}
            className={`px-6 py-4 font-medium flex items-center ${
              step.id === activeStep
                ? "text-primary border-b-2 border-primary"
                : "text-[#718096]"
            }`}
            onClick={() => onStepClick(step.id)}
          >
            <span
              className={`${
                step.status === "active" || step.status === "complete"
                  ? "bg-primary text-white"
                  : "bg-[#E2E8F0] text-[#718096]"
              } rounded-full w-6 h-6 inline-flex items-center justify-center mr-2`}
            >
              {step.id}
            </span>
            {step.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
