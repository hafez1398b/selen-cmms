// AI Assistant — Contextual chat-based helper for Baspar Foam Gharb
// Provides domain-aware answers about failures, repairs, PM, inventory and metrics.
import type { Equipment, WorkOrder, PMPlan, SparePart, User } from './types';
import { computeAllPMMetrics, analyzeMetric } from './pmMetrics';

export type AssistantContext =
  | 'global' | 'dashboard' | 'equipment' | 'workorders' | 'pm'
  | 'inventory' | 'personnel' | 'planning' | 'reports' | 'ai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  at: string;
  context?: AssistantContext;
  suggestions?: string[];
}

export interface AppSnapshot {
  equipment: Equipment[];
  workOrders: WorkOrder[];
  pms: PMPlan[];
  parts: SparePart[];
  users: User[];
  context: AssistantContext;
  selectedItem?: Equipment | WorkOrder | PMPlan | SparePart | User;
}

// ====== Knowledge base — domain expertise ======

const TROUBLESHOOTING: Record<string, { causes: string[]; solutions: string[] }> = {
  'پمپ': {
    causes: [
      'نشتی آب‌بند مکانیکی یا گلند',
      'هواگیری ناقص و کاویتاسیون',
      'فرسایش پروانه (impeller)',
      'یاتاقان (bearing) فرسوده',
      'عدم تراز محور پمپ-موتور',
      'مسدود شدن فیلتر مکش',
    ],
    solutions: [
      'بازرسی و تعویض آب‌بند مکانیکی هر ۶ ماه',
      'هواگیری کامل سیستم قبل از راه‌اندازی',
      'بازرسی پروانه برای فرسایش و خوردگی',
      'گریس‌کاری منظم یاتاقان‌ها (هر ۵۰۰ ساعت کارکرد)',
      'انجام Alignment با Laser Alignment Tool',
      'تمیزکاری فیلتر مکش هر هفته',
    ],
  },
  'موتور': {
    causes: [
      'گرم شدن بیش از حد سیم‌پیچ',
      'یاتاقان موتور آسیب‌دیده',
      'عدم بالانس روتور',
      'افت ولتاژ یا عدم تعادل فاز',
      'لرزش بیش از حد',
    ],
    solutions: [
      'اندازه‌گیری دمای سیم‌پیچ با ترموگرافی',
      'تست مقاومت عایقی (Megger Test) هر ۶ ماه',
      'بالانس روتور با Vibration Analyzer',
      'بررسی ولتاژ سه فاز و عدم تعادل (≤ ۲٪)',
      'تحلیل لرزش (ISO 10816) — هشدار > 4.5 mm/s',
    ],
  },
  'گیربکس': {
    causes: [
      'افت سطح روغن یا روغن آلوده',
      'فرسایش دندانه‌های چرخ‌دنده',
      'یاتاقان داخلی آسیب‌دیده',
      'بار بیش از حد ظرفیت',
    ],
    solutions: [
      'تعویض روغن هر ۵۰۰۰ ساعت یا طبق توصیه سازنده',
      'آنالیز روغن (Oil Analysis) هر ۳ ماه',
      'بازرسی نشتی روزانه',
      'بررسی صدا و لرزش با ابزار حرفه‌ای',
    ],
  },
  'کمپرسور': {
    causes: [
      'فیلتر هوا مسدود',
      'افت روغن یا روغن نامناسب',
      'نشتی هوا در سیستم',
      'سوپاپ یک‌طرفه معیوب',
      'دمای زیاد محفظه فشار',
    ],
    solutions: [
      'تعویض فیلتر هوا هر ۲۰۰۰ ساعت',
      'بررسی روزانه سطح روغن',
      'تست نشتی با Ultrasonic Detector',
      'بازرسی سوپاپ‌ها هر ۶ ماه',
      'نظافت کولر بین مرحله‌ای',
    ],
  },
  'کنتاکتور': {
    causes: [
      'جرقه و سوختگی کنتاکت‌ها',
      'بوبین سوخته',
      'گرد و غبار روی هسته',
      'استارت‌های مکرر',
    ],
    solutions: [
      'بازرسی کنتاکت‌ها هر ۳ ماه',
      'اندازه‌گیری مقاومت بوبین',
      'تمیزکاری با هوای فشرده خشک',
      'بررسی مدار فرمان برای جلوگیری از Hunting',
    ],
  },
  'میکسر': {
    causes: [
      'افت کیفیت مخلوط شدن مواد',
      'گرم شدن بیش از حد',
      'سر و صدای غیرعادی',
      'نشتی در seal دور محور',
      'افت فشار MDI/Polyol',
    ],
    solutions: [
      'کالیبراسیون سنسورهای دما و فشار',
      'تنظیم نسبت اختلاط با فلومتر',
      'بازرسی mechanical seal',
      'بررسی پمپ‌های تغذیه MDI و پلیول',
      'تمیزکاری head میکسر طبق دستورالعمل',
    ],
  },
  'فوم': {
    causes: [
      'کیفیت پایین فوم خروجی (دانسیته نامناسب)',
      'حباب‌های نامنظم',
      'سفت شدن دیرتر/زودتر از حد معمول',
      'رنگ نامناسب',
    ],
    solutions: [
      'بررسی نسبت اختلاط Isocyanate به Polyol',
      'کنترل دمای مواد ورودی (۲۰-۲۵°C)',
      'بررسی کیفیت کاتالیست و افزودنی‌ها',
      'تنظیم سرعت کانوایر',
      'پاکسازی نازل‌ها از باقیمانده مواد',
    ],
  },
  'دیگ بخار': {
    causes: [
      'رسوب در لوله‌ها',
      'افت کیفیت آب تغذیه',
      'سوپاپ ایمنی معیوب',
      'مشعل ناتنظیم',
    ],
    solutions: [
      'Blow-down روزانه طبق برنامه',
      'تست آب هر شیفت (سختی، pH، TDS)',
      'تست سالیانه سوپاپ‌های ایمنی',
      'تنظیم نسبت هوا/سوخت برای راندمان بهینه',
    ],
  },
  'چیلر': {
    causes: [
      'گرفتگی کندانسور',
      'نشتی مبرد',
      'فیلتر هوا کثیف',
      'ترموستات خراب',
    ],
    solutions: [
      'شستشوی کندانسور هر ۳ ماه',
      'تست نشتی با Refrigerant Leak Detector',
      'تعویض فیلترها طبق برنامه',
      'کالیبراسیون سنسورهای دما',
    ],
  },
};

const KEYWORDS_MAP: Record<string, string[]> = {
  'پمپ': ['pump', 'پمپ', 'نشتی', 'فشار', 'پروانه', 'impeller', 'mdi'],
  'موتور': ['motor', 'موتور', 'سیم‌پیچ', 'یاتاقان', 'بالانس', 'لرزش', 'vibration'],
  'گیربکس': ['gearbox', 'گیربکس', 'چرخ‌دنده', 'gear', 'دنده'],
  'کمپرسور': ['compressor', 'کمپرسور', 'هوای فشرده', 'atlas'],
  'کنتاکتور': ['contactor', 'کنتاکتور', 'بوبین', 'کنتاکت'],
  'میکسر': ['mixer', 'میکسر', 'mixing', 'head'],
  'فوم': ['foam', 'فوم', 'دانسیته', 'بسپار', 'پلی‌اورتان', 'polyurethane'],
  'دیگ بخار': ['boiler', 'دیگ', 'بخار', 'steam'],
  'چیلر': ['chiller', 'چیلر', 'سرمایش', 'مبرد'],
};

function detectTopic(text: string): string | null {
  const t = text.toLowerCase();
  for (const [topic, keywords] of Object.entries(KEYWORDS_MAP)) {
    if (keywords.some(k => t.includes(k.toLowerCase()))) return topic;
  }
  return null;
}

// ====== Intent detection ======

type Intent = 'troubleshoot' | 'metric_query' | 'how_to' | 'status' | 'stat' | 'recommend' | 'list' | 'general';

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/(خرابی|مشکل|عیب|نشتی|سر و صدا|لرزش|گرم|سوختن|چرا|چطور.*رفع|fault|broken|failure|issue|problem)/i.test(t)) return 'troubleshoot';
  if (/(چند|تعداد|چه‌قدر|مقدار|amount|how many|count)/i.test(t)) return 'stat';
  if (/(mtbf|mttr|oee|availability|دسترس|انطباق|kpi|شاخص|metric|معیار)/i.test(t)) return 'metric_query';
  if (/(چگونه|چطور|روش|how|راهنمایی|آموزش|تعمیر کن|repair|fix)/i.test(t)) return 'how_to';
  if (/(وضعیت|چطوره|چجوریه|status|state|how is)/i.test(t)) return 'status';
  if (/(پیشنهاد|توصیه|بهبود|recommend|suggest|improve)/i.test(t)) return 'recommend';
  if (/(لیست|نمایش|list|show)/i.test(t)) return 'list';
  return 'general';
}

// ====== Response builder ======

export interface AssistantResponse {
  text: string;
  blocks?: Array<{ type: 'list' | 'metric' | 'warning' | 'success' | 'code'; title?: string; items?: string[]; value?: string }>;
  suggestions?: string[];
}

export function answerQuestion(question: string, snap: AppSnapshot): AssistantResponse {
  const intent = detectIntent(question);
  const topic = detectTopic(question);
  const lowerQ = question.toLowerCase();

  // Troubleshooting questions
  if (intent === 'troubleshoot' && topic) {
    const t = TROUBLESHOOTING[topic];
    if (t) {
      return {
        text: `برای رفع مشکل **${topic}**، علل احتمالی و راهکارها را بررسی می‌کنم:`,
        blocks: [
          { type: 'list', title: '🔍 علل احتمالی', items: t.causes },
          { type: 'list', title: '🛠 راهکارهای پیشنهادی', items: t.solutions },
          { type: 'warning', title: '⚠ توصیه ایمنی', value: 'قبل از هرگونه اقدام، تجهیز را کاملاً ایزوله کنید (LOTO) و از تجهیزات حفاظت فردی استفاده کنید.' },
        ],
        suggestions: [
          `چه قطعاتی برای تعمیر ${topic} نیاز دارم؟`,
          `چه‌قدر زمان می‌برد؟`,
          `سابقه تعمیر این ${topic} را نشان بده`,
        ],
      };
    }
  }

  // Metric queries
  if (intent === 'metric_query') {
    const metrics = computeAllPMMetrics(snap.workOrders, snap.pms, snap.equipment, snap.parts);
    if (/mtbf/i.test(lowerQ)) {
      const m = metrics.find(x => x.key === 'mtbf')!;
      const a = analyzeMetric(m);
      return {
        text: `📊 **MTBF (میانگین زمان بین خرابی‌ها):** ${m.value.toFixed(0)} ساعت\n\n${a.diagnosis}`,
        blocks: [
          { type: 'metric', title: 'مقدار', value: `${m.value.toFixed(0)} ${m.unit}` },
          { type: 'metric', title: 'هدف', value: `${m.target} ${m.unit}` },
          { type: 'metric', title: 'فرمول', value: m.formula },
          { type: 'list', title: 'توصیه‌ها', items: a.recommendations },
        ],
      };
    }
    if (/mttr/i.test(lowerQ)) {
      const m = metrics.find(x => x.key === 'mttr')!;
      const a = analyzeMetric(m);
      return {
        text: `🔧 **MTTR (میانگین زمان تعمیر):** ${m.value.toFixed(1)} ساعت\n\n${a.diagnosis}`,
        blocks: [
          { type: 'metric', title: 'مقدار', value: `${m.value.toFixed(1)} ${m.unit}` },
          { type: 'metric', title: 'هدف', value: `≤ ${m.target} ${m.unit}` },
          { type: 'list', title: 'توصیه‌ها', items: a.recommendations },
        ],
      };
    }
    if (/(انطباق|compliance)/i.test(lowerQ)) {
      const m = metrics.find(x => x.key === 'pm_compliance')!;
      const a = analyzeMetric(m);
      return {
        text: `📋 **انطباق PM:** ${m.value.toFixed(0)}٪\n\n${a.diagnosis}`,
        blocks: [
          { type: 'metric', title: 'مقدار فعلی', value: `${m.value.toFixed(0)}٪` },
          { type: 'metric', title: 'هدف SMRP', value: '≥ ۹۰٪' },
          { type: 'list', title: 'اقدامات پیشنهادی', items: a.recommendations },
        ],
      };
    }
    // Generic — top 5 metrics
    return {
      text: `📊 **شاخص‌های کلیدی نگهداری و تعمیرات:**`,
      blocks: [
        { type: 'list', title: 'پنج شاخص اصلی', items: metrics.slice(0, 5).map(m => `${m.label} (${m.labelEn}): ${m.value.toFixed(1)} ${m.unit} ${m.status === 'excellent' ? '✓ عالی' : m.status === 'good' ? '✓ خوب' : m.status === 'fair' ? '⚠ متوسط' : '✗ ضعیف'}`) },
      ],
      suggestions: ['MTBF را توضیح بده', 'MTTR چطوره؟', 'انطباق PM چقدر است؟'],
    };
  }

  // Status queries
  if (intent === 'status') {
    const openWO = snap.workOrders.filter(w => !['completed', 'closed'].includes(w.status)).length;
    const overdue = snap.workOrders.filter(w => new Date(w.plannedEnd) < new Date() && !['completed', 'closed'].includes(w.status)).length;
    const critical = snap.equipment.filter(e => e.healthScore < 60).length;
    const lowStock = snap.parts.filter(p => p.stock < p.min).length;

    return {
      text: `📈 **وضعیت کلی کارخانه:**`,
      blocks: [
        { type: 'list', title: 'خلاصه عملیات', items: [
          `🔧 دستور کار باز: ${openWO}`,
          `⚠ معوقات: ${overdue}`,
          `🚨 تجهیزات بحرانی: ${critical}`,
          `📦 کمبود انبار: ${lowStock} قلم`,
        ]},
        ...(overdue > 0 ? [{ type: 'warning' as const, title: 'هشدار', value: `${overdue} دستور کار از موعد گذشته است — رسیدگی فوری توصیه می‌شود.` }] : []),
        ...(critical === 0 && overdue === 0 ? [{ type: 'success' as const, title: 'خبر خوب', value: 'تمامی تجهیزات بحرانی در وضعیت سالم هستند ✓' }] : []),
      ],
      suggestions: ['دستور کارهای معوق را نمایش بده', 'کدام تجهیزات بحرانی هستند؟', 'چه قطعاتی کم است؟'],
    };
  }

  // Stat questions (counts)
  if (intent === 'stat') {
    if (/(تجهیز|equipment|asset)/i.test(lowerQ)) {
      const total = snap.equipment.length;
      const active = snap.equipment.filter(e => e.status === 'active').length;
      return {
        text: `📊 در حال حاضر **${total} تجهیز** در سیستم ثبت شده که **${active} مورد** فعال هستند.`,
        blocks: [{ type: 'list', items: [
          `کل: ${total}`,
          `فعال: ${active}`,
          `بحرانی: ${snap.equipment.filter(e => e.criticality === 'critical').length}`,
          `در تعمیر: ${snap.equipment.filter(e => e.status === 'maintenance').length}`,
        ]}],
      };
    }
    if (/(دستور کار|wo|work order)/i.test(lowerQ)) {
      return {
        text: `📋 **آمار دستور کارها:**`,
        blocks: [{ type: 'list', items: [
          `کل: ${snap.workOrders.length}`,
          `باز: ${snap.workOrders.filter(w => !['completed', 'closed'].includes(w.status)).length}`,
          `در حال انجام: ${snap.workOrders.filter(w => w.status === 'in_progress').length}`,
          `تکمیل‌شده: ${snap.workOrders.filter(w => w.status === 'completed' || w.status === 'closed').length}`,
        ]}],
      };
    }
    if (/(پرسنل|نفر|user|technician)/i.test(lowerQ)) {
      return {
        text: `👥 **آمار پرسنل:** ${snap.users.length} نفر در سیستم`,
        blocks: [{ type: 'list', items: [
          `کل: ${snap.users.length}`,
          `فعال: ${snap.users.filter(u => u.active).length}`,
          `تکنسین: ${snap.users.filter(u => u.role === 'technician').length}`,
          `مدیر/سرپرست: ${snap.users.filter(u => u.role === 'manager' || u.role === 'supervisor').length}`,
        ]}],
      };
    }
  }

  // Recommendations
  if (intent === 'recommend') {
    const metrics = computeAllPMMetrics(snap.workOrders, snap.pms, snap.equipment, snap.parts);
    const weak = metrics.filter(m => m.status === 'poor' || m.status === 'fair').slice(0, 3);
    const recs = weak.flatMap(m => analyzeMetric(m).recommendations.slice(0, 2));
    return {
      text: `💡 **توصیه‌های هوشمند برای بهبود:**`,
      blocks: [
        { type: 'list', title: 'اولویت‌های اصلاحی', items: recs.length > 0 ? recs : [
          'حفظ روند فعلی و پایش مستمر',
          'به‌روزرسانی برنامه PM فصلی',
          'آموزش تکنسین‌ها در تکنیک‌های Predictive',
        ]},
      ],
    };
  }

  // List questions
  if (intent === 'list') {
    if (/(تجهیز.*بحرانی|critical equipment)/i.test(lowerQ)) {
      const list = snap.equipment.filter(e => e.healthScore < 70).map(e => `${e.code} — ${e.name} (سلامت ${e.healthScore}/۱۰۰)`);
      return {
        text: `🚨 **تجهیزات با وضعیت بحرانی:**`,
        blocks: [{ type: 'list', items: list.length > 0 ? list : ['هیچ تجهیز بحرانی یافت نشد ✓'] }],
      };
    }
    if (/(معوق|overdue)/i.test(lowerQ)) {
      const list = snap.workOrders.filter(w => new Date(w.plannedEnd) < new Date() && !['completed', 'closed'].includes(w.status))
        .map(w => `${w.number} — ${w.title} (اولویت: ${w.priority})`);
      return {
        text: `⏰ **دستور کارهای معوق:**`,
        blocks: [{ type: 'list', items: list.length > 0 ? list : ['هیچ دستور کار معوقی نیست ✓'] }],
      };
    }
    if (/(کمبود|stockout|low stock)/i.test(lowerQ)) {
      const list = snap.parts.filter(p => p.stock < p.min).map(p => `${p.code} — ${p.name} (موجودی: ${p.stock}, حداقل: ${p.min})`);
      return {
        text: `📦 **قطعات با موجودی پایین:**`,
        blocks: [{ type: 'list', items: list.length > 0 ? list : ['تمام قطعات موجودی کافی دارند ✓'] }],
      };
    }
  }

  // How-to / general fallback with context awareness
  if (intent === 'how_to' || topic) {
    if (topic) {
      const t = TROUBLESHOOTING[topic];
      return {
        text: `🛠 **راهنمای ${topic}:**`,
        blocks: t ? [
          { type: 'list', title: 'علل شایع', items: t.causes.slice(0, 4) },
          { type: 'list', title: 'راهکارها', items: t.solutions.slice(0, 4) },
        ] : [{ type: 'warning', value: `اطلاعات تخصصی برای «${topic}» در حال تکمیل است.` }],
        suggestions: [`خرابی ${topic}`, `سابقه ${topic} را نشان بده`],
      };
    }
  }

  // Default fallback — context-aware suggestions
  const ctxHints: Record<AssistantContext, { text: string; suggestions: string[] }> = {
    global: {
      text: '👋 سلام! من دستیار هوش مصنوعی **بسپارفوم غرب** هستم. می‌توانم در زمینه‌های زیر کمک کنم:',
      suggestions: ['وضعیت کلی کارخانه چطوره؟', 'MTBF چقدر است؟', 'دستور کارهای معوق', 'تجهیزات بحرانی'],
    },
    dashboard: {
      text: '📊 در داشبورد هستید. می‌توانم شاخص‌های کلیدی را توضیح دهم.',
      suggestions: ['شاخص‌های اصلی چیست؟', 'وضعیت چطور است؟', 'پیشنهاد بهبود'],
    },
    equipment: {
      text: '🏭 در بخش تجهیزات. می‌توانم درباره خرابی‌ها، سلامت و تعمیرات کمک کنم.',
      suggestions: ['تجهیزات بحرانی', 'چطور خرابی پمپ را رفع کنم؟', 'سلامت میکسر چطوره؟'],
    },
    workorders: {
      text: '🔧 در بخش دستور کارها. می‌توانم در تحلیل و تخصیص کمک کنم.',
      suggestions: ['دستور کارهای معوق', 'بار کاری تیم', 'دستور کارهای اضطراری'],
    },
    pm: {
      text: '📅 در بخش PM. می‌توانم شاخص‌ها و انطباق را تحلیل کنم.',
      suggestions: ['انطباق PM چقدره؟', 'PMهای سررسید', 'بهبود PM'],
    },
    inventory: {
      text: '📦 در بخش انبار. می‌توانم کمبودها و پیش‌بینی مصرف را تحلیل کنم.',
      suggestions: ['قطعات کم‌موجود', 'پیش‌بینی مصرف', 'بهینه‌سازی انبار'],
    },
    personnel: {
      text: '👥 در بخش پرسنل. می‌توانم در ارزیابی عملکرد کمک کنم.',
      suggestions: ['برترین تکنسین', 'بار کاری تیم', 'نیازهای آموزشی'],
    },
    planning: {
      text: '📆 در مرکز برنامه‌ریزی. می‌توانم در زمان‌بندی بهینه کمک کنم.',
      suggestions: ['تداخل زمانی', 'ظرفیت تیم', 'برنامه شیفت'],
    },
    reports: {
      text: '📈 در بخش گزارش‌ها. می‌توانم تحلیل‌های تخصصی ارائه دهم.',
      suggestions: ['گزارش ماهانه', 'روند هزینه‌ها', 'شاخص‌های عملکرد'],
    },
    ai: {
      text: '🤖 در مرکز هوش مصنوعی. می‌توانم بینش‌ها را توضیح دهم.',
      suggestions: ['مهم‌ترین هشدارها', 'فرصت‌های بهبود', 'پیش‌بینی خرابی'],
    },
  };

  const hint = ctxHints[snap.context] ?? ctxHints.global;
  return {
    text: hint.text,
    blocks: [
      { type: 'list', title: '🎯 می‌توانم در این موارد کمک کنم:', items: [
        '🔍 تشخیص علل خرابی تجهیزات (پمپ، موتور، گیربکس، کمپرسور، میکسر و...)',
        '📊 توضیح شاخص‌های KPI (MTBF، MTTR، انطباق PM و...)',
        '💡 ارائه راهکار برای بهبود وضعیت',
        '📈 تحلیل آمار دستور کارها، انبار و پرسنل',
        '⚠ هشدار درباره مشکلات بحرانی',
      ]},
    ],
    suggestions: hint.suggestions,
  };
}
