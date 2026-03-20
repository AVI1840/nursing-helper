import { motion } from 'framer-motion';
import { useNursingStore } from '@/store/useNursingStore';
import { LEVELS, getLevelData } from '@/data/nursingData';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Sparkles, Users } from 'lucide-react';

const WizardStepOne = () => {
  const { 
    name, 
    level, 
    hasForeignWorker, 
    isSurvivor,
    setName,
    setLevel, 
    setHasForeignWorker, 
    setIsSurvivor,
    nextStep 
  } = useNursingStore();

  const hasParams = name && level;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {/* Welcome Message */}
      {hasParams ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
            <Sparkles className="w-5 h-5" />
            <span>שלב 1 מתוך 4</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            שלום {name}! 👋
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            אנחנו כאן לעזור לך לנצל את מלוא הזכויות שלך ברמת סיעוד {level}.
            <br />
            בואו נתחיל בתכנון סל הסיעוד האישי שלך.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium mb-6">
            <Sparkles className="w-5 h-5" />
            <span>שלב 1 מתוך 4</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            ברוכים הבאים לסיעוד 360
          </h1>
          <p className="text-lg text-muted-foreground">
            בואו נתחיל בהזנת הפרטים הבסיסיים
          </p>
        </motion.div>
      )}

      {/* Manual Input (if no params) */}
      {!hasParams && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 rounded-2xl bg-card border border-border"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 font-medium text-foreground mb-2">
                <User className="w-5 h-5 text-primary" />
                שם המבוטח
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="הזינו את שמכם"
                className="h-14 text-lg"
                dir="rtl"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Level Selection (if no params) */}
      {!level && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">
            בחרו את רמת הסיעוד שלכם
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(LEVELS).map(([lvl, data], index) => {
              const levelNum = parseInt(lvl);
              return (
                <motion.button
                  key={lvl}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => setLevel(levelNum)}
                  className="level-card group"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white transition-transform group-hover:scale-110"
                      style={{ background: 'var(--gradient-hero)' }}
                    >
                      {lvl}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-lg">רמה {lvl}</p>
                      <p className="text-sm text-muted-foreground">{data.total_hours} שעות</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Level Info Card (if level selected) */}
      {level && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20 p-6 rounded-2xl bg-primary/5 border-2 border-primary/20"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'var(--gradient-hero)' }}
            >
              {level}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">רמת סיעוד {level}</h3>
              <p className="text-muted-foreground">
                {getLevelData(level, hasForeignWorker).total_hours} שעות שבועיות
              </p>
              <p className="text-sm text-primary mt-1">
                {getLevelData(level, hasForeignWorker).note}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Additional Options */}
      {(level || hasParams) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 mb-8"
        >
          {/* Foreign Worker Toggle */}
          <div 
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/30 transition-colors"
            onClick={() => setHasForeignWorker(!hasForeignWorker)}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">מעסיקים עובד זר?</p>
                <p className="text-muted-foreground text-sm">משפיע על אופן חלוקת הזכויות</p>
              </div>
            </div>
            <Switch
              checked={hasForeignWorker}
              onCheckedChange={setHasForeignWorker}
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Survivor Toggle */}
          <div 
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/30 transition-colors"
            onClick={() => setIsSurvivor(!isSurvivor)}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <span className="text-2xl">🕯️</span>
              </div>
              <div>
                <p className="font-semibold text-lg">ניצול/ת שואה?</p>
                <p className="text-muted-foreground text-sm">זכאות לתוספת 9 שעות מהקרן לרווחה</p>
              </div>
            </div>
            <Switch
              checked={isSurvivor}
              onCheckedChange={setIsSurvivor}
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      {level && (name || hasParams) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            onClick={nextStep}
            className="btn-accessible primary gap-3 text-lg px-10"
          >
            <span>המשך לתכנון הסל</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WizardStepOne;
