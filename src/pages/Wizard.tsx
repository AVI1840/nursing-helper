import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useNursingStore } from '@/store/useNursingStore';
import StepIndicator from '@/components/StepIndicator';
import WizardStepOne from '@/components/wizard/WizardStepOne';
import WizardStepTwo from '@/components/wizard/WizardStepTwo';
import WizardStepThree from '@/components/wizard/WizardStepThree';
import WizardStepFour from '@/components/wizard/WizardStepFour';
import { Heart, Clock, Lightbulb } from 'lucide-react';

// Score thresholds for level progression
const SCORE_THRESHOLDS = [3.5, 4.5, 6.5, 7.5, 8.5, 9.5];

const Wizard = () => {
  const [searchParams] = useSearchParams();
  const { 
    currentStep, 
    initFromParams, 
    name, 
    level,
    age,
    eligibilityType,
    dependencyScore
  } = useNursingStore();

  useEffect(() => {
    const urlName = searchParams.get('name');
    const urlLevel = searchParams.get('level');
    const urlFw = searchParams.get('fw');
    const urlAge = searchParams.get('age');
    const urlType = searchParams.get('type');
    const urlScore = searchParams.get('score');

    if (urlName && urlLevel) {
      const levelNum = parseInt(urlLevel, 10);
      const hasFw = urlFw === 'true';
      const ageNum = urlAge ? parseInt(urlAge, 10) : undefined;
      const eligType = urlType === 'temp' ? 'temporary' : urlType === 'perm' ? 'permanent' : undefined;
      const scoreNum = urlScore ? parseFloat(urlScore) : undefined;
      
      if (levelNum >= 1 && levelNum <= 6) {
        initFromParams(urlName, levelNum, hasFw, ageNum, eligType, scoreNum);
      }
    }
  }, [searchParams, initFromParams]);

  // Calculate if user is close to next level threshold
  const getNextLevelTip = () => {
    if (dependencyScore === null) return null;
    
    for (const threshold of SCORE_THRESHOLDS) {
      const distance = threshold - dependencyScore;
      if (distance > 0 && distance <= 0.5) {
        return `💡 אתה נמצא במרחק נגיעה (${distance.toFixed(1)} נק') מהרמה הבאה.`;
      }
    }
    return null;
  };

  const nextLevelTip = getNextLevelTip();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WizardStepOne />;
      case 2:
        return <WizardStepTwo />;
      case 3:
        return <WizardStepThree />;
      case 4:
        return <WizardStepFour />;
      default:
        return <WizardStepOne />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-6 px-4 border-b border-border bg-card">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-hero)' }}
            >
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">סיעוד 360</h1>
              <p className="text-sm text-muted-foreground">מדריך הזכויות המלא</p>
            </div>
          </motion.div>
          
          {/* NEW: Enhanced Header with Professional Status */}
          {name && level && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex flex-col items-end gap-1"
            >
              {/* Main Line: Name | Age | Level */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">
                  שלום {name}
                </span>
                {age && (
                  <>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-muted-foreground">בן {age}</span>
                  </>
                )}
                <span className="text-muted-foreground">|</span>
                <span className="text-muted-foreground">רמה {level}</span>
              </div>
              
              {/* Sub Line: Score | Eligibility Type */}
              {(dependencyScore !== null || eligibilityType) && (
                <div className="flex items-center gap-2 text-xs">
                  {dependencyScore !== null && (
                    <span className="text-muted-foreground">
                      ניקוד תלות: {dependencyScore.toFixed(1)}
                    </span>
                  )}
                  {dependencyScore !== null && eligibilityType && (
                    <span className="text-muted-foreground">|</span>
                  )}
                  {eligibilityType && (
                    <span className="flex items-center gap-1">
                      <span className="text-muted-foreground">
                        סוג זכאות: {eligibilityType === 'permanent' ? 'לצמיתות' : 'זמנית'}
                      </span>
                      {eligibilityType === 'temporary' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          מוגבל בזמן
                        </span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
        
        {/* Next Level Tip */}
        {nextLevelTip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-5xl mx-auto mt-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <Lightbulb className="w-4 h-4 flex-shrink-0" />
              <span>{nextLevelTip}</span>
            </div>
          </motion.div>
        )}
      </header>

      {/* Step Indicator */}
      <div className="py-6 px-4 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <StepIndicator />
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border bg-card mt-auto">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 סיעוד 360 - כל הזכויות שמורות
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            המידע באתר מיועד להדרכה בלבד ואינו מהווה תחליף לייעוץ מקצועי
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Wizard;