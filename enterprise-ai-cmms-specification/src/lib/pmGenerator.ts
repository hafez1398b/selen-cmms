// PM Plan Generator — automatically generate maintenance plans based on equipment type
// Following ISO 55000, manufacturer best practices, and industry standards
import type { Equipment } from './types';

export type PMFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
export type SkillLevel = 'اپراتور' | 'تکنسین' | 'تکنسین ارشد' | 'متخصص' | 'پیمانکار تخصصی';

export interface PMTask {
  id: string;
  activity: string;
  frequency: PMFrequency;
  duration: number; // minutes
  skillLevel: SkillLevel;
  acceptanceCriteria: string;
  tools: string[];
  spareParts: string[];
  safetyNotes?: string;
}

export interface EquipmentPMPlan {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  tasks: PMTask[];
  totalAnnualHours: number;
  estimatedAnnualCost: string;
}

// Standard PM templates by equipment type — based on ISO 55000 & industry best practices
const PM_TEMPLATES: { match: (eq: Equipment) => boolean; type: string; tasks: Omit<PMTask, 'id'>[] }[] = [
  // ============ کانوایر / Conveyor ============
  {
    match: eq => /کانوایر|conveyor/i.test(eq.name),
    type: 'کانوایر',
    tasks: [
      {
        activity: 'بازرسی چشمی نوار، غلتک‌ها و سازه',
        frequency: 'daily', duration: 15, skillLevel: 'اپراتور',
        acceptanceCriteria: 'بدون پارگی نوار، بدون لرزش غیرعادی، بدون صدای اضافی',
        tools: ['چراغ‌قوه', 'چک‌لیست'],
        spareParts: [],
        safetyNotes: 'قبل از بازرسی نزدیک، دستگاه خاموش و LOTO شود',
      },
      {
        activity: 'پاک‌سازی نوار و زیر کانوایر از خرده مواد',
        frequency: 'weekly', duration: 30, skillLevel: 'اپراتور',
        acceptanceCriteria: 'سطح نوار و زیر آن تمیز، بدون باقی‌مانده مواد',
        tools: ['جارو', 'پارچه تمیز', 'مکنده صنعتی'],
        spareParts: [],
      },
      {
        activity: 'گریس‌کاری یاتاقان‌های غلتک‌ها',
        frequency: 'monthly', duration: 45, skillLevel: 'تکنسین',
        acceptanceCriteria: 'تمام نقاط گریس‌خور تأمین شده، بدون نشتی',
        tools: ['پمپ گریس', 'دستمال'],
        spareParts: ['گریس EP2'],
      },
      {
        activity: 'بازرسی و تنظیم تنش نوار',
        frequency: 'monthly', duration: 30, skillLevel: 'تکنسین',
        acceptanceCriteria: 'تنش طبق دستورالعمل سازنده، بدون لغزش',
        tools: ['آچار', 'گیج تنش'],
        spareParts: [],
      },
      {
        activity: 'بازرسی موتور، گیربکس و کوپلینگ',
        frequency: 'quarterly', duration: 60, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'دمای موتور < ۷۰°C، صدا و لرزش عادی، سطح روغن گیربکس صحیح',
        tools: ['ترموگرافی', 'لرزش‌سنج', 'گیج روغن'],
        spareParts: [],
      },
      {
        activity: 'تعویض روغن گیربکس و بازرسی کلی',
        frequency: 'annual', duration: 120, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'روغن جدید، تمام بستی‌ها سفت، آب‌بندها سالم',
        tools: ['آچار', 'ظرف زهکشی', 'قیف'],
        spareParts: ['روغن گیربکس ISO 220', 'واشر'],
      },
    ],
  },
  // ============ کولر آبی / Evaporative Cooler ============
  {
    match: eq => /کولر|cooler/i.test(eq.name),
    type: 'کولر آبی',
    tasks: [
      {
        activity: 'بررسی سطح آب مخزن و عملکرد فلوتر',
        frequency: 'daily', duration: 10, skillLevel: 'اپراتور',
        acceptanceCriteria: 'سطح آب صحیح، فلوتر بدون گیر',
        tools: [],
        spareParts: [],
      },
      {
        activity: 'تمیزکاری فیلتر و پدها',
        frequency: 'weekly', duration: 30, skillLevel: 'اپراتور',
        acceptanceCriteria: 'بدون رسوب، عبور آب یکنواخت',
        tools: ['آب فشار', 'برس نرم'],
        spareParts: [],
      },
      {
        activity: 'تمیزکاری مخزن و رفع رسوب',
        frequency: 'monthly', duration: 60, skillLevel: 'تکنسین',
        acceptanceCriteria: 'مخزن کاملاً تمیز، بدون رسوب آهکی',
        tools: ['مواد رسوب‌بر', 'برس'],
        spareParts: ['مواد ضدرسوب'],
      },
      {
        activity: 'بازرسی پمپ آب و موتور دمنده',
        frequency: 'quarterly', duration: 45, skillLevel: 'تکنسین',
        acceptanceCriteria: 'پمپ بدون نشتی، موتور بدون صدای غیرعادی',
        tools: ['مولتی‌متر', 'آچار'],
        spareParts: [],
      },
      {
        activity: 'تعویض پدهای سلولزی',
        frequency: 'annual', duration: 90, skillLevel: 'تکنسین',
        acceptanceCriteria: 'پدهای جدید نصب‌شده، آب‌پاش بدون انسداد',
        tools: ['پیچ‌گوشتی'],
        spareParts: ['پد سلولزی'],
      },
    ],
  },
  // ============ کمپرسور / Compressor ============
  {
    match: eq => /کمپرسور|compressor/i.test(eq.name),
    type: 'کمپرسور هوا',
    tasks: [
      {
        activity: 'بررسی سطح روغن و فشار خروجی',
        frequency: 'daily', duration: 10, skillLevel: 'اپراتور',
        acceptanceCriteria: 'سطح روغن در محدوده min-max، فشار طبق نامینال',
        tools: ['گیج روغن'],
        spareParts: [],
      },
      {
        activity: 'تخلیه آب از مخزن و فیلترها',
        frequency: 'daily', duration: 5, skillLevel: 'اپراتور',
        acceptanceCriteria: 'تمام آب جمع‌شده تخلیه شود',
        tools: [],
        spareParts: [],
      },
      {
        activity: 'بازرسی فیلتر هوای ورودی',
        frequency: 'weekly', duration: 15, skillLevel: 'اپراتور',
        acceptanceCriteria: 'فیلتر تمیز، بدون انسداد',
        tools: ['هوای فشرده'],
        spareParts: [],
      },
      {
        activity: 'تست نشتی هوا با اسپری کف صابون',
        frequency: 'monthly', duration: 45, skillLevel: 'تکنسین',
        acceptanceCriteria: 'بدون نشتی در اتصالات، شیرها و آب‌بندها',
        tools: ['اسپری کف', 'Ultrasonic Detector'],
        spareParts: [],
      },
      {
        activity: 'تعویض فیلتر هوای ورودی و فیلتر روغن',
        frequency: 'quarterly', duration: 60, skillLevel: 'تکنسین',
        acceptanceCriteria: 'فیلترهای جدید نصب شده، گسکت‌ها سالم',
        tools: ['آچار فیلتر'],
        spareParts: ['فیلتر هوا', 'فیلتر روغن'],
      },
      {
        activity: 'تعویض روغن کمپرسور و بازرسی شیر یک‌طرفه',
        frequency: 'semiannual', duration: 120, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'روغن جدید با نوع صحیح، فشار خروجی نرمال',
        tools: ['ظرف تخلیه', 'قیف'],
        spareParts: ['روغن کمپرسور', 'واشر آب‌بند'],
        safetyNotes: 'مخزن کاملاً تخلیه فشار شود',
      },
      {
        activity: 'اورهال کامل و تست عملکرد توسط نماینده سازنده',
        frequency: 'annual', duration: 480, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گزارش فنی سالیانه + تأیید عملکرد',
        tools: ['ابزار تخصصی نماینده'],
        spareParts: ['کیت اورهال سالیانه'],
      },
    ],
  },
  // ============ چیلر / Chiller ============
  {
    match: eq => /چیلر|chiller/i.test(eq.name),
    type: 'چیلر',
    tasks: [
      {
        activity: 'بررسی دما، فشار مبرد و سطح آب',
        frequency: 'daily', duration: 10, skillLevel: 'اپراتور',
        acceptanceCriteria: 'دمای خروجی طبق set-point، فشار در محدوده مجاز',
        tools: ['ترموگرافی'],
        spareParts: [],
      },
      {
        activity: 'تمیزکاری فیلترهای آب',
        frequency: 'weekly', duration: 30, skillLevel: 'تکنسین',
        acceptanceCriteria: 'فیلتر تمیز، جریان آب یکنواخت',
        tools: ['آچار'],
        spareParts: [],
      },
      {
        activity: 'بازرسی کندانسور و تمیزکاری',
        frequency: 'monthly', duration: 60, skillLevel: 'تکنسین',
        acceptanceCriteria: 'کندانسور بدون رسوب، تبادل حرارتی بهینه',
        tools: ['شوینده شیمیایی', 'برس'],
        spareParts: ['مواد ضدرسوب'],
      },
      {
        activity: 'تست نشتی مبرد با Leak Detector',
        frequency: 'quarterly', duration: 45, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'بدون نشتی شناسایی‌شده',
        tools: ['Refrigerant Leak Detector'],
        spareParts: [],
        safetyNotes: 'تهویه مناسب محیط ضروری',
      },
      {
        activity: 'سرویس کامل سالیانه + کالیبراسیون سنسورها',
        frequency: 'annual', duration: 240, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی سرویس + گزارش کالیبراسیون',
        tools: ['ابزار سرویس چیلر'],
        spareParts: ['روغن کمپرسور چیلر', 'فیلتر درایر'],
      },
    ],
  },
  // ============ دیزل ژنراتور / Diesel Generator ============
  {
    match: eq => /ژنراتور|generator|cummins/i.test(eq.name) || /cummins/i.test(eq.model),
    type: 'دیزل ژنراتور',
    tasks: [
      {
        activity: 'بررسی سطح روغن، آب رادیاتور و سوخت',
        frequency: 'weekly', duration: 15, skillLevel: 'تکنسین',
        acceptanceCriteria: 'تمام سطوح در محدوده مجاز',
        tools: ['گیج روغن'],
        spareParts: [],
      },
      {
        activity: 'تست راه‌اندازی بدون بار (No-Load Test)',
        frequency: 'weekly', duration: 30, skillLevel: 'تکنسین',
        acceptanceCriteria: 'استارت در ۳ ثانیه، عملکرد ۱۰ دقیقه بدون مشکل',
        tools: ['دفترچه ثبت'],
        spareParts: [],
      },
      {
        activity: 'بررسی باتری استارت و ترمینال‌ها',
        frequency: 'monthly', duration: 20, skillLevel: 'تکنسین',
        acceptanceCriteria: 'ولتاژ ≥ ۱۲٫۶V، ترمینال‌ها تمیز و سفت',
        tools: ['مولتی‌متر'],
        spareParts: [],
      },
      {
        activity: 'تست بار کامل (Full-Load Test)',
        frequency: 'quarterly', duration: 90, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'عملکرد در ۱۰۰٪ بار به مدت ۳۰ دقیقه بدون افت ولتاژ',
        tools: ['Load Bank', 'مولتی‌متر'],
        spareParts: [],
        safetyNotes: 'تهویه و خروج گاز اگزوز کنترل شود',
      },
      {
        activity: 'تعویض روغن، فیلتر روغن، فیلتر سوخت و فیلتر هوا',
        frequency: 'semiannual', duration: 120, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'تمام فیلترها و روغن جدید نصب شده',
        tools: ['آچار فیلتر', 'ظرف تخلیه'],
        spareParts: ['روغن موتور 15W-40', 'فیلتر روغن', 'فیلتر سوخت', 'فیلتر هوا'],
      },
      {
        activity: 'سرویس کامل سالیانه توسط نماینده',
        frequency: 'annual', duration: 360, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی سرویس + گزارش آنالیز روغن',
        tools: ['ابزار تخصصی Cummins'],
        spareParts: ['کیت سرویس سالیانه'],
      },
    ],
  },
  // ============ سیستم آتش‌نشانی / Fire Foam System ============
  {
    match: eq => /آتش‌نشانی|fire/i.test(eq.name),
    type: 'سیستم آتش‌نشانی',
    tasks: [
      {
        activity: 'بازرسی فشار مخزن و آماده‌بکار بودن',
        frequency: 'weekly', duration: 15, skillLevel: 'تکنسین',
        acceptanceCriteria: 'فشار طبق نامینال، شیرها در وضعیت صحیح',
        tools: ['چک‌لیست'],
        spareParts: [],
      },
      {
        activity: 'تست عملکرد پمپ آتش‌نشانی',
        frequency: 'monthly', duration: 45, skillLevel: 'تکنسین',
        acceptanceCriteria: 'پمپ به‌درستی استارت می‌شود، دبی طبق طراحی',
        tools: ['فلومتر', 'فشارسنج'],
        spareParts: [],
      },
      {
        activity: 'تست سنسورهای دود و حرارت',
        frequency: 'monthly', duration: 60, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: '۱۰۰٪ سنسورها فعال و گزارش به مرکز کنترل',
        tools: ['اسپری تست', 'حرارت‌سنج'],
        spareParts: [],
      },
      {
        activity: 'بازرسی همه نازل‌ها و خطوط لوله',
        frequency: 'quarterly', duration: 120, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'بدون انسداد، بدون خوردگی، اتصالات سفت',
        tools: ['آینه بازرسی', 'تستر فشار'],
        spareParts: ['نازل‌های یدکی'],
      },
      {
        activity: 'تست سالیانه عملکرد کامل سیستم + گواهی HSE',
        frequency: 'annual', duration: 240, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'صدور گواهی استاندارد NFPA + تأیید HSE',
        tools: ['ابزار تخصصی'],
        spareParts: ['فوم تولید کف'],
        safetyNotes: 'هماهنگی با تولید برای پنجره خاموشی',
      },
    ],
  },
  // ============ دیگ بخار/آب گرم / Boiler ============
  {
    match: eq => /دیگ|boiler|بخار/i.test(eq.name),
    type: 'دیگ بخار/آب گرم',
    tasks: [
      {
        activity: 'تست آب تغذیه (pH، سختی، TDS)',
        frequency: 'daily', duration: 15, skillLevel: 'تکنسین',
        acceptanceCriteria: 'pH=10-11، سختی<2 ppm، TDS<3500 ppm',
        tools: ['کیت تست آب'],
        spareParts: ['مواد شیمیایی آب‌بندی'],
      },
      {
        activity: 'Blow-down (تخلیه گل)',
        frequency: 'daily', duration: 10, skillLevel: 'اپراتور',
        acceptanceCriteria: 'تخلیه طبق برنامه',
        tools: [],
        spareParts: [],
        safetyNotes: 'احتیاط در برابر بخار داغ',
      },
      {
        activity: 'بازرسی مشعل و تنظیم نسبت هوا/سوخت',
        frequency: 'weekly', duration: 60, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'بازده احتراق > ۸۵٪، CO < 100 ppm',
        tools: ['آنالیزور گازهای احتراق'],
        spareParts: [],
      },
      {
        activity: 'تست سوپاپ ایمنی',
        frequency: 'monthly', duration: 30, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'سوپاپ در فشار set-point باز شود',
        tools: ['فشارسنج'],
        spareParts: [],
      },
      {
        activity: 'بازرسی داخلی لوله‌ها و رفع رسوب',
        frequency: 'semiannual', duration: 240, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'لوله‌ها بدون رسوب آهکی > 1mm',
        tools: ['آندوسکوپ', 'ابزار رسوب‌برداری'],
        spareParts: ['مواد رسوب‌بر'],
      },
      {
        activity: 'تست هیدرواستاتیک سالیانه + گواهی استاندارد',
        frequency: 'annual', duration: 480, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'تست در ۱.۵ برابر فشار کاری + گواهی بازرسی',
        tools: ['پمپ تست', 'فشارسنج کالیبره'],
        spareParts: ['واشرها و آب‌بندها'],
      },
    ],
  },
  // ============ درب ریلی اتومات / Automatic Door ============
  {
    match: eq => /درب|door/i.test(eq.name),
    type: 'درب اتومات',
    tasks: [
      {
        activity: 'بازرسی عملکرد سنسورها و ریموت',
        frequency: 'weekly', duration: 15, skillLevel: 'اپراتور',
        acceptanceCriteria: 'باز/بسته شدن نرم و کامل',
        tools: ['ریموت'],
        spareParts: [],
      },
      {
        activity: 'تمیزکاری ریل و چرخ‌ها',
        frequency: 'monthly', duration: 30, skillLevel: 'تکنسین',
        acceptanceCriteria: 'ریل تمیز، بدون مانع',
        tools: ['برس', 'پارچه'],
        spareParts: [],
      },
      {
        activity: 'روان‌کاری چرخ‌ها و یاتاقان‌ها',
        frequency: 'quarterly', duration: 30, skillLevel: 'تکنسین',
        acceptanceCriteria: 'حرکت بدون اصطکاک و صدا',
        tools: ['روغن‌دان'],
        spareParts: ['روغن SAE 30'],
      },
      {
        activity: 'بازرسی موتور، کنترل‌بُرد و باتری پشتیبان',
        frequency: 'semiannual', duration: 60, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'موتور بدون صدای غیرعادی، باتری ≥ ۸۰٪',
        tools: ['مولتی‌متر'],
        spareParts: [],
      },
    ],
  },
  // ============ لیفتراک / Forklift ============
  {
    match: eq => /لیفتراک|forklift/i.test(eq.name),
    type: 'لیفتراک',
    tasks: [
      {
        activity: 'بازرسی روزانه قبل از شروع کار (Pre-Shift)',
        frequency: 'daily', duration: 10, skillLevel: 'اپراتور',
        acceptanceCriteria: 'سطح روغن، آب رادیاتور، ترمز، چراغ‌ها، شاخک‌ها',
        tools: ['چک‌لیست بازرسی'],
        spareParts: [],
      },
      {
        activity: 'بررسی فشار باد لاستیک و ترک‌خوردگی',
        frequency: 'weekly', duration: 15, skillLevel: 'اپراتور',
        acceptanceCriteria: 'فشار طبق دستورالعمل سازنده',
        tools: ['فشارسنج'],
        spareParts: [],
      },
      {
        activity: 'بازرسی سیستم هیدرولیک و شاخک‌ها',
        frequency: 'monthly', duration: 45, skillLevel: 'تکنسین',
        acceptanceCriteria: 'بدون نشتی، حرکت نرم بالا و پایین',
        tools: ['آچار'],
        spareParts: [],
      },
      {
        activity: 'تعویض روغن هیدرولیک و فیلتر',
        frequency: 'semiannual', duration: 120, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'روغن جدید، فیلتر تعویض شده',
        tools: ['آچار فیلتر', 'پمپ روغن'],
        spareParts: ['روغن هیدرولیک', 'فیلتر هیدرولیک'],
      },
      {
        activity: 'سرویس کامل سالیانه + گواهی ایمنی',
        frequency: 'annual', duration: 240, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی ایمنی معتبر برای بهره‌برداری',
        tools: ['ابزار تخصصی'],
        spareParts: ['کیت سرویس سالیانه'],
      },
    ],
  },
  // ============ دستگاه برش اسفنج / Cutting Machine ============
  {
    match: eq => /برش|cutting|cut/i.test(eq.name),
    type: 'دستگاه برش',
    tasks: [
      {
        activity: 'بازرسی تیغ برش و رفع براده',
        frequency: 'daily', duration: 15, skillLevel: 'اپراتور',
        acceptanceCriteria: 'تیغ تیز، بدون شکستگی',
        tools: ['برس نرم'],
        spareParts: [],
        safetyNotes: 'دستکش ضد بُرش الزامی',
      },
      {
        activity: 'روان‌کاری ریل‌های حرکتی',
        frequency: 'weekly', duration: 20, skillLevel: 'تکنسین',
        acceptanceCriteria: 'حرکت نرم بدون لرزش',
        tools: ['روغن‌دان'],
        spareParts: ['روغن ریل'],
      },
      {
        activity: 'تنظیم زاویه و کالیبراسیون اندازه برش',
        frequency: 'monthly', duration: 45, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'دقت برش ± 0.5mm',
        tools: ['کولیس کالیبره', 'گیج'],
        spareParts: [],
      },
      {
        activity: 'تعویض/تیز کردن تیغ برش',
        frequency: 'quarterly', duration: 60, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'لبه تیغ کاملاً تیز، تست برش با نمونه',
        tools: ['سنگ تیزکن'],
        spareParts: ['تیغ یدکی'],
      },
      {
        activity: 'بازرسی موتور، گیربکس و سیستم ایمنی',
        frequency: 'annual', duration: 180, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی ایمنی + تست عملکرد',
        tools: ['ابزار تخصصی'],
        spareParts: ['کیت سرویس'],
      },
    ],
  },
  // ============ دستگاه تزریق پلی‌یورتان / PU Injection Machine ============
  {
    match: eq => /تزریق|injection|polyurethane|پلی‌یورتان/i.test(eq.name),
    type: 'دستگاه تزریق PU',
    tasks: [
      {
        activity: 'بررسی نسبت اختلاط Isocyanate / Polyol',
        frequency: 'daily', duration: 20, skillLevel: 'اپراتور',
        acceptanceCriteria: 'نسبت طبق فرمول، انحراف ≤ ۱٪',
        tools: ['فلومتر کالیبره'],
        spareParts: [],
      },
      {
        activity: 'تمیزکاری head میکسر',
        frequency: 'daily', duration: 30, skillLevel: 'تکنسین',
        acceptanceCriteria: 'head تمیز، بدون باقی‌مانده مواد',
        tools: ['حلال مخصوص'],
        spareParts: ['حلال شست‌وشو'],
      },
      {
        activity: 'بررسی پمپ‌های تغذیه MDI و Polyol',
        frequency: 'weekly', duration: 45, skillLevel: 'تکنسین',
        acceptanceCriteria: 'فشار خروجی ۱۸۰ bar، بدون نشتی',
        tools: ['فشارسنج'],
        spareParts: [],
      },
      {
        activity: 'بازرسی mechanical seal و آب‌بندها',
        frequency: 'monthly', duration: 60, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'بدون نشتی، آب‌بندها سالم',
        tools: ['ابزار تخصصی pump'],
        spareParts: ['mechanical seal', 'O-ring'],
      },
      {
        activity: 'کالیبراسیون سنسورهای دما و فشار',
        frequency: 'quarterly', duration: 90, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'دقت ± ۱°C و ± 2 bar',
        tools: ['کالیبراتور دما و فشار'],
        spareParts: [],
      },
      {
        activity: 'اورهال کامل + کالیبراسیون رسمی توسط نماینده',
        frequency: 'annual', duration: 720, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی کالیبراسیون معتبر یک‌ساله',
        tools: ['ابزار تخصصی MAMIX'],
        spareParts: ['کیت اورهال کامل'],
      },
    ],
  },
  // ============ دستگاه تولید فوم پیوسته / Continuous Foaming Line ============
  {
    match: eq => /hennecke|تولید اسفنج|continuous/i.test(eq.name) || /hennecke/i.test(eq.model),
    type: 'خط تولید فوم پیوسته',
    tasks: [
      {
        activity: 'بازرسی کانوایر، گرم‌کن و کنترل دما',
        frequency: 'daily', duration: 30, skillLevel: 'تکنسین',
        acceptanceCriteria: 'دما طبق نسخه تولید ± ۲°C',
        tools: ['ترموگرافی'],
        spareParts: [],
      },
      {
        activity: 'تمیزکاری head میکسر و خطوط شیمیایی',
        frequency: 'daily', duration: 60, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'بدون انباشت مواد، اتصالات سفت',
        tools: ['حلال', 'پارچه'],
        spareParts: ['حلال شستشو'],
      },
      {
        activity: 'بررسی نسبت اختلاط شیمیایی‌ها',
        frequency: 'weekly', duration: 45, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'انحراف < ۰.۵٪ از فرمول',
        tools: ['فلومتر دقیق'],
        spareParts: [],
      },
      {
        activity: 'بازرسی سیستم تخلیه گاز و فیلترها',
        frequency: 'monthly', duration: 90, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'تخلیه طبق استاندارد، فیلتر تمیز',
        tools: ['دستگاه اندازه‌گیری گاز'],
        spareParts: ['فیلتر گاز'],
        safetyNotes: 'استفاده از ماسک تنفسی',
      },
      {
        activity: 'کالیبراسیون کامل خط + سرویس کلی',
        frequency: 'annual', duration: 960, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی نماینده Hennecke',
        tools: ['ابزار تخصصی Hennecke'],
        spareParts: ['کیت سرویس سالیانه'],
      },
    ],
  },
  // ============ موتور / Motor ============
  {
    match: eq => /موتور|motor/i.test(eq.name),
    type: 'موتور الکتریکی',
    tasks: [
      {
        activity: 'بررسی دما، صدا و لرزش',
        frequency: 'daily', duration: 5, skillLevel: 'اپراتور',
        acceptanceCriteria: 'دما < ۷۰°C، بدون صدا و لرزش غیرعادی',
        tools: ['دماسنج لیزری'],
        spareParts: [],
      },
      {
        activity: 'گریس‌کاری یاتاقان‌ها',
        frequency: 'monthly', duration: 30, skillLevel: 'تکنسین',
        acceptanceCriteria: 'گریس‌خوری طبق دستورالعمل سازنده',
        tools: ['پمپ گریس'],
        spareParts: ['گریس یاتاقان'],
      },
      {
        activity: 'تست مقاومت عایقی (Megger Test)',
        frequency: 'semiannual', duration: 45, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'مقاومت عایقی > 1 MΩ',
        tools: ['Megger 1000V'],
        spareParts: [],
        safetyNotes: 'موتور باید کاملاً خاموش و ایزوله باشد',
      },
      {
        activity: 'بازرسی کوپلینگ و alignment',
        frequency: 'annual', duration: 90, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'انحراف محور < 0.1mm',
        tools: ['Laser Alignment Tool'],
        spareParts: [],
      },
    ],
  },
  // ============ پمپ / Pump ============
  {
    match: eq => /پمپ|pump/i.test(eq.name),
    type: 'پمپ',
    tasks: [
      {
        activity: 'بررسی فشار، دبی و دما',
        frequency: 'daily', duration: 10, skillLevel: 'اپراتور',
        acceptanceCriteria: 'مقادیر در محدوده طراحی',
        tools: ['فشارسنج', 'فلومتر'],
        spareParts: [],
      },
      {
        activity: 'بازرسی mechanical seal و گلند',
        frequency: 'weekly', duration: 20, skillLevel: 'تکنسین',
        acceptanceCriteria: 'بدون نشتی',
        tools: [],
        spareParts: [],
      },
      {
        activity: 'گریس‌کاری یاتاقان‌ها',
        frequency: 'monthly', duration: 30, skillLevel: 'تکنسین',
        acceptanceCriteria: 'گریس کافی، بدون نشت',
        tools: ['پمپ گریس'],
        spareParts: ['گریس EP2'],
      },
      {
        activity: 'تست alignment پمپ-موتور',
        frequency: 'semiannual', duration: 60, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'انحراف < 0.05mm',
        tools: ['Laser Alignment Tool'],
        spareParts: [],
      },
      {
        activity: 'تعویض mechanical seal و بازرسی پروانه',
        frequency: 'annual', duration: 180, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'seal جدید، پروانه بدون فرسایش',
        tools: ['ابزار تخصصی پمپ'],
        spareParts: ['mechanical seal', 'O-ring', 'gasket'],
      },
    ],
  },
  // ============ تجهیزات آزمایشگاهی عمومی ============
  {
    match: eq => /دستگاه تست کشش|tensile/i.test(eq.name),
    type: 'دستگاه تست کشش',
    tasks: [
      {
        activity: 'تمیزکاری فک‌ها (Grips) و سطوح',
        frequency: 'daily', duration: 10, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'فک‌ها تمیز، بدون باقی‌مانده نمونه',
        tools: ['پارچه نخی', 'الکل'],
        spareParts: [],
      },
      {
        activity: 'بررسی فک‌ها برای فرسایش و چرخش پیچ‌ها',
        frequency: 'weekly', duration: 20, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'فک‌ها بدون شکستگی، پیچ‌ها سفت',
        tools: ['آچار آلن'],
        spareParts: [],
      },
      {
        activity: 'تست عملکرد با نمونه استاندارد',
        frequency: 'monthly', duration: 60, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'نتایج در محدوده استاندارد ± ۲٪',
        tools: ['نمونه مرجع'],
        spareParts: [],
      },
      {
        activity: 'کالیبراسیون سالیانه توسط آزمایشگاه تأییدصلاحیت',
        frequency: 'annual', duration: 240, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی کالیبراسیون معتبر (NACI)',
        tools: ['وزنه‌های مرجع'],
        spareParts: [],
      },
    ],
  },
  {
    match: eq => /ترازو|scale|balance/i.test(eq.name),
    type: 'ترازوی آزمایشگاهی',
    tasks: [
      {
        activity: 'تمیزکاری کفه و بدنه',
        frequency: 'daily', duration: 5, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'بدون گرد و غبار',
        tools: ['پارچه میکروفایبر'],
        spareParts: [],
      },
      {
        activity: 'تست با وزنه مرجع داخلی',
        frequency: 'daily', duration: 5, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'انحراف ≤ 0.1mg',
        tools: ['وزنه مرجع کلاس E2'],
        spareParts: [],
      },
      {
        activity: 'تراز کردن (Level adjustment)',
        frequency: 'weekly', duration: 10, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'حباب در مرکز',
        tools: [],
        spareParts: [],
      },
      {
        activity: 'کالیبراسیون سالیانه با گواهی',
        frequency: 'annual', duration: 120, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی کالیبراسیون NACI',
        tools: ['وزنه‌های مرجع کلاس E1'],
        spareParts: [],
      },
    ],
  },
  {
    match: eq => /آون|oven/i.test(eq.name),
    type: 'آون آزمایشگاهی',
    tasks: [
      {
        activity: 'تمیزکاری داخلی و فن گردش هوا',
        frequency: 'weekly', duration: 20, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'داخل تمیز، فن بدون مانع',
        tools: ['پارچه', 'برس نرم'],
        spareParts: [],
      },
      {
        activity: 'تست دما با ترمومتر مرجع',
        frequency: 'monthly', duration: 30, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'انحراف ± ۲°C',
        tools: ['ترمومتر کالیبره'],
        spareParts: [],
      },
      {
        activity: 'بازرسی المنت‌های گرمایی و عایق درب',
        frequency: 'semiannual', duration: 45, skillLevel: 'تکنسین',
        acceptanceCriteria: 'المنت بدون شکستگی، عایق سالم',
        tools: ['مولتی‌متر'],
        spareParts: [],
      },
      {
        activity: 'کالیبراسیون سالیانه با گواهی',
        frequency: 'annual', duration: 90, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی کالیبراسیون معتبر',
        tools: ['Data logger چندنقطه‌ای'],
        spareParts: [],
      },
    ],
  },
  {
    match: eq => /شوف بالن|mantle|heating mantle/i.test(eq.name),
    type: 'شوف بالن',
    tasks: [
      {
        activity: 'تمیزکاری و بازرسی سیم رابط',
        frequency: 'weekly', duration: 10, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'بدون سوختگی یا پارگی سیم',
        tools: [],
        spareParts: [],
      },
      {
        activity: 'تست دما با ترمومتر و کنترل ولوم',
        frequency: 'monthly', duration: 20, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'دما مطابق ولوم تنظیمی',
        tools: ['ترمومتر'],
        spareParts: [],
      },
      {
        activity: 'کالیبراسیون سالیانه',
        frequency: 'annual', duration: 60, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی کالیبراسیون',
        tools: ['Data logger'],
        spareParts: [],
      },
    ],
  },
  {
    match: eq => /هات پلیت|hot plate/i.test(eq.name),
    type: 'هات پلیت همزن‌دار',
    tasks: [
      {
        activity: 'تمیزکاری سطح گرم‌کن',
        frequency: 'daily', duration: 5, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'سطح بدون لک و باقی‌مانده',
        tools: ['پارچه گرم‌مقاوم'],
        spareParts: [],
        safetyNotes: 'پس از سرد شدن کامل',
      },
      {
        activity: 'تست دما و سرعت همزن',
        frequency: 'monthly', duration: 20, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'دما ± ۳°C، سرعت دور یکنواخت',
        tools: ['ترمومتر', 'دور سنج'],
        spareParts: [],
      },
      {
        activity: 'کالیبراسیون سالیانه',
        frequency: 'annual', duration: 60, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی کالیبراسیون معتبر',
        tools: ['Data logger', 'دور سنج کالیبره'],
        spareParts: [],
      },
    ],
  },
  {
    match: eq => /ترمومتر|thermometer|testo/i.test(eq.name) || /testo/i.test(eq.model),
    type: 'ترمومتر / دماسنج',
    tasks: [
      {
        activity: 'بررسی باتری و وضعیت پراب',
        frequency: 'weekly', duration: 5, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'باتری شارژ کافی، پراب بدون آسیب',
        tools: [],
        spareParts: ['باتری'],
      },
      {
        activity: 'تست با نقطه ذوب یخ (0°C) و آب جوش (100°C)',
        frequency: 'monthly', duration: 15, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'انحراف ≤ ± ۰.۵°C',
        tools: ['یخ', 'آب جوش'],
        spareParts: [],
      },
      {
        activity: 'کالیبراسیون سالیانه با گواهی',
        frequency: 'annual', duration: 60, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی NACI معتبر',
        tools: ['کالیبراتور حرارتی'],
        spareParts: [],
      },
    ],
  },
  {
    match: eq => /کولیس|caliper/i.test(eq.name),
    type: 'کولیس',
    tasks: [
      {
        activity: 'تمیزکاری و روان‌کاری ریل',
        frequency: 'weekly', duration: 5, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'حرکت نرم بدون گیر',
        tools: ['پارچه', 'روغن دقیق'],
        spareParts: [],
      },
      {
        activity: 'تست صفر و چک با بلوک گیج',
        frequency: 'monthly', duration: 10, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'انحراف ≤ ۰.۰۲mm',
        tools: ['بلوک گیج کالیبره'],
        spareParts: [],
      },
      {
        activity: 'کالیبراسیون سالیانه',
        frequency: 'annual', duration: 30, skillLevel: 'پیمانکار تخصصی',
        acceptanceCriteria: 'گواهی کالیبراسیون داخلی/خارجی',
        tools: ['بلوک گیج مرجع'],
        spareParts: [],
      },
    ],
  },
  {
    match: eq => /عبور هوا|air permeability/i.test(eq.name),
    type: 'دستگاه تست عبور هوا',
    tasks: [
      {
        activity: 'تمیزکاری فک‌ها و سطح نمونه‌گیر',
        frequency: 'weekly', duration: 10, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'بدون باقی‌مانده فوم',
        tools: ['برس نرم'],
        spareParts: [],
      },
      {
        activity: 'تست با نمونه مرجع شناخته‌شده',
        frequency: 'monthly', duration: 20, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'نتایج در محدوده استاندارد',
        tools: ['نمونه مرجع'],
        spareParts: [],
      },
      {
        activity: 'کالیبراسیون فلومتر و فشارسنج',
        frequency: 'annual', duration: 120, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'گواهی کالیبراسیون داخلی',
        tools: ['فلومتر مرجع'],
        spareParts: [],
      },
    ],
  },
  {
    match: eq => /ارتجاعی|rebound|ball rebound/i.test(eq.name),
    type: 'دستگاه تست خاصیت ارتجاعی',
    tasks: [
      {
        activity: 'بازرسی محل سقوط توپ و راهنما',
        frequency: 'weekly', duration: 10, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'سطح صاف و عمودی، توپ بدون آسیب',
        tools: ['تراز'],
        spareParts: ['توپ یدکی'],
      },
      {
        activity: 'تست با نمونه مرجع',
        frequency: 'monthly', duration: 20, skillLevel: 'کارشناس آزمایشگاه' as SkillLevel,
        acceptanceCriteria: 'تکرارپذیری ± ۲٪',
        tools: ['نمونه فوم مرجع'],
        spareParts: [],
      },
      {
        activity: 'کالیبراسیون سالیانه',
        frequency: 'annual', duration: 60, skillLevel: 'تکنسین ارشد',
        acceptanceCriteria: 'گواهی کالیبراسیون داخلی',
        tools: ['ابزار اندازه‌گیری ارتفاع'],
        spareParts: [],
      },
    ],
  },
  // ============ کالیبراسیون عمومی برای هر تجهیز که دوره کالیبراسیون دارد ============
  {
    match: eq => {
      const cal = eq.customFields?.['دوره کالیبراسیون'];
      return !!cal && cal !== 'نیاز ندارد' && cal !== '—';
    },
    type: 'عمومی - کالیبراسیون',
    tasks: [], // اضافی به سایر تسک‌ها
  },
];

// Generate spare-parts cost estimate (very rough) per task frequency
const FREQ_PER_YEAR: Record<PMFrequency, number> = {
  daily: 365, weekly: 52, monthly: 12, quarterly: 4, semiannual: 2, annual: 1,
};

/**
 * Generate complete PM plan for a single equipment based on its type
 */
export function generatePMPlan(eq: Equipment): EquipmentPMPlan {
  const matched = PM_TEMPLATES.find(t => t.match(eq));
  const tasks: PMTask[] = (matched?.tasks ?? []).map((t, i) => ({
    ...t,
    id: `pm_${eq.id}_${i}`,
  }));

  // If equipment requires calibration but matched template doesn't include one,
  // add a calibration task
  const cal = eq.customFields?.['دوره کالیبراسیون'];
  const calType = eq.customFields?.['نوع کالیبراسیون'];
  if (cal && cal !== 'نیاز ندارد' && cal !== '—') {
    const hasCal = tasks.some(t => /کالیبراسیون/.test(t.activity));
    if (!hasCal) {
      // Determine frequency from string
      let freq: PMFrequency = 'annual';
      if (/۳|3.*ماه/.test(cal)) freq = 'quarterly';
      else if (/۶|6.*ماه/.test(cal)) freq = 'semiannual';
      else if (/۱۲|12.*ماه|1 ساله|سال/.test(cal)) freq = 'annual';

      tasks.push({
        id: `pm_${eq.id}_cal`,
        activity: `کالیبراسیون ${calType === 'خارجی' ? 'خارجی (آزمایشگاه تأییدصلاحیت)' : 'داخلی'}`,
        frequency: freq,
        duration: calType === 'خارجی' ? 240 : 90,
        skillLevel: calType === 'خارجی' ? 'پیمانکار تخصصی' : 'تکنسین ارشد',
        acceptanceCriteria: 'گواهی کالیبراسیون معتبر صادر شود',
        tools: ['ابزارهای مرجع کالیبراسیون'],
        spareParts: [],
      });
    }
  }

  // Calculate total annual hours
  const totalAnnualHours = tasks.reduce(
    (s, t) => s + (t.duration / 60) * FREQ_PER_YEAR[t.frequency],
    0
  );

  // Rough cost estimate (manpower + spares)
  const hourlyCost = 800_000; // Tomans per hour (approximate Iranian rate)
  const estimatedCost = totalAnnualHours * hourlyCost;
  const estimatedAnnualCost = estimatedCost > 1_000_000_000
    ? `${(estimatedCost / 1_000_000_000).toFixed(1)} میلیارد تومان`
    : `${(estimatedCost / 1_000_000).toFixed(0)} میلیون تومان`;

  return {
    equipmentId: eq.id,
    equipmentName: eq.name,
    equipmentType: matched?.type ?? 'عمومی',
    tasks,
    totalAnnualHours: Math.round(totalAnnualHours),
    estimatedAnnualCost,
  };
}

// Labels in Persian
export const FREQUENCY_LABEL: Record<PMFrequency, string> = {
  daily: 'روزانه',
  weekly: 'هفتگی',
  monthly: 'ماهانه',
  quarterly: 'فصلی',
  semiannual: '۶ ماهه',
  annual: 'سالیانه',
};

export const FREQUENCY_COLOR: Record<PMFrequency, string> = {
  daily: 'bg-rose-500/15 text-rose-200 border-rose-500/30',
  weekly: 'bg-orange-500/15 text-orange-200 border-orange-500/30',
  monthly: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  quarterly: 'bg-sky-500/15 text-sky-200 border-sky-500/30',
  semiannual: 'bg-violet-500/15 text-violet-200 border-violet-500/30',
  annual: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
};
