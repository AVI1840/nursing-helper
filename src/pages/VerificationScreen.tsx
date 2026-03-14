import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

const VerificationScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const name = searchParams.get('name') || '';
  const level = searchParams.get('level') || '';
  const fw = searchParams.get('fw') || 'false';
  const correctYob = searchParams.get('yob') || '';

  // Generate 4 year options: 1 correct + 3 random within ±5 years
  const yearOptions = useMemo(() => {
    const correctYear = parseInt(correctYob, 10);
    if (isNaN(correctYear)) return [];

    const options = new Set<number>();
    options.add(correctYear);

    // Generate random years within ±5 range
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 11) - 5; // -5 to +5
      const randomYear = correctYear + offset;
      if (randomYear !== correctYear && randomYear >= 1920 && randomYear <= 1970) {
        options.add(randomYear);
      }
    }

    // Shuffle the options
    return Array.from(options).sort(() => Math.random() - 0.5);
  }, [correctYob]);

  const handleYearSelect = (year: number) => {
    if (year.toString() === correctYob) {
      // Correct - redirect to wizard
      navigate(`/wizard?name=${encodeURIComponent(name)}&level=${level}&fw=${fw}`);
    } else {
      // Incorrect
      setError(true);
      setAttempts(prev => prev + 1);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleRetry = () => {
    setError(false);
    setAttempts(0);
    // Force re-render to shuffle options
    window.location.reload();
  };

  // If missing params, show error
  if (!name || !level || !correctYob) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">קישור לא תקין</h1>
          <p className="text-muted-foreground">נא לפנות לפקיד הביטוח הלאומי לקבלת קישור חדש</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-border bg-card">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--gradient-hero)' }}
          >
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">סיעוד 360</h1>
            <p className="text-sm text-muted-foreground">אימות זהות</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Welcome Card */}
          <div 
            className="p-8 rounded-3xl bg-card border border-border text-center"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'var(--gradient-hero)' }}
            >
              <ShieldCheck className="w-10 h-10 text-white" />
            </motion.div>

            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-extrabold text-foreground mb-2">
                שלום {name}! 👋
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                לאבטחת הפרטים שלך, לחצו על שנת הלידה שלכם
              </p>
            </motion.div>

            {/* Year Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              {yearOptions.map((year, index) => (
                <motion.button
                  key={year}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleYearSelect(year)}
                  disabled={attempts >= 3}
                  className="py-6 px-8 text-3xl font-bold rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground transition-all border-2 border-transparent hover:border-primary focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    boxShadow: 'var(--shadow-md)',
                    minHeight: '100px'
                  }}
                >
                  {year}
                </motion.button>
              ))}
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-4"
                >
                  <p className="text-destructive font-medium flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    שנה לא נכונה, נסו שוב
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Too many attempts */}
            {attempts >= 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-amber-50 border border-amber-200"
              >
                <p className="text-amber-800 font-medium mb-3">
                  ניסיונות רבים מדי. נא לפנות לפקיד ביטוח לאומי.
                </p>
                <button
                  onClick={handleRetry}
                  className="btn-accessible secondary gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>נסה שוב</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Help Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            אימות פשוט ובטוח ללא צורך בהקלדה
          </motion.p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t border-border bg-card">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 סיעוד 360 - כל הזכויות שמורות
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VerificationScreen;
