import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNursingStore } from '@/store/useNursingStore';
import { Search, CheckCircle2, Sparkles } from 'lucide-react';

const steps = [
  { text: 'שומר את העדפות הסל שלך...', icon: '💾', delay: 0 },
  { text: 'מתחבר למשרדי ממשלה...', icon: '🏛️', delay: 1500 },
  { text: 'סורק זכויות ברשויות נוספות...', icon: '🔍', delay: 3000 },
  { text: 'נמצאו זכויות נוספות!', icon: '✨', delay: 4500 },
];

const WizardStepThree = () => {
  const { nextStep } = useNursingStore();
  const nextStepRef = useRef(nextStep);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Keep ref up to date without re-triggering the effect
  useEffect(() => {
    nextStepRef.current = nextStep;
  }, [nextStep]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((step, index) => {
      const timer = setTimeout(() => {
        setCurrentPhase(index);
        if (index === steps.length - 1) {
          const t1 = setTimeout(() => {
            setCompleted(true);
            const t2 = setTimeout(() => {
              nextStepRef.current();
            }, 1000);
            timers.push(t2);
          }, 1000);
          timers.push(t1);
        }
      }, step.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[60vh] flex flex-col items-center justify-center max-w-2xl mx-auto text-center"
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative mb-12"
      >
        <div 
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{ background: 'var(--gradient-hero)' }}
        >
          {completed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <CheckCircle2 className="w-16 h-16 text-white" />
            </motion.div>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Search className="w-16 h-16 text-white" />
            </motion.div>
          )}
        </div>
        
        {/* Ripple Effect */}
        {!completed && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary/30"
              animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary/20"
              animate={{ scale: [1, 1.8, 2.5], opacity: [0.4, 0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </>
        )}
      </motion.div>

      {/* Progress Steps */}
      <div className="space-y-4 mb-8 w-full max-w-md">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: index <= currentPhase ? 1 : 0.3,
              x: 0 
            }}
            transition={{ delay: step.delay / 1000, duration: 0.3 }}
            className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
              index === currentPhase 
                ? 'bg-primary/10 border border-primary/20' 
                : index < currentPhase 
                  ? 'bg-emerald-50 border border-emerald-200' 
                  : 'bg-muted/30'
            }`}
          >
            <span className="text-2xl">{step.icon}</span>
            <span className={`font-medium ${
              index === currentPhase ? 'text-primary' : 
              index < currentPhase ? 'text-emerald-700' : 'text-muted-foreground'
            }`}>
              {step.text}
            </span>
            {index < currentPhase && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-auto" />
            )}
            {index === currentPhase && !completed && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-primary mr-auto"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-emerald-600" />
              <div className="text-right">
                <p className="font-bold text-xl text-emerald-800">מעולה!</p>
                <p className="text-emerald-700">מעביר אותך לרשימת הזכויות שלך...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WizardStepThree;
