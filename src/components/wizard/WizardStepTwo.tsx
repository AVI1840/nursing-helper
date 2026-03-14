import { motion } from 'framer-motion';
import { useNursingStore } from '@/store/useNursingStore';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Banknote, 
  Building2, 
  Bell, 
  Package, 
  Users, 
  Home, 
  AlertTriangle,
  Info,
  Plus,
  Minus
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Level hours budget
const LEVEL_HOURS: Record<number, number> = {
  1: 5.5,
  2: 10,
  3: 17,
  4: 21,
  5: 26,
  6: 30,
};

// Day center rate per day based on level
const getDayCenterRate = (level: number): number => {
  return level <= 3 ? 2.0 : 2.75;
};

// Cash cap: Level 1 = 100%, Levels 2-6 = 33% (floor)
const getCashCap = (level: number, totalHours: number): number => {
  if (level === 1) return totalHours;
  return Math.floor(totalHours / 3);
};

// Extras costs
const EXTRAS = {
  community: 0.5,
  absorbency: 0.5,
  panicButton: 0.25,
};

// Stepper Button Component
interface StepperButtonProps {
  onClick: () => void;
  disabled: boolean;
  variant: 'plus' | 'minus';
  colorClass?: string;
}

const StepperButton = ({ onClick, disabled, variant, colorClass = 'bg-secondary hover:bg-secondary/80' }: StepperButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "w-16 h-16 min-w-[60px] min-h-[60px] rounded-xl flex items-center justify-center transition-all",
      "text-2xl font-bold disabled:opacity-40 disabled:cursor-not-allowed",
      "active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50",
      colorClass
    )}
    aria-label={variant === 'plus' ? 'הוסף' : 'הפחת'}
  >
    {variant === 'plus' ? <Plus className="w-7 h-7" /> : <Minus className="w-7 h-7" />}
  </button>
);

const WizardStepTwo = () => {
  const { 
    level, 
    allocation, 
    setAllocation,
    nextStep,
    prevStep 
  } = useNursingStore();

  if (!level) return null;

  const totalHours = LEVEL_HOURS[level] || 21;
  const dayCenterRate = getDayCenterRate(level);
  const cashCap = getCashCap(level, totalHours);

  // Zero-based state: user must actively allocate everything
  const [dayCenterDays, setDayCenterDays] = useState(allocation.daycareDays || 0);
  const [cashHours, setCashHours] = useState(allocation.cashHours || 0);
  const [caregiverHours, setCaregiverHours] = useState(0);
  const [community, setCommunity] = useState(allocation.community || false);
  const [absorbency, setAbsorbency] = useState(allocation.absorbency || false);
  const [panicButton, setPanicButton] = useState(allocation.panicButton || false);

  // Calculate extras cost
  const extrasCost = useMemo(() => {
    let cost = 0;
    if (community) cost += EXTRAS.community;
    if (absorbency) cost += EXTRAS.absorbency;
    if (panicButton && !community) cost += EXTRAS.panicButton;
    return cost;
  }, [community, absorbency, panicButton]);

  // Calculate used and remaining hours
  const dayCenterCost = dayCenterDays * dayCenterRate;
  const usedHours = dayCenterCost + cashHours + caregiverHours + extrasCost;
  const remainingHours = Math.max(0, totalHours - usedHours);

  // Check if any increase is possible
  const canIncrease = remainingHours > 0;

  // Bar segment percentages
  const dayCenterPercent = (dayCenterCost / totalHours) * 100;
  const caregiverPercent = (caregiverHours / totalHours) * 100;
  const cashPercent = (cashHours / totalHours) * 100;
  const extrasPercent = (extrasCost / totalHours) * 100;

  // Handle day center change
  const handleDayCenterIncrement = () => {
    if (dayCenterDays < 5 && remainingHours >= dayCenterRate) {
      setDayCenterDays(prev => prev + 1);
    }
  };

  const handleDayCenterDecrement = () => {
    if (dayCenterDays > 0) {
      setDayCenterDays(prev => prev - 1);
    }
  };

  // Handle caregiver change (0.5 hour steps)
  const handleCaregiverIncrement = () => {
    if (remainingHours >= 0.5) {
      setCaregiverHours(prev => prev + 0.5);
    }
  };

  const handleCaregiverDecrement = () => {
    if (caregiverHours >= 0.5) {
      setCaregiverHours(prev => prev - 0.5);
    }
  };

  // Handle cash change with HARD cap enforcement (0.5 hour steps)
  const handleCashIncrement = () => {
    if (cashHours < cashCap && remainingHours >= 0.5) {
      setCashHours(prev => Math.min(cashCap, prev + 0.5));
    }
  };

  const handleCashDecrement = () => {
    if (cashHours >= 0.5) {
      setCashHours(prev => prev - 0.5);
    }
  };

  // Handle extras toggle with budget validation
  const handleExtraToggle = (extra: 'community' | 'absorbency' | 'panicButton', checked: boolean) => {
    const cost = extra === 'panicButton' && community ? 0 : EXTRAS[extra];
    
    if (checked && cost > remainingHours) {
      return; // Can't enable if not enough budget
    }

    switch (extra) {
      case 'community':
        setCommunity(checked);
        if (checked) setPanicButton(false); // Disable panic button when community is checked
        break;
      case 'absorbency':
        setAbsorbency(checked);
        break;
      case 'panicButton':
        if (!community) setPanicButton(checked);
        break;
    }
  };

  // Save allocation and continue
  const handleContinue = () => {
    setAllocation({
      cashHours,
      daycareDays: dayCenterDays,
      community,
      panicButton: panicButton || community,
      absorbency,
    });
    nextStep();
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto px-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl md:text-4xl font-extrabold text-foreground mb-2"
          >
            תכנון סל הסיעוד (רמה {level})
          </motion.h1>
          <p className="text-lg text-muted-foreground">
            סה״כ {totalHours} שעות שבועיות לחלוקה
          </p>
        </div>

        {/* Visual Equalizer Bar - ZERO-BASED (Starts 100% Gray) */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card border border-border mb-8"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-lg">הקצאת התקציב</span>
            <span className={remainingHours > 0.5 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'}>
              {remainingHours > 0.5 ? `נותרו ${remainingHours.toFixed(1)} שעות` : 'תקציב מוקצה במלואו ✓'}
            </span>
          </div>
          
          {/* Stacked Bar - Starts Gray (Empty) */}
          <div className="h-14 rounded-xl overflow-hidden flex bg-gray-200 dark:bg-gray-700 relative">
            {/* Day Center - Green */}
            {dayCenterPercent > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dayCenterPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center min-w-0"
              >
                {dayCenterPercent > 10 && (
                  <span className="text-white text-sm font-bold truncate px-2">
                    🏛️ {dayCenterCost.toFixed(1)}
                  </span>
                )}
              </motion.div>
            )}
            
            {/* Caregiver - Blue */}
            {caregiverPercent > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${caregiverPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center min-w-0"
              >
                {caregiverPercent > 10 && (
                  <span className="text-white text-sm font-bold truncate px-2">
                    🏠 {caregiverHours.toFixed(1)}
                  </span>
                )}
              </motion.div>
            )}
            
            {/* Cash - Orange */}
            {cashPercent > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cashPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center min-w-0"
              >
                {cashPercent > 10 && (
                  <span className="text-white text-sm font-bold truncate px-2">
                    💰 {cashHours.toFixed(1)}
                  </span>
                )}
              </motion.div>
            )}
            
            {/* Extras - Purple */}
            {extrasPercent > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${extrasPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center min-w-0"
              >
                {extrasPercent > 4 && (
                  <span className="text-white text-xs font-bold truncate px-1">
                    ⭐
                  </span>
                )}
              </motion.div>
            )}
            
            {/* Unallocated - stays gray (the remaining part) */}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span>מרכז יום</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span>מטפלת בבית</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span>כסף</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500" />
              <span>שירותים נוספים</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600" />
              <span className="text-muted-foreground">לא מנוצל</span>
            </div>
          </div>

          {/* Warning if unallocated */}
          {remainingHours > 0.5 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                נותרו תקציב לא מנוצל: {remainingHours.toFixed(1)} שעות
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* 3-Card Control Deck - CSS Grid Layout (FIXED) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
          
          {/* CARD 1: מרכז יום (Day Center) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-card border-2 border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20 min-h-[350px] h-auto flex flex-col justify-between"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg break-words">מרכז יום</h3>
                  <p className="text-sm text-muted-foreground break-words">ניכוי {dayCenterRate} שעות/יום</p>
                </div>
              </div>

              {/* Sub-text with exact copy */}
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-200 dark:border-emerald-700">
                <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed break-words">
                  יחידה אחת (כ-{dayCenterRate} שעות) = יום מלא (כ-7 שעות) כולל הסעה, חוגים, ארוחת בוקר וצהריים.
                </p>
              </div>
            </div>
            
            {/* Days Stepper */}
            <div className="flex flex-col justify-center mt-auto">
              <div className="flex items-center justify-center gap-4">
                <StepperButton
                  onClick={handleDayCenterDecrement}
                  disabled={dayCenterDays === 0}
                  variant="minus"
                  colorClass="bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300"
                />
                <div className="text-center min-w-[80px]">
                  <motion.span 
                    key={dayCenterDays}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-bold text-emerald-600"
                  >
                    {dayCenterDays}
                  </motion.span>
                  <p className="text-sm text-muted-foreground mt-1">ימים</p>
                </div>
                <StepperButton
                  onClick={handleDayCenterIncrement}
                  disabled={dayCenterDays >= 5 || !canIncrease || remainingHours < dayCenterRate}
                  variant="plus"
                  colorClass="bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:hover:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300"
                />
              </div>
              
              <p className="text-center text-sm text-muted-foreground font-medium mt-4 break-words">
                {dayCenterDays > 0 
                  ? `${dayCenterCost.toFixed(1)} שעות מנוכות` 
                  : 'ללא מרכז יום'}
              </p>
            </div>
          </motion.div>

          {/* CARD 2: מטפלת אישית בבית (Home Care) - STEPPER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl border-2 border-primary/30 bg-primary/5 min-h-[350px] h-auto flex flex-col justify-between"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--gradient-hero)' }}
                >
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg break-words">מטפלת אישית בבית</h3>
                  <p className="text-sm text-muted-foreground break-words">טיפול אישי וסיעוד</p>
                </div>
              </div>
              
              {/* Active display */}
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2 break-words">שעות שבועיות לטיפול אישי</p>
              </div>
            </div>
            
            {/* Caregiver Stepper */}
            <div className="flex flex-col justify-center mt-auto">
              <div className="flex items-center justify-center gap-4">
                <StepperButton
                  onClick={handleCaregiverDecrement}
                  disabled={caregiverHours === 0}
                  variant="minus"
                  colorClass="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300"
                />
                <div className="text-center min-w-[100px]">
                  <motion.span 
                    key={caregiverHours}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-extrabold text-gradient"
                  >
                    {caregiverHours.toFixed(1)}
                  </motion.span>
                  <p className="text-sm text-muted-foreground mt-1">שעות</p>
                </div>
                <StepperButton
                  onClick={handleCaregiverIncrement}
                  disabled={!canIncrease || remainingHours < 0.5}
                  variant="plus"
                  colorClass="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300"
                />
              </div>
              
              <p className="text-center text-xs text-muted-foreground mt-4 break-words">
                צעד: 0.5 שעות
              </p>
            </div>
          </motion.div>

          {/* CARD 3: קצבה בכסף (Cash) - STEPPER with 33% cap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={cn(
              "p-6 rounded-2xl border-2 min-h-[350px] h-auto flex flex-col justify-between",
              cashHours > 0 
                ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/30' 
                : 'border-amber-200 bg-amber-50/30 dark:bg-amber-950/20'
            )}
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  cashHours > 0 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                    : 'bg-gradient-to-br from-amber-400 to-amber-500'
                )}>
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg break-words">קצבה בכסף</h3>
                  <p className="text-sm text-muted-foreground break-words">ערך מופחת (כ-80%)</p>
                </div>
              </div>
            </div>
            
            {/* Cash Stepper */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center justify-center gap-4">
                <StepperButton
                  onClick={handleCashDecrement}
                  disabled={cashHours === 0}
                  variant="minus"
                  colorClass="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-300"
                />
                <div className="text-center min-w-[100px]">
                  <motion.span 
                    key={cashHours}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-bold text-amber-600"
                  >
                    {cashHours.toFixed(1)}
                  </motion.span>
                  <p className="text-sm text-muted-foreground mt-1">שעות</p>
                </div>
                <StepperButton
                  onClick={handleCashIncrement}
                  disabled={cashHours >= cashCap || !canIncrease || remainingHours < 0.5}
                  variant="plus"
                  colorClass="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-300"
                />
              </div>
              
              <p className="text-center text-xs text-muted-foreground mt-4 break-words">
                מקסימום: {cashCap} שעות {level > 1 && '(⅓ מהתקציב)'}
              </p>
            </div>

            {/* Level 1 message */}
            {level === 1 && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700">
                <p className="text-xs text-emerald-800 dark:text-emerald-300 text-center break-words">
                  ✨ ברמה 1 ניתן להמיר 100% לכסף
                </p>
              </div>
            )}
            
            {/* Levels 2-6 warning */}
            {level > 1 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
                <p className="text-xs text-amber-800 dark:text-amber-300 text-center break-words">
                  ⚠️ שים לב: בהמרה לכסף ערך הגמלה נמוך ב-20%
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Extras Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-card border border-border mb-8"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-500" />
            שירותים נוספים
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* קהילה תומכת */}
            <div 
              className={cn(
                "p-4 rounded-xl border-2 transition-all cursor-pointer",
                community 
                  ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/30' 
                  : 'border-border hover:border-purple-200',
                remainingHours < EXTRAS.community && !community && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => handleExtraToggle('community', !community)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">קהילה תומכת</p>
                    <p className="text-xs text-muted-foreground">-{EXTRAS.community} שעות</p>
                  </div>
                </div>
                <Switch
                  checked={community}
                  onCheckedChange={(checked) => handleExtraToggle('community', checked)}
                  disabled={remainingHours < EXTRAS.community && !community}
                  className="data-[state=checked]:bg-purple-500 flex-shrink-0"
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">כולל: לחצן מצוקה, אב בית, קהילה ופעילות.</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>כולל: לחצן מצוקה, אב בית, קהילה ופעילות.</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* מוצרי ספיגה */}
            <div 
              className={cn(
                "p-4 rounded-xl border-2 transition-all cursor-pointer",
                absorbency 
                  ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/30' 
                  : 'border-border hover:border-purple-200',
                remainingHours < EXTRAS.absorbency && !absorbency && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => handleExtraToggle('absorbency', !absorbency)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">מוצרי ספיגה</p>
                    <p className="text-xs text-muted-foreground">-{EXTRAS.absorbency} שעות</p>
                  </div>
                </div>
                <Switch
                  checked={absorbency}
                  onCheckedChange={(checked) => handleExtraToggle('absorbency', checked)}
                  disabled={remainingHours < EXTRAS.absorbency && !absorbency}
                  className="data-[state=checked]:bg-purple-500 flex-shrink-0"
                />
              </div>
              <p className="text-xs text-muted-foreground">אספקה חודשית עד הבית.</p>
            </div>

            {/* לחצן מצוקה (Disabled if Community is checked) */}
            <div 
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                community 
                  ? 'opacity-50 cursor-not-allowed border-border' 
                  : panicButton 
                    ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/30 cursor-pointer' 
                    : 'border-border hover:border-purple-200 cursor-pointer',
                remainingHours < EXTRAS.panicButton && !panicButton && !community && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => !community && handleExtraToggle('panicButton', !panicButton)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">לחצן מצוקה</p>
                    <p className="text-xs text-muted-foreground">-{EXTRAS.panicButton} שעות</p>
                  </div>
                </div>
                <Switch
                  checked={panicButton || community}
                  onCheckedChange={(checked) => !community && handleExtraToggle('panicButton', checked)}
                  disabled={community || (remainingHours < EXTRAS.panicButton && !panicButton)}
                  className="data-[state=checked]:bg-purple-500 flex-shrink-0"
                />
              </div>
              {community && (
                <p className="text-xs text-muted-foreground italic">כלול בקהילה תומכת</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-between gap-4"
        >
          <button
            onClick={prevStep}
            className="py-3 px-6 rounded-xl border-2 border-border hover:bg-secondary text-muted-foreground font-semibold transition-colors flex items-center gap-2"
          >
            חזרה
          </button>
          <button
            onClick={handleContinue}
            className="py-4 px-8 rounded-xl font-bold text-lg text-white flex items-center gap-2 transition-all hover:scale-105"
            style={{ background: 'var(--gradient-hero)' }}
          >
            <span>המשך לסיכום</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
};

export default WizardStepTwo;
