import { motion } from 'framer-motion';
import { useNursingStore } from '@/store/useNursingStore';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, Banknote, Building2, Bell, Package, Users, Home, Info, Plus, Minus
} from 'lucide-react';
import { 
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider
} from "@/components/ui/tooltip";
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { calcAbsorbencyHours, ABSORBENCY_BY_LEVEL, ABSORBENCY_PRODUCTS } from '@/data/nursingData';

import { getTotalHours } from '@/data/nursingData';

const getDayCenterRate = (level: number): number => level <= 3 ? 2.0 : 2.75;

const getCashCap = (level: number, totalHours: number, hasForeignWorker: boolean): number =>
  level === 1 || hasForeignWorker ? totalHours : Math.floor(totalHours / 3);

const EXTRAS = { community: 0.5, panicButton: 0.25 };
// מוצרי ספיגה - עלות מחושבת דינמית לפי BL2625 (calcAbsorbencyHours)

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
      "w-14 h-14 rounded-xl flex items-center justify-center transition-all",
      "disabled:opacity-40 disabled:cursor-not-allowed active:scale-95",
      "focus:outline-none focus:ring-2 focus:ring-primary/50",
      colorClass
    )}
    aria-label={variant === 'plus' ? 'הוסף' : 'הפחת'}
  >
    {variant === 'plus' ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
  </button>
);

// Circular progress SVG component
const CircularProgress = ({ percent, remaining, total }: { percent: number; remaining: number; total: number }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = Math.min(percent / 100, 1) * circumference;
  const color = percent >= 100 ? '#10b981' : percent >= 70 ? '#f59e0b' : '#6366f1';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128" role="img" aria-label={`${Math.round(percent)} אחוז מהתקציב מנוצל`}>
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <motion.circle
            cx="64" cy="64" r={radius} fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - filled }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold" style={{ color }}>{Math.round(percent)}%</span>
          <span className="text-xs text-muted-foreground">מנוצל</span>
        </div>
      </div>
      <p className={cn("text-sm font-semibold", percent >= 100 ? 'text-emerald-600' : 'text-amber-600')}>
        {percent >= 100 ? 'תקציב מלא ✓' : `נותרו ${remaining.toFixed(1)} / ${total} שע׳`}
      </p>
    </div>
  );
};

const WizardStepTwo = () => {
  const { level, hasForeignWorker, allocation, setAllocation, nextStep, prevStep } = useNursingStore();

  const safeLevel = level ?? 3;
  const totalHours = getTotalHours(safeLevel, hasForeignWorker);
  const dayCenterRate = getDayCenterRate(safeLevel);
  const cashCap = getCashCap(safeLevel, totalHours, hasForeignWorker);

  // ALL hooks before any conditional return
  const [dayCenterDays, setDayCenterDays] = useState(allocation.daycareDays || 0);
  const [cashHours, setCashHours] = useState(allocation.cashHours || 0);
  const [caregiverHours, setCaregiverHours] = useState(allocation.caregiverHours || 0);
  const [community, setCommunity] = useState(allocation.community || false);
  const [absorbency, setAbsorbency] = useState(allocation.absorbency || false);
  const [panicButton, setPanicButton] = useState(allocation.panicButton || false);

  // עלות מוצרי ספיגה מחושבת לפי BL2625 (שעות חודשיות)
  const absorbencyCost = useMemo(() => calcAbsorbencyHours(safeLevel), [safeLevel]);

  const extrasCost = useMemo(() => {
    let cost = 0;
    if (community) cost += EXTRAS.community;
    if (absorbency) cost += absorbencyCost;
    if (panicButton && !community) cost += EXTRAS.panicButton;
    return cost;
  }, [community, absorbency, panicButton, absorbencyCost]);

  const dayCenterCost = dayCenterDays * dayCenterRate;
  const usedHours = dayCenterCost + cashHours + caregiverHours + extrasCost;
  const remainingHours = Math.max(0, totalHours - usedHours);
  const allocatedPercent = Math.min((usedHours / totalHours) * 100, 100);
  const canProceed = true; // Always allow proceeding
  const hasMinAllocation = allocatedPercent >= 70;
  const canIncrease = remainingHours > 0;

  const dayCenterPercent = (dayCenterCost / totalHours) * 100;
  const caregiverPercent = (caregiverHours / totalHours) * 100;
  const cashPercent = (cashHours / totalHours) * 100;
  const extrasPercent = (extrasCost / totalHours) * 100;

  // Guard after all hooks
  if (!level) return null;

  const handleDayCenterIncrement = () => {
    if (dayCenterDays < 5 && remainingHours >= dayCenterRate) setDayCenterDays(p => p + 1);
  };
  const handleDayCenterDecrement = () => {
    if (dayCenterDays > 0) setDayCenterDays(p => p - 1);
  };
  const handleCaregiverIncrement = () => {
    if (remainingHours >= 0.5) setCaregiverHours(p => p + 0.5);
  };
  const handleCaregiverDecrement = () => {
    if (caregiverHours >= 0.5) setCaregiverHours(p => p - 0.5);
  };
  const handleCashIncrement = () => {
    if (cashHours < cashCap && remainingHours >= 0.5) setCashHours(p => Math.min(cashCap, p + 0.5));
  };
  const handleCashDecrement = () => {
    if (cashHours >= 0.5) setCashHours(p => p - 0.5);
  };

  const handleExtraToggle = (extra: 'community' | 'absorbency' | 'panicButton', checked: boolean) => {
    if (extra === 'absorbency') {
      if (checked && absorbencyCost > remainingHours) return; // אין מספיק שעות
      setAbsorbency(checked);
      return;
    }
    const cost = extra === 'panicButton' && community ? 0 : EXTRAS[extra];
    if (checked && cost > remainingHours) return;
    switch (extra) {
      case 'community':
        setCommunity(checked);
        if (checked) setPanicButton(false);
        break;
      case 'panicButton':
        if (!community) setPanicButton(checked);
        break;
    }
  };

  const handleContinue = () => {
    setAllocation({ cashHours, daycareDays: dayCenterDays, caregiverHours, community, panicButton: community ? false : panicButton, absorbency });
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
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            תכנון סל הסיעוד (רמה {safeLevel})
          </motion.h1>
          <p className="text-lg text-muted-foreground">סה״כ {totalHours} שעות שבועיות לחלוקה</p>
        </div>

        {/* Budget Bar + Circular Progress */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }} animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card border border-border mb-8"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Circular progress */}
            <div className="flex-shrink-0">
              <CircularProgress percent={allocatedPercent} remaining={remainingHours} total={totalHours} />
            </div>

            {/* Stacked bar */}
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-lg">הקצאת התקציב</span>
                {!hasMinAllocation && (
                  <span className="text-xs text-amber-600 font-medium">מומלץ לפחות 70% להמשך</span>
                )}
              </div>
              <div className="h-12 rounded-xl overflow-hidden flex bg-gray-200 dark:bg-gray-700">
                {dayCenterPercent > 0 && (
                  <motion.div initial={{ width: 0 }} animate={{ width: `${dayCenterPercent}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center min-w-0">
                    {dayCenterPercent > 10 && <span className="text-white text-xs font-bold px-1">🏛️ {dayCenterCost.toFixed(1)}</span>}
                  </motion.div>
                )}
                {caregiverPercent > 0 && (
                  <motion.div initial={{ width: 0 }} animate={{ width: `${caregiverPercent}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center min-w-0">
                    {caregiverPercent > 10 && <span className="text-white text-xs font-bold px-1">🏠 {caregiverHours.toFixed(1)}</span>}
                  </motion.div>
                )}
                {cashPercent > 0 && (
                  <motion.div initial={{ width: 0 }} animate={{ width: `${cashPercent}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center min-w-0">
                    {cashPercent > 10 && <span className="text-white text-xs font-bold px-1">💰 {cashHours.toFixed(1)}</span>}
                  </motion.div>
                )}
                {extrasPercent > 0 && (
                  <motion.div initial={{ width: 0 }} animate={{ width: `${extrasPercent}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center min-w-0">
                    {extrasPercent > 4 && <span className="text-white text-xs font-bold px-1">⭐</span>}
                  </motion.div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-xs">
                {[
                  { color: 'bg-emerald-500', label: 'מרכז יום' },
                  { color: 'bg-blue-500', label: 'מטפלת בבית' },
                  { color: 'bg-amber-500', label: 'כסף' },
                  { color: 'bg-purple-500', label: 'שירותים נוספים' },
                  { color: 'bg-gray-300 dark:bg-gray-600', label: 'לא מנוצל' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className={cn('w-3 h-3 rounded', color)} />
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Foreign Worker Banner */}
        {hasForeignWorker && safeLevel > 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-300">מעסיק עובד זר</p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  ניתן לקבל את מלוא הגמלה כתשלום ישיר (כסף) או לשלב שירותים בעין.
                  <br />
                  <span className="font-medium">אין מגבלת ⅓ על המרה לכסף.</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Card 1: מרכז יום */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-card border-2 border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20 flex flex-col gap-4"
            style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">מרכז יום</h3>
                <p className="text-sm text-muted-foreground">ניכוי {dayCenterRate} שע׳/יום</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700">
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                יחידה אחת = יום מלא (~7 שע׳) כולל הסעה, חוגים וארוחות.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 mt-auto">
              <StepperButton onClick={handleDayCenterDecrement} disabled={dayCenterDays === 0} variant="minus"
                colorClass="bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 text-emerald-700" />
              <div className="text-center min-w-[70px]">
                <motion.span key={dayCenterDays} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                  className="text-5xl font-bold text-emerald-600">{dayCenterDays}</motion.span>
                <p className="text-xs text-muted-foreground mt-1">ימים</p>
              </div>
              <StepperButton onClick={handleDayCenterIncrement}
                disabled={dayCenterDays >= 5 || !canIncrease || remainingHours < dayCenterRate} variant="plus"
                colorClass="bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/50 text-emerald-700" />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {dayCenterDays > 0 ? `${dayCenterCost.toFixed(1)} שעות מנוכות` : 'ללא מרכז יום'}
            </p>
          </motion.div>

          {/* Card 2: מטפלת בבית */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl border-2 border-primary/30 bg-primary/5 flex flex-col gap-4"
            style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--gradient-hero)' }}>
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">מטפלת אישית בבית</h3>
                <p className="text-sm text-muted-foreground">טיפול אישי וסיעוד</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">שעות שבועיות לטיפול אישי</p>
            <div className="flex items-center justify-center gap-4 mt-auto">
              <StepperButton onClick={handleCaregiverDecrement} disabled={caregiverHours === 0} variant="minus"
                colorClass="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 text-blue-700" />
              <div className="text-center min-w-[90px]">
                <motion.span key={caregiverHours} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                  className="text-5xl font-extrabold text-gradient">{caregiverHours.toFixed(1)}</motion.span>
                <p className="text-xs text-muted-foreground mt-1">שעות</p>
              </div>
              <StepperButton onClick={handleCaregiverIncrement}
                disabled={!canIncrease || remainingHours < 0.5} variant="plus"
                colorClass="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 text-blue-700" />
            </div>
            <p className="text-center text-xs text-muted-foreground">צעד: 0.5 שעות</p>
          </motion.div>

          {/* Card 3: קצבה בכסף */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className={cn("p-6 rounded-2xl border-2 flex flex-col gap-4",
              cashHours > 0 ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/30' : 'border-amber-200 bg-amber-50/30 dark:bg-amber-950/20')}
            style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                cashHours > 0 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-amber-400 to-amber-500')}>
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">קצבה בכסף</h3>
                <p className="text-sm text-muted-foreground">
                  {safeLevel === 1 ? 'ללא הפסד ערך' : 'עד ⅓ מהתקציב'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-auto">
              <StepperButton onClick={handleCashDecrement} disabled={cashHours === 0} variant="minus"
                colorClass="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 text-amber-700" />
              <div className="text-center min-w-[90px]">
                <motion.span key={cashHours} initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                  className="text-5xl font-bold text-amber-600">{cashHours.toFixed(1)}</motion.span>
                <p className="text-xs text-muted-foreground mt-1">שעות</p>
              </div>
              <StepperButton onClick={handleCashIncrement}
                disabled={cashHours >= cashCap || !canIncrease || remainingHours < 0.5} variant="plus"
                colorClass="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 text-amber-700" />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {hasForeignWorker
                ? `מקסימום: ${cashCap} שע׳ (100% - עובד זר)`
                : `מקסימום: ${cashCap} שע׳ ${safeLevel > 1 ? '(⅓ מהתקציב)' : ''}`}
            </p>
            {(safeLevel === 1 || hasForeignWorker) && (
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200">
                <p className="text-xs text-emerald-800 dark:text-emerald-300 text-center">
                  {safeLevel === 1 ? '✨ ברמה 1 ניתן להמיר 100% לכסף' : '✨ עם עובד זר ניתן להמיר 100% לכסף'}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Extras */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-card border border-border mb-8"
          style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-500" />
            שירותים נוספים
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* קהילה תומכת */}
            <div
              className={cn("p-4 rounded-xl border-2 transition-all cursor-pointer",
                community ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/30' : 'border-border hover:border-purple-200',
                remainingHours < EXTRAS.community && !community && 'opacity-50 cursor-not-allowed')}
              onClick={() => handleExtraToggle('community', !community)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium">קהילה תומכת</p>
                    <p className="text-xs text-muted-foreground">-{EXTRAS.community} שעות</p>
                  </div>
                </div>
                <Switch checked={community}
                  onCheckedChange={(c) => handleExtraToggle('community', c)}
                  disabled={remainingHours < EXTRAS.community && !community}
                  className="data-[state=checked]:bg-purple-500"
                  aria-label="קהילה תומכת" />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                    <Info className="w-3 h-3" />
                    <span>כולל: לחצן מצוקה, אב בית, קהילה ופעילות.</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs"><p>כולל: לחצן מצוקה, אב בית, קהילה ופעילות.</p></TooltipContent>
              </Tooltip>
            </div>

            {/* מוצרי ספיגה - עלות לפי BL2625 */}
            <div
              className={cn("p-4 rounded-xl border-2 transition-all cursor-pointer",
                absorbency ? 'border-teal-400 bg-teal-50 dark:bg-teal-950/30' : 'border-border hover:border-teal-200',
                remainingHours < absorbencyCost && !absorbency && 'opacity-50 cursor-not-allowed')}
              onClick={() => handleExtraToggle('absorbency', !absorbency)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium">מוצרי ספיגה</p>
                    <p className="text-xs text-teal-700 font-semibold">
                      -{absorbencyCost.toFixed(2)} שע׳ (לפי BL2625)
                    </p>
                  </div>
                </div>
                <Switch checked={absorbency}
                  onCheckedChange={(c) => handleExtraToggle('absorbency', c)}
                  disabled={remainingHours < absorbencyCost && !absorbency}
                  className="data-[state=checked]:bg-teal-500"
                  aria-label="מוצרי ספיגה" />
              </div>

              {/* פירוט לפי רמה */}
              <div className="mt-2 p-3 rounded-lg bg-teal-50/80 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700">
                <p className="text-xs font-semibold text-teal-800 dark:text-teal-300 mb-1.5">
                  {ABSORBENCY_BY_LEVEL[safeLevel].label} (סל קבוע לפי רמה)
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {ABSORBENCY_BY_LEVEL[safeLevel].products.map((p) => (
                    <span key={p.key} className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-teal-900/50 border border-teal-200 dark:border-teal-600 text-teal-700 dark:text-teal-300">
                      {ABSORBENCY_PRODUCTS[p.key].name} × {p.qty}
                    </span>
                  ))}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-teal-600 cursor-help">
                      <Info className="w-3 h-3" />
                      <span>
                        עלות חודשית: ~{ABSORBENCY_BY_LEVEL[safeLevel].products.reduce((s, p) => s + p.qty * ABSORBENCY_PRODUCTS[p.key].unitPrice, 0).toFixed(0)} ₪ → {absorbencyCost.toFixed(2)} שע׳
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-right" dir="rtl">
                    <p className="font-semibold mb-2">חישוב לפי BL/2625:</p>
                    {ABSORBENCY_BY_LEVEL[safeLevel].products.map((p) => (
                      <p key={p.key} className="text-xs">
                        {ABSORBENCY_PRODUCTS[p.key].name}: {p.qty} × {ABSORBENCY_PRODUCTS[p.key].unitPrice.toFixed(2)} ₪ = {(p.qty * ABSORBENCY_PRODUCTS[p.key].unitPrice).toFixed(0)} ₪
                      </p>
                    ))}
                    <p className="text-xs mt-1 border-t pt-1">
                      סה״כ ÷ {safeLevel === 1 ? '302' : '241'} ₪/שע׳ = {absorbencyCost.toFixed(2)} שע׳
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">📦 אספקה חודשית עד הבית דרך ספק מורשה</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* לחצן מצוקה */}
            <div
              className={cn("p-4 rounded-xl border-2 transition-all",
                community ? 'opacity-50 cursor-not-allowed border-border'
                  : panicButton ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/30 cursor-pointer'
                  : 'border-border hover:border-purple-200 cursor-pointer',
                remainingHours < EXTRAS.panicButton && !panicButton && !community && 'opacity-50 cursor-not-allowed')}
              onClick={() => !community && handleExtraToggle('panicButton', !panicButton)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium">לחצן מצוקה</p>
                    <p className="text-xs text-muted-foreground">-{EXTRAS.panicButton} שעות</p>
                  </div>
                </div>
                <Switch checked={panicButton || community}
                  onCheckedChange={(c) => !community && handleExtraToggle('panicButton', c)}
                  disabled={community || (remainingHours < EXTRAS.panicButton && !panicButton)}
                  className="data-[state=checked]:bg-purple-500"
                  aria-label="לחצן מצוקה" />
              </div>
              {community
                ? <p className="text-xs text-muted-foreground italic">כלול בקהילה תומכת</p>
                : <p className="text-xs text-muted-foreground">התראה חירום 24/7 לצוות מגן</p>
              }
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex items-center justify-between gap-4">
          <button onClick={prevStep}
            className="py-3 px-6 rounded-xl border-2 border-border hover:bg-secondary text-muted-foreground font-semibold transition-colors"
            aria-label="חזרה לשלב הקודם">
            חזרה
          </button>
          <div className="flex flex-col items-end gap-1">
            {!hasMinAllocation && (
              <p className="text-xs text-amber-600">מומלץ להקצות לפחות 70% מהתקציב ({Math.round(totalHours * 0.7)} שע׳)</p>
            )}
            <button
              onClick={handleContinue}
              className="py-4 px-8 rounded-xl font-bold text-lg text-white flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
              style={{ background: 'var(--gradient-hero)' }}
              aria-label="המשך לדף הסיכום">
              <span>המשך לסיכום</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
};

export default WizardStepTwo;
