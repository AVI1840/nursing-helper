import { motion } from 'framer-motion';
import { useNursingStore } from '@/store/useNursingStore';
import { 
  ANCILLARY_RIGHTS, 
  RATES,
  getTotalHours,
  getCashValuePerHour,
  getDaycareRate,
  AncillaryRight
} from '@/data/nursingData';
import RightCard from '@/components/ui/RightCard';
import { ArrowRight, Sparkles, Clock, Banknote, Gift, RefreshCw, AlertTriangle, Award } from 'lucide-react';

// Golden Card for 80+ age exemption
const GOLDEN_CARD_80_PLUS: AncillaryRight = {
  id: 'queue_exemption_80',
  title: 'פטור מתור (80+)',
  description: 'זכאות אוטומטית לפטור מתור במשרדי ממשלה ומרכולים. אין צורך בתעודה.',
  value: 'ללא עלות',
  min_level: 1,
  requires_survivor: false,
  requires_foreign_worker: false,
  action: 'זכות זו ניתנת באופן אוטומטי לכל אזרח מעל גיל 80. ניתן להציג תעודת זהות במידת הצורך.',
  icon: 'Award'
};

const WizardStepFour = () => {
  const { 
    name,
    level, 
    hasForeignWorker, 
    isSurvivor,
    age,
    eligibilityType,
    allocation,
    prevStep,
    reset
  } = useNursingStore();

  if (!level) return null;

  // Calculate final allocation summary
  const totalHours = getTotalHours(level, hasForeignWorker);
  const cashValuePerHour = getCashValuePerHour(level);
  const daycareRate = getDaycareRate(level);
  
  const cashHoursDeduction = allocation.cashHours;
  const daycareDeduction = allocation.daycareDays * daycareRate;
  const communityDeduction = allocation.community ? RATES.community : 0;
  const panicDeduction = allocation.panicButton ? RATES.panic_button : 0;
  const absorbencyDeduction = allocation.absorbency ? RATES.absorbency : 0;
  
  const totalDeductions = cashHoursDeduction + daycareDeduction + communityDeduction + panicDeduction + absorbencyDeduction;
  const remainingHours = Math.max(0, totalHours - totalDeductions);
  const totalCash = Math.round(allocation.cashHours * cashValuePerHour);

  // Check if temporary eligibility
  const isTemporary = eligibilityType === 'temporary';

  // Filter eligible rights based on user conditions
  let eligibleRights = ANCILLARY_RIGHTS.filter(right => {
    // Check minimum level
    if (level < right.min_level) return false;
    
    // Check survivor requirement
    if (right.requires_survivor && !isSurvivor) return false;
    
    // Check foreign worker requirement
    if (right.requires_foreign_worker && !hasForeignWorker) return false;
    
    return true;
  });

  // Add 80+ Golden Card if age >= 80
  const showGoldenCard = age !== null && age >= 80;

  // Calculate estimated annual value
  const estimatedAnnualValue = eligibleRights.reduce((sum, right) => {
    const match = right.value.match(/[\d,]+/);
    if (match) {
      return sum + parseInt(match[0].replace(',', ''), 10);
    }
    return sum;
  }, 0);

  // Rights that need temporary warning (Arnona and Electricity)
  const temporaryWarningIds = ['arnona', 'electricity'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-medium mb-6"
        >
          <Sparkles className="w-5 h-5" />
          <span>הסיכום שלך</span>
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
          {name ? `${name}, ` : ''}נמצאו לך זכויות נוספות! 🎉
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          בנוסף לגמלת הסיעוד, מצאנו עבורך זכויות נוספות בשווי אלפי שקלים
        </p>
      </div>

      {/* Allocation Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-primary/5 border border-primary/20 mb-10"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span>
          סיכום סל הסיעוד שלך
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">שעות למטפל אישי</p>
              <p className="text-2xl font-bold text-gradient">{remainingHours.toFixed(1)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-money)' }}>
              <Banknote className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">תשלום חודשי</p>
              <p className="text-2xl font-bold text-gradient-money">{totalCash.toLocaleString()} ₪</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">שווי זכויות נוספות</p>
              <p className="text-2xl font-bold text-emerald-600">~{estimatedAnnualValue.toLocaleString()} ₪/שנה</p>
            </div>
          </div>
        </div>

        {/* Services Summary */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">שירותים שנבחרו:</p>
          <div className="flex flex-wrap gap-2">
            {allocation.daycareDays > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                מרכז יום ({allocation.daycareDays} ימים)
              </span>
            )}
            {allocation.community && (
              <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                קהילה תומכת
              </span>
            )}
            {allocation.panicButton && (
              <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                לחצן מצוקה
              </span>
            )}
            {allocation.absorbency && (
              <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                מוצרי ספיגה
              </span>
            )}
            {allocation.cashHours > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                המרה לכסף ({allocation.cashHours} שעות)
              </span>
            )}
            {!allocation.daycareDays && !allocation.community && !allocation.panicButton && !allocation.absorbency && allocation.cashHours === 0 && (
              <span className="text-muted-foreground">לא נבחרו שירותים נוספים</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* 80+ Golden Card - Special placement at top */}
      {showGoldenCard && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 dark:from-amber-950/30 dark:to-yellow-950/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300">
                  {GOLDEN_CARD_80_PLUS.title}
                </h3>
                <p className="text-amber-700 dark:text-amber-400">{GOLDEN_CARD_80_PLUS.description}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/60 dark:bg-black/20 border border-amber-200 dark:border-amber-700">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>איך לממש:</strong> {GOLDEN_CARD_80_PLUS.action}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rights Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          זכויות נוספות שמגיעות לך
          <span className="text-lg font-normal text-muted-foreground mr-2">
            ({eligibleRights.length + (showGoldenCard ? 1 : 0)} זכויות)
          </span>
        </h2>
      </motion.div>

      {/* Rights Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-10">
        {eligibleRights.map((right, index) => (
          <motion.div
            key={right.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="relative"
          >
            {/* Temporary Eligibility Warning for Arnona/Electricity */}
            {isTemporary && temporaryWarningIds.includes(right.id) && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-700 text-xs font-medium shadow-sm">
                  <AlertTriangle className="w-3 h-3" />
                  <span>זמנית</span>
                </div>
              </div>
            )}
            <RightCard right={right} />
            
            {/* Temporary warning text overlay */}
            {isTemporary && temporaryWarningIds.includes(right.id) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-700"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    שים לב: ההנחה ניתנת לתקופה זמנית. יש לחדש אותה בתום התקופה.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* No Rights Message (if applicable) */}
      {eligibleRights.length === 0 && !showGoldenCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12 bg-muted/30 rounded-2xl mb-10"
        >
          <p className="text-muted-foreground">
            לא נמצאו זכויות נוספות המתאימות לפרופיל שלך כרגע.
          </p>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={prevStep}
          className="btn-accessible secondary gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          <span>חזרה לעריכה</span>
        </button>
        <button
          onClick={reset}
          className="btn-accessible primary gap-3"
        >
          <RefreshCw className="w-5 h-5" />
          <span>התחל מחדש</span>
        </button>
      </div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-sm text-muted-foreground mt-8"
      >
        * הסכומים המוצגים הם הערכה בלבד. יש לפנות לגורמים הרלוונטיים לאישור סופי.
      </motion.p>
    </motion.div>
  );
};

export default WizardStepFour;