import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Copy, Check, Send, User, Hash, Users, Calendar, ArrowLeft, AlertCircle, Activity } from 'lucide-react';
import { LEVELS } from '@/data/nursingData';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

const ClerkDashboard = () => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<string>('');
  const [yearOfBirth, setYearOfBirth] = useState('');
  const [hasForeignWorker, setHasForeignWorker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedDirect, setCopiedDirect] = useState(false);
  
  // NEW: Professional parameters
  const [age, setAge] = useState('');
  const [eligibilityType, setEligibilityType] = useState<'permanent' | 'temporary'>('permanent');
  const [dependencyScore, setDependencyScore] = useState('');

  const baseUrl = window.location.origin;
  
  // Build URL with new params
  const generatedUrl = name && level && yearOfBirth
    ? `${baseUrl}/verify?name=${encodeURIComponent(name)}&level=${level}&fw=${hasForeignWorker}&yob=${yearOfBirth}${age ? `&age=${age}` : ''}${eligibilityType ? `&type=${eligibilityType === 'temporary' ? 'temp' : 'perm'}` : ''}${dependencyScore ? `&score=${dependencyScore}` : ''}`
    : '';
  
  // Direct link for agents - bypasses verification
  const directUrl = name && level
    ? `${baseUrl}/wizard?name=${encodeURIComponent(name)}&level=${level}&fw=${hasForeignWorker}${age ? `&age=${age}` : ''}${eligibilityType ? `&type=${eligibilityType === 'temporary' ? 'temp' : 'perm'}` : ''}${dependencyScore ? `&score=${dependencyScore}` : ''}`
    : '';

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDirect = async () => {
    if (!directUrl) return;
    await navigator.clipboard.writeText(directUrl);
    setCopiedDirect(true);
    setTimeout(() => setCopiedDirect(false), 2000);
  };

  const isValid = name.trim().length > 0 && level !== '' && yearOfBirth.length === 4;

  // Generate year options (1920-1970)
  const yearOptions = Array.from({ length: 51 }, (_, i) => 1920 + i);

  // Handle score input with validation
  const handleScoreChange = (value: string) => {
    const num = parseFloat(value);
    if (value === '' || (!isNaN(num) && num >= 0 && num <= 10)) {
      setDependencyScore(value);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="py-6 px-4 border-b border-border bg-card">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
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
                <p className="text-sm text-muted-foreground">דשבורד פקיד</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground hidden md:block"
            >
              מערכת ליצירת קישורים אישיים
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                יצירת קישור אישי למבוטח
              </h2>
              <p className="text-lg text-muted-foreground">
                מלאו את הפרטים ושלחו קישור מותאם אישית בוואטסאפ או SMS
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl bg-card border border-border space-y-6"
              style={{ boxShadow: 'var(--shadow-lg)' }}
            >
              {/* Name Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-foreground">
                  <User className="w-5 h-5 text-primary" />
                  שם המבוטח
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="לדוגמה: משה כהן"
                  className="h-14 text-lg"
                  dir="rtl"
                />
              </div>

              {/* Level Select */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-foreground">
                  <Hash className="w-5 h-5 text-primary" />
                  רמת סיעוד
                </label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue placeholder="בחרו רמת סיעוד" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEVELS).map(([lvl, data]) => (
                      <SelectItem key={lvl} value={lvl} className="text-lg py-3">
                        <span className="font-semibold">רמה {lvl}</span>
                        <span className="text-muted-foreground mr-2">
                          ({data.total_hours} שעות)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year of Birth Select */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-foreground">
                  <Calendar className="w-5 h-5 text-primary" />
                  שנת לידה
                </label>
                <Select value={yearOfBirth} onValueChange={setYearOfBirth}>
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue placeholder="בחרו שנת לידה" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-lg py-3">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  שנת הלידה משמשת לאימות זהות בטוח וללא הקלדה
                </p>
              </div>

              {/* NEW: Age Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-foreground">
                  <Calendar className="w-5 h-5 text-primary" />
                  גיל
                </label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="לדוגמה: 82"
                  className="h-14 text-lg"
                  dir="ltr"
                  min={60}
                  max={120}
                />
              </div>

              {/* NEW: Eligibility Type */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 font-medium text-foreground">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  סוג זכאות
                </label>
                <RadioGroup 
                  value={eligibilityType} 
                  onValueChange={(val) => setEligibilityType(val as 'permanent' | 'temporary')}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="permanent" id="permanent" />
                    <Label htmlFor="permanent" className="text-base cursor-pointer">לצמיתות</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="temporary" id="temporary" />
                    <Label htmlFor="temporary" className="text-base cursor-pointer flex items-center gap-2">
                      זמנית
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        מוגבל בזמן
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* NEW: Dependency Score */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-medium text-foreground">
                  <Activity className="w-5 h-5 text-primary" />
                  ניקוד תלות
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground cursor-help underline decoration-dotted">
                        (ניקוד ADL)
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>ניקוד ADL - Activities of Daily Living</p>
                      <p>סולם 0.0 - 10.0</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <Input
                  type="number"
                  step="0.5"
                  value={dependencyScore}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  placeholder="לדוגמה: 5.5"
                  className="h-14 text-lg"
                  dir="ltr"
                  min={0}
                  max={10}
                />
                <p className="text-sm text-muted-foreground">
                  טווח: 0.0 - 10.0 (ספי רמות: 3.5, 4.5, 6.5, 7.5, 8.5, 9.5)
                </p>
              </div>

              {/* Foreign Worker Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">עובד זר</p>
                    <p className="text-sm text-muted-foreground">האם המבוטח מעסיק עובד זר?</p>
                  </div>
                </div>
                <Switch
                  checked={hasForeignWorker}
                  onCheckedChange={setHasForeignWorker}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </motion.div>

            {/* Generated Link Card */}
            {isValid && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-8 p-6 rounded-2xl border-2 border-primary/30 bg-primary/5"
                style={{ boxShadow: 'var(--shadow-md)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">קישור מוכן לשליחה</h3>
                </div>

                <div className="p-4 rounded-xl bg-background border border-border mb-4 overflow-x-auto">
                  <code className="text-sm break-all text-muted-foreground" dir="ltr">
                    {generatedUrl}
                  </code>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="btn-accessible primary gap-2 flex-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>הועתק!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>העתק קישור</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`שלום ${name}, הנה הקישור האישי שלך לתכנון סל הסיעוד: ${generatedUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accessible secondary gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                </div>

                <p className="text-sm text-muted-foreground mt-4 text-center">
                  הקישור יפתח עמוד אימות פשוט עבור {name} ברמה {level}
                </p>

                {/* Direct Access Link for Agents */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-foreground">גישה ישירה לפקיד</h4>
                        <p className="text-sm text-muted-foreground">מדלג על מסך האימות</p>
                      </div>
                    </div>
                    <a
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-6 rounded-xl border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-base flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                      <span>פתח קישור למערכת</span>
                      <ArrowLeft className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 p-6 rounded-xl bg-secondary/30 border border-border"
            >
              <h4 className="font-semibold mb-3">מידע על הקישור:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  הקישור כולל אימות פשוט - המבוטח יתבקש לבחור את שנת הלידה שלו
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  המבוטח יוכל לתכנן את סל הזכויות שלו ולגלות זכויות נוספות
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  ניתן לשלוח בוואטסאפ, SMS או אימייל
                </li>
              </ul>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-4 border-t border-border bg-card mt-auto">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 סיעוד 360 - מערכת לפקידי ביטוח לאומי
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};

export default ClerkDashboard;