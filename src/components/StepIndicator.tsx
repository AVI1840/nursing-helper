import { motion } from 'framer-motion';
import { useNursingStore } from '@/store/useNursingStore';
import { Check } from 'lucide-react';

const StepIndicator = () => {
  const { currentStep } = useNursingStore();

  const steps = [
    { number: 1, label: 'פרטים בסיסיים' },
    { number: 2, label: 'תכנון הסל' },
    { number: 3, label: 'סריקה' },
    { number: 4, label: 'זכויות נוספות' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={`step-indicator ${
                  isCompleted ? 'completed' : isActive ? 'active' : 'pending'
                }`}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </motion.div>
              <span className={`text-xs mt-1 hidden md:block ${
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="w-8 md:w-16 h-0.5 mx-1 md:mx-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: currentStep > step.number 
                      ? 'hsl(var(--success))' 
                      : 'hsl(var(--border))'
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.2 * index }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
