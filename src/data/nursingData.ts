// Nursing Level Data for 2025 - Bituach Leumi Official Rates
// All monetary values in NIS (New Israeli Shekel)

// Value rates - CRITICAL: Level 1 has 1:1 ratio (no penalty)
export const SERVICE_VALUE = 302; // NIS per hour - Level 1
export const SERVICE_VALUE_2_6 = 241; // NIS per hour - Levels 2-6
export const CASH_VALUE = 241; // NIS per hour if taken as cash (20% penalty)

// ─── מוצרי ספיגה - טבלת BL/2625 ───────────────────────────────────────────
// מחיר ליחידה לפי מסמך ביטוח לאומי (מחיר חישובי, לא מחיר לצרכן)
export interface AbsorbencyProduct {
  name: string;
  unitPrice: number;  // ₪ ליחידה (BL2625)
}

export const ABSORBENCY_PRODUCTS: Record<string, AbsorbencyProduct> = {
  diaper:    { name: 'חיתול ספיגה',        unitPrice: 1.01 },
  brief:     { name: 'תחתון ספיגה',        unitPrice: 1.20 },
  pad:       { name: 'פד ספיגה',           unitPrice: 0.55 },
  sheet:     { name: 'סדין חד-פעמי',       unitPrice: 1.80 },
  wipe:      { name: 'מגבון לח',           unitPrice: 0.15 },
  glove:     { name: 'כפפה',               unitPrice: 0.10 },
};

// זכאות לפי רמה: מוצרים + כמות חודשית
export interface AbsorbencyEntitlement {
  label: string;
  products: { key: keyof typeof ABSORBENCY_PRODUCTS; qty: number }[];
}

export const ABSORBENCY_BY_LEVEL: Record<number, AbsorbencyEntitlement> = {
  1: {
    label: 'חיתולים בסיסיים',
    products: [{ key: 'diaper', qty: 60 }],
  },
  2: {
    label: 'חיתולים בסיסיים',
    products: [{ key: 'diaper', qty: 60 }],
  },
  3: {
    label: 'חיתולים + מגבונים',
    products: [{ key: 'diaper', qty: 90 }, { key: 'wipe', qty: 60 }],
  },
  4: {
    label: 'ערכה מורחבת',
    products: [{ key: 'diaper', qty: 120 }, { key: 'wipe', qty: 60 }, { key: 'glove', qty: 60 }],
  },
  5: {
    label: 'ערכה מלאה',
    products: [{ key: 'diaper', qty: 150 }, { key: 'wipe', qty: 90 }, { key: 'glove', qty: 60 }, { key: 'pad', qty: 30 }],
  },
  6: {
    label: 'ערכה מלאה מורחבת',
    products: [{ key: 'diaper', qty: 180 }, { key: 'wipe', qty: 90 }, { key: 'glove', qty: 60 }, { key: 'pad', qty: 60 }, { key: 'sheet', qty: 30 }],
  },
};

/**
 * מחשב עלות חודשית של מוצרי ספיגה לפי BL2625
 * ומחזיר שעות ניכוי מהסל
 */
export const calcAbsorbencyHours = (level: number): number => {
  const entitlement = ABSORBENCY_BY_LEVEL[level];
  if (!entitlement) return 0;
  const monthlyCost = entitlement.products.reduce((sum, p) => {
    return sum + p.qty * ABSORBENCY_PRODUCTS[p.key].unitPrice;
  }, 0);
  // שווי שעת שירות לפי רמה
  const hourValue = level === 1 ? SERVICE_VALUE : SERVICE_VALUE_2_6;
  return Math.round((monthlyCost / hourValue) * 100) / 100; // עיגול ל-2 ספרות
};
// ────────────────────────────────────────────────────────────────────────────

export interface LevelData {
  total_hours: number;
  max_cash_hours: number;
  note: string;
}

export interface NursingLevels {
  [key: number]: LevelData;
}

export interface Rates {
  service_value: number;
  cash_value: number;
  daycare_low: number;    // מרכז יום - Levels 1-3
  daycare_high: number;   // מרכז יום - Levels 4-6
  community: number;      // קהילה תומכת
  panic_button: number;
  absorbency: number;
}

export interface AncillaryRight {
  id: string;
  title: string;
  description: string;
  value: string;
  min_level: number;
  requires_survivor: boolean;
  requires_foreign_worker: boolean;
  action: string;
  icon: string;
}

// Level data structure with 33% cash cap for levels 2-6
// Level 1 can convert 100% to cash
export const LEVELS: NursingLevels = {
  1: { total_hours: 5.5, max_cash_hours: 5.5, note: "ברמה 1 ניתן להמיר את מלוא השעות לכסף ללא הפסד ערך." },
  2: { total_hours: 10, max_cash_hours: Math.floor(10 / 3), note: "ניתן להמיר עד שליש מהשעות לכסף." },
  3: { total_hours: 17, max_cash_hours: Math.floor(17 / 3), note: "ניתן להמיר עד שליש מהשעות לכסף." },
  4: { total_hours: 21, max_cash_hours: Math.floor(21 / 3), note: "ניתן להמיר עד שליש מהשעות לכסף." },
  5: { total_hours: 26, max_cash_hours: Math.floor(26 / 3), note: "ניתן להמיר עד שליש מהשעות לכסף." },
  6: { total_hours: 30, max_cash_hours: Math.floor(30 / 3), note: "ניתן להמיר עד שליש מהשעות לכסף." }
};

// If foreign worker is present, max_cash_hours becomes total_hours (minus small fee)
export const LEVELS_FOREIGN_WORKER: NursingLevels = {
  1: { total_hours: 5.5, max_cash_hours: 5.5, note: "ברמה 1 ניתן להמיר את מלוא השעות לכסף ללא הפסד ערך." },
  2: { total_hours: 10, max_cash_hours: 10, note: "עם עובד זר - ניתן להמיר את מלוא השעות לכסף." },
  3: { total_hours: 14, max_cash_hours: 14, note: "עם עובד זר - ניתן להמיר את מלוא השעות לכסף." },
  4: { total_hours: 18, max_cash_hours: 18, note: "עם עובד זר - ניתן להמיר את מלוא השעות לכסף." },
  5: { total_hours: 22, max_cash_hours: 22, note: "עם עובד זר - ניתן להמיר את מלוא השעות לכסף." },
  6: { total_hours: 26, max_cash_hours: 26, note: "עם עובד זר - ניתן להמיר את מלוא השעות לכסף." }
};

export const RATES: Rates = {
  service_value: SERVICE_VALUE,
  cash_value: CASH_VALUE,
  daycare_low: 2.0,      // מרכז יום - Levels 1-3 deduction per visit
  daycare_high: 2.75,    // מרכז יום - Levels 4-6 deduction per visit (UPDATED)
  community: 0.5,        // קהילה תומכת - fixed deduction
  panic_button: 0.25,    // לחצן מצוקה
  absorbency: 0.5        // מוצרי ספיגה - ממוצע (מחושב דינמית לפי calcAbsorbencyHours)
};

export const ANCILLARY_RIGHTS: AncillaryRight[] = [
  {
    id: 'water',
    title: 'הנחה בחשבון המים',
    description: 'תוספת של 3.5 מ"ק מים בתעריף הנמוך לכל תקופת חיוב (חודשיים).',
    value: 'כ-400 ₪ בשנה',
    min_level: 1,
    requires_survivor: false,
    requires_foreign_worker: false,
    action: 'ההנחה מתעדכנת אוטומטית מול תאגיד המים לאחר אישור הזכאות בביטוח לאומי. אם לא מופיעה בחשבון, יש לפנות לתאגיד המים המקומי עם אישור זכאות.',
    icon: 'Droplet'
  },
  {
    id: 'arnona',
    title: 'הנחה בארנונה',
    description: 'הנחה של עד 70% בתשלומי הארנונה (תלוי ברשות המקומית) עבור עד 100 מ"ר.',
    value: 'עד 2,500 ₪ בשנה',
    min_level: 1,
    requires_survivor: false,
    requires_foreign_worker: false,
    action: 'יש להגיש טופס בקשה להנחה במחלקת הארנונה ברשות המקומית, בצירוף אישור זכאות מביטוח לאומי. ההנחה משתנה בין רשויות.',
    icon: 'Home'
  },
  {
    id: 'electricity',
    title: 'הנחה בחשבון החשמל',
    description: 'הנחה של 50% על צריכת חשמל עד 400 קוט"ש לחודש, לזכאי גמלת סיעוד ברמה 4 ומעלה.',
    value: 'כ-1,200 ₪ בשנה',
    min_level: 4,
    requires_survivor: false,
    requires_foreign_worker: false,
    action: 'ההנחה מועברת אוטומטית לחברת החשמל. יש לוודא שההנחה מופיעה בחשבונית. אם לא — לפנות לחברת החשמל עם אישור זכאות.',
    icon: 'Zap'
  },
  {
    id: 'survivor_hours',
    title: 'תוספת שעות לניצולי שואה',
    description: 'זכאות לעד 9 שעות סיעוד נוספות בשבוע מהקרן לרווחה לנפגעי השואה, בנוסף לגמלת הסיעוד.',
    value: 'שווי כ-2,500 ₪ בחודש',
    min_level: 1,
    requires_survivor: true,
    requires_foreign_worker: false,
    action: 'יש לפנות לקרן לרווחה נפגעי השואה בטלפון 03-5682651 או דרך אתר הקרן. נדרש אישור ניצול שואה ואישור זכאות סיעוד.',
    icon: 'HeartHandshake'
  },
  {
    id: 'worker_permit',
    title: 'פטור מאגרת עובד זר',
    description: 'פטור מלא או חלקי מתשלום אגרה שנתית ואגרת בקשה להעסקת עובד זר בסיעוד.',
    value: 'חיסכון של מאות שקלים בשנה',
    min_level: 1,
    requires_survivor: false,
    requires_foreign_worker: true,
    action: 'יש להסדיר מול רשות האוכלוסין וההגירה. ניתן להגיש בקשה באתר gov.il או בסניפי הרשות.',
    icon: 'Passport'
  },
  {
    id: 'drugs_ceiling',
    title: 'תקרת תשלום לתרופות',
    description: 'פטור מתשלום השתתפות עצמית על תרופות מעבר לתקרה חודשית מופחתת בקופת החולים.',
    value: 'משתנה לפי קופה וצריכה',
    min_level: 1,
    requires_survivor: false,
    requires_foreign_worker: false,
    action: 'ההטבה מופעלת אוטומטית בקופת החולים. מומלץ לוודא עם הרוקח או נציג הקופה שהתקרה המופחתת חלה.',
    icon: 'Pill'
  }
];

// Helper functions
export const getLevelData = (level: number, hasForeignWorker: boolean): LevelData => {
  const data = hasForeignWorker ? LEVELS_FOREIGN_WORKER : LEVELS;
  return data[level] || LEVELS[1];
};

export const getTotalHours = (level: number, hasForeignWorker: boolean): number => {
  return getLevelData(level, hasForeignWorker).total_hours;
};

export const getMaxCashHours = (level: number, hasForeignWorker: boolean): number => {
  return getLevelData(level, hasForeignWorker).max_cash_hours;
};

export const getDaycareRate = (level: number): number => {
  return level <= 3 ? RATES.daycare_low : RATES.daycare_high;
};

// CRITICAL: Level 1 has 1:1 ratio (no penalty), levels 2-6 use 241
export const getCashValuePerHour = (level: number): number => {
  return level === 1 ? SERVICE_VALUE : SERVICE_VALUE_2_6;
};

// Calculate total basket value
export const calculateBasketValue = (
  level: number,
  serviceHours: number,
  cashHours: number
): number => {
  const cashValue = getCashValuePerHour(level);
  return (serviceHours * SERVICE_VALUE) + (cashHours * cashValue);
};

// Calculate maximum possible value (all as service)
export const calculateMaxValue = (level: number, hasForeignWorker: boolean): number => {
  const totalHours = getTotalHours(level, hasForeignWorker);
  return totalHours * SERVICE_VALUE;
};

// Calculate value loss percentage when converting to cash
export const calculateValueLoss = (level: number): number => {
  if (level === 1) return 0; // No loss for level 1
  return Math.round((1 - CASH_VALUE / SERVICE_VALUE) * 100);
};

// Get cash cap percentage (for UI display)
export const getCashCapPercentage = (level: number): number => {
  return level === 1 ? 100 : 33;
};
