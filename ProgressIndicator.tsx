import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, title: "Upload Documents", subtitle: "Step 1" },
    { number: 2, title: "Extract Information", subtitle: "Step 2" },
    { number: 3, title: "Generate Document", subtitle: "Step 3" },
  ];

  return (
    <div className="mb-8" data-testid="progress-indicator">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          
          return (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isCompleted
                      ? "bg-legal-blue text-white"
                      : isActive
                      ? "bg-legal-blue text-white"
                      : "bg-gray-300 text-gray-600"
                  )}
                  data-testid={`progress-step-${step.number}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm">{step.number}</span>
                  )}
                </div>
                <div className="ml-4">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCompleted || isActive ? "text-legal-blue" : "text-gray-400"
                    )}
                  >
                    {step.subtitle}
                  </p>
                  <p
                    className={cn(
                      "text-sm",
                      isCompleted || isActive ? "text-gray-900" : "text-gray-400"
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-300 mx-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
