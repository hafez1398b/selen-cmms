// Complete Maintenance Data for Selen CMMS

export type MaintenanceType = "preventive" | "corrective" | "predictive";
export type TriggerType = "time" | "meter" | "condition" | "hybrid";
export type PMStatus = "scheduled" | "in_progress" | "completed" | "overdue" | "skipped";
export type Standard = "ISO_14224" | "ISO_55000" | "TPM" | "RCM" | "Custom";

export interface ChecklistItem {
  id: string;
  title: string;
  type: "checkbox" | "number" | "text" | "photo" | "signature";
  required: boolean;
  min?: number;
  max?: number;
  unit?: string;
  order: number;
}

export interface MaintenancePlan {
  id: number;
  code: string;
  title: string;
  description: string;
  type: MaintenanceType;
  trigger: TriggerType;

  // Asset
  assetId: number;
  assetName: string;
  assetCode: string;

  // Trigger
  intervalValue?: number;
  intervalUnit?: "hour" | "day" | "week" | "month" | "year" | "cycles";
  meterThreshold?: number;
  conditionParam?: string;
  conditionValue?: number;

  // Schedule
  lastExecuted?: string;
  nextDue: string;
  daysUntilDue: number;

  // Execution
  status: PMStatus;
  priority: "low" | "medium" | "high" | "critical";
  estimatedHours: number;
  actualHours?: number;

  // Assignment
  assignedTo: string;
  assignedTeam?: string[];
  requiredSkills: string[];

  // Standard & Category
  standard: Standard;
  category: "mechanical" | "electrical" | "hydraulic" | "instrumentation" | "safety" | "cleaning";

  // Checklist
  checklistItems: ChecklistItem[];

  // Parts
  requiredParts: { partCode: string; partName: string; quantity: number }[];

  // Cost
  estimatedCost: number;
  actualCost?: number;

  // Meta
  createdBy: string;
  createdAt: string;
  isActive: boolean;
  aiOptimized?: boolean;
}

export interface LubricationPoint {
  id: number;
  assetId: number;
  assetName: string;
  pointCode: string;
  location: string;
  lubricantType: string;
  quantity: number;
  unit: "gram" | "ml" | "liter";
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  method: "manual" | "auto" | "central";
}

export interface LubricationRoute {
  id: number;
  code: string;
  name: string;
  frequency: string;
  points: number[]; // LubricationPoint IDs
  assignedTo: string;
  estimatedMinutes: number;
  lastExecuted?: string;
  nextDue: string;
  status: "on_schedule" | "due_soon" | "overdue";
}

export interface InspectionPoint {
  id: number;
  assetId: number;
  assetName: string;
  pointName: string;
  parameter: string;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  method: "visual" | "measurement" | "listening" | "smell" | "touch";
}

export interface InspectionRound {
  id: number;
  code: string;
  name: string;
  frequency: string;
  points: number[];
  assignedTo: string;
  estimatedMinutes: number;
  lastExecuted?: string;
  nextDue: string;
  status: "on_schedule" | "due_soon" | "overdue";
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const stdChecklists: Record<string, ChecklistItem[]> = {
  daily_mixer: [
    { id: "1", title: "بازرسی چشمی نشتی روغن", type: "checkbox", required: true, order: 1 },
    { id: "2", title: "اندازه‌گیری دمای موتور", type: "number", required: true, unit: "°C", min: 20, max: 80, order: 2 },
    { id: "3", title: "بررسی وایبرشن", type: "number", required: true, unit: "mm/s", min: 0, max: 5, order: 3 },
    { id: "4", title: "بررسی صدای غیرعادی", type: "checkbox", required: true, order: 4 },
    { id: "5", title: "ثبت جریان مصرفی", type: "number", required: false, unit: "A", order: 5 },
    { id: "6", title: "عکس از نامپلیت (در صورت نیاز)", type: "photo", required: false, order: 6 },
    { id: "7", title: "امضای اپراتور", type: "signature", required: true, order: 7 },
  ],
  monthly_full: [
    { id: "1", title: "خاموش کردن دستگاه و LOTO", type: "checkbox", required: true, order: 1 },
    { id: "2", title: "بازرسی کامل چشمی", type: "checkbox", required: true, order: 2 },
    { id: "3", title: "تعویض روغن هیدرولیک", type: "checkbox", required: true, order: 3 },
    { id: "4", title: "تمیزکاری فیلترها", type: "checkbox", required: true, order: 4 },
    { id: "5", title: "گریس‌کاری بلبرینگ‌ها", type: "checkbox", required: true, order: 5 },
    { id: "6", title: "کالیبراسیون سنسورها", type: "checkbox", required: true, order: 6 },
    { id: "7", title: "بررسی اتصالات الکتریکی", type: "checkbox", required: true, order: 7 },
    { id: "8", title: "تست هم‌محورسازی شفت", type: "measurement", required: true, unit: "mm", order: 8 } as any,
    { id: "9", title: "ثبت پارامترهای عملکرد", type: "text", required: true, order: 9 },
    { id: "10", title: "امضای مسئول", type: "signature", required: true, order: 10 },
  ],
};

export const maintenancePlansData: MaintenancePlan[] = [
  // Bespar 1 - Mixer MX-101
  {
    id: 1, code: "PM-MX101-D", title: "سرویس روزانه میکسر اصلی",
    description: "بازدید روتین روزانه توسط اپراتور شیفت",
    type: "preventive", trigger: "time",
    assetId: 13, assetName: "میکسر اصلی MX-101", assetCode: "MX-101",
    intervalValue: 1, intervalUnit: "day",
    lastExecuted: "1403/10/28", nextDue: "1403/10/29", daysUntilDue: 1,
    status: "scheduled", priority: "medium", estimatedHours: 0.5,
    assignedTo: "اپراتور شیفت", requiredSkills: ["اپراتوری میکسر"],
    standard: "TPM", category: "mechanical",
    checklistItems: stdChecklists.daily_mixer,
    requiredParts: [],
    estimatedCost: 0, createdBy: "علی محمدی", createdAt: "1402/01/01", isActive: true,
  },
  {
    id: 2, code: "PM-MX101-M", title: "سرویس ماهانه اصلی میکسر",
    description: "سرویس کامل ماهانه شامل تعویض روغن و بازرسی جامع",
    type: "preventive", trigger: "time",
    assetId: 13, assetName: "میکسر اصلی MX-101", assetCode: "MX-101",
    intervalValue: 30, intervalUnit: "day",
    lastExecuted: "1403/09/12", nextDue: "1403/11/01", daysUntilDue: 3,
    status: "scheduled", priority: "high", estimatedHours: 4,
    assignedTo: "علی محمدی", assignedTeam: ["علی محمدی", "حسن رضایی"],
    requiredSkills: ["تعمیرات مکانیک", "هیدرولیک"],
    standard: "ISO_55000", category: "mechanical",
    checklistItems: stdChecklists.monthly_full,
    requiredParts: [
      { partCode: "SP-OIL-46", partName: "روغن هیدرولیک", quantity: 20 },
      { partCode: "SP-FLT-100", partName: "فیلتر هیدرولیک", quantity: 2 },
    ],
    estimatedCost: 4500000, createdBy: "علی محمدی", createdAt: "1402/01/01", isActive: true, aiOptimized: true,
  },
  {
    id: 3, code: "PM-MX101-500H", title: "سرویس ۵۰۰ ساعته میکسر",
    description: "سرویس بر اساس ساعت کارکرد",
    type: "preventive", trigger: "meter",
    assetId: 13, assetName: "میکسر اصلی MX-101", assetCode: "MX-101",
    meterThreshold: 500,
    lastExecuted: "1403/07/15", nextDue: "1403/12/10", daysUntilDue: 40,
    status: "scheduled", priority: "high", estimatedHours: 8,
    assignedTo: "علی محمدی", requiredSkills: ["تعمیرات مکانیک"],
    standard: "RCM", category: "mechanical",
    checklistItems: [], requiredParts: [],
    estimatedCost: 12000000, createdBy: "علی محمدی", createdAt: "1402/01/01", isActive: true,
  },
  {
    id: 4, code: "PdM-MX101-VIB", title: "پایش وایبرشن میکسر",
    description: "PdM بر اساس اندازه‌گیری وایبرشن",
    type: "predictive", trigger: "condition",
    assetId: 13, assetName: "میکسر اصلی MX-101", assetCode: "MX-101",
    conditionParam: "vibration", conditionValue: 4.5,
    lastExecuted: "1403/09/28", nextDue: "1403/10/28", daysUntilDue: -2,
    status: "overdue", priority: "high", estimatedHours: 1.5,
    assignedTo: "محمد کریمی", requiredSkills: ["ابزار دقیق", "پایش وضعیت"],
    standard: "ISO_14224", category: "instrumentation",
    checklistItems: [], requiredParts: [],
    estimatedCost: 500000, createdBy: "محمد کریمی", createdAt: "1402/06/01", isActive: true, aiOptimized: true,
  },
  {
    id: 5, code: "PM-MX101-Y", title: "بازرسی Overhaul سالانه",
    description: "بازرسی جامع سالانه شامل باز کردن و بازسازی",
    type: "preventive", trigger: "time",
    assetId: 13, assetName: "میکسر اصلی MX-101", assetCode: "MX-101",
    intervalValue: 1, intervalUnit: "year",
    lastExecuted: "1402/12/20", nextDue: "1403/12/20", daysUntilDue: 50,
    status: "scheduled", priority: "critical", estimatedHours: 48,
    assignedTo: "تیم فنی", assignedTeam: ["علی محمدی", "حسن رضایی", "مهدی عباسی"],
    requiredSkills: ["تعمیرات مکانیک", "هیدرولیک", "الکتریسیته"],
    standard: "ISO_55000", category: "mechanical",
    checklistItems: [], requiredParts: [],
    estimatedCost: 85000000, createdBy: "مدیر فنی", createdAt: "1402/01/01", isActive: true,
  },
  // Conveyor CV-101
  {
    id: 6, code: "PM-CV101-W", title: "بازرسی هفتگی نوار نقاله",
    description: "بازرسی چشمی و اندازه‌گیری کشش تسمه",
    type: "preventive", trigger: "time",
    assetId: 20, assetName: "نوار نقاله اصلی CV-101", assetCode: "CV-101",
    intervalValue: 7, intervalUnit: "day",
    lastExecuted: "1403/10/25", nextDue: "1403/11/01", daysUntilDue: 3,
    status: "scheduled", priority: "medium", estimatedHours: 2,
    assignedTo: "حسن رضایی", requiredSkills: ["تعمیرات مکانیک"],
    standard: "TPM", category: "mechanical",
    checklistItems: [], requiredParts: [],
    estimatedCost: 1500000, createdBy: "علی محمدی", createdAt: "1402/01/01", isActive: true,
  },
  // Bespar 2 - Press PR-201
  {
    id: 7, code: "PM-PR201-M", title: "سرویس ماهانه پرس مموری",
    description: "بازرسی سیستم هیدرولیک و خنک‌کننده",
    type: "preventive", trigger: "time",
    assetId: 33, assetName: "پرس مموری PR-201", assetCode: "PR-201",
    intervalValue: 30, intervalUnit: "day",
    lastExecuted: "1403/10/05", nextDue: "1403/11/05", daysUntilDue: 7,
    status: "scheduled", priority: "high", estimatedHours: 3,
    assignedTo: "علی محمدی", requiredSkills: ["هیدرولیک"],
    standard: "ISO_55000", category: "hydraulic",
    checklistItems: [], requiredParts: [
      { partCode: "SP-OIL-46", partName: "روغن هیدرولیک", quantity: 15 },
    ],
    estimatedCost: 3000000, createdBy: "علی محمدی", createdAt: "1402/01/01", isActive: true,
  },
  // Bespar 3 - Cutter CT-301
  {
    id: 8, code: "PM-CT301-BLADE", title: "تیز کردن تیغه‌های برش",
    description: "بر اساس تعداد سیکل برش",
    type: "preventive", trigger: "meter",
    assetId: 42, assetName: "دستگاه برش CT-301", assetCode: "CT-301",
    meterThreshold: 10000,
    lastExecuted: "1403/09/20", nextDue: "1403/11/10", daysUntilDue: 12,
    status: "scheduled", priority: "medium", estimatedHours: 2,
    assignedTo: "حسن رضایی", requiredSkills: ["تیز کردن ابزار"],
    standard: "TPM", category: "mechanical",
    checklistItems: [], requiredParts: [],
    estimatedCost: 800000, createdBy: "علی محمدی", createdAt: "1402/06/01", isActive: true,
  },
  {
    id: 9, code: "PM-PK301-M", title: "سرویس ماهانه بسته‌بندی",
    description: "بازرسی و تعمیر دستگاه بسته‌بندی",
    type: "corrective", trigger: "time",
    assetId: 44, assetName: "دستگاه بسته‌بندی PK-301", assetCode: "PK-301",
    intervalValue: 30, intervalUnit: "day",
    lastExecuted: "1403/09/28", nextDue: "1403/10/28", daysUntilDue: -2,
    status: "overdue", priority: "high", estimatedHours: 4,
    assignedTo: "محمد کریمی", requiredSkills: ["تعمیرات مکانیک", "پنوماتیک"],
    standard: "ISO_55000", category: "mechanical",
    checklistItems: [], requiredParts: [],
    estimatedCost: 3500000, createdBy: "علی محمدی", createdAt: "1402/01/01", isActive: true,
  },
  // Bespar 5 - Compressor CM-501
  {
    id: 10, code: "PM-CM501-500H", title: "سرویس ۵۰۰ ساعته کمپرسور",
    description: "تعویض روغن و فیلترهای کمپرسور",
    type: "preventive", trigger: "meter",
    assetId: 62, assetName: "کمپرسور CM-501", assetCode: "CM-501",
    meterThreshold: 500,
    lastExecuted: "1403/09/15", nextDue: "1403/11/15", daysUntilDue: 17,
    status: "scheduled", priority: "medium", estimatedHours: 3,
    assignedTo: "رضا احمدی", requiredSkills: ["تعمیرات کمپرسور"],
    standard: "RCM", category: "mechanical",
    checklistItems: [], requiredParts: [],
    estimatedCost: 5000000, createdBy: "علی محمدی", createdAt: "1402/01/01", isActive: true,
  },
  // Utility - Boiler
  {
    id: 11, code: "PM-BL801-Q", title: "بازرسی سه‌ماهه دیگ بخار",
    description: "بازرسی ایمنی و بازدهی دیگ",
    type: "preventive", trigger: "time",
    assetId: 82, assetName: "دیگ بخار BL-801", assetCode: "BL-801",
    intervalValue: 3, intervalUnit: "month",
    lastExecuted: "1403/08/01", nextDue: "1403/11/01", daysUntilDue: 3,
    status: "scheduled", priority: "critical", estimatedHours: 6,
    assignedTo: "امیر حسینی", requiredSkills: ["دیگ بخار", "ایمنی"],
    standard: "ISO_55000", category: "safety",
    checklistItems: [], requiredParts: [],
    estimatedCost: 8000000, createdBy: "مدیر فنی", createdAt: "1402/01/01", isActive: true,
  },
  // Additional PMs
  {
    id: 12, code: "PM-EQ401-M", title: "سرویس ماهانه پمپ فرآیند",
    description: "بازرسی و روانکاری پمپ",
    type: "preventive", trigger: "time",
    assetId: 52, assetName: "پمپ فرآیند EQ-401", assetCode: "EQ-401",
    intervalValue: 30, intervalUnit: "day",
    lastExecuted: "1403/10/10", nextDue: "1403/11/10", daysUntilDue: 12,
    status: "scheduled", priority: "medium", estimatedHours: 2,
    assignedTo: "مهدی عباسی", requiredSkills: ["پمپ"],
    standard: "TPM", category: "mechanical",
    checklistItems: [], requiredParts: [],
    estimatedCost: 1200000, createdBy: "علی محمدی", createdAt: "1402/01/01", isActive: true,
  },
  {
    id: 13, code: "PM-GN601-M", title: "تست ماهانه ژنراتور کمکی",
    description: "تست عملکرد ژنراتور کمکی در حالت اضطراری",
    type: "preventive", trigger: "time",
    assetId: 72, assetName: "ژنراتور کمکی GN-601", assetCode: "GN-601",
    intervalValue: 30, intervalUnit: "day",
    lastExecuted: "1403/10/15", nextDue: "1403/11/15", daysUntilDue: 17,
    status: "scheduled", priority: "high", estimatedHours: 2,
    assignedTo: "امیر حسینی", requiredSkills: ["ژنراتور", "الکتریسیته"],
    standard: "ISO_55000", category: "electrical",
    checklistItems: [], requiredParts: [],
    estimatedCost: 2000000, createdBy: "علی محمدی", createdAt: "1402/01/01", isActive: true,
  },
  {
    id: 14, code: "PM-MX102-M", title: "سرویس ماهانه میکسر فرعی",
    description: "سرویس مکانیکی و روغن‌کاری",
    type: "preventive", trigger: "time",
    assetId: 24, assetName: "میکسر فرعی MX-102", assetCode: "MX-102",
    intervalValue: 30, intervalUnit: "day",
    lastExecuted: "1403/10/12", nextDue: "1403/11/12", daysUntilDue: 14,
    status: "scheduled", priority: "medium", estimatedHours: 3,
    assignedTo: "حسن رضایی", requiredSkills: ["تعمیرات مکانیک"],
    standard: "TPM", category: "mechanical",
    checklistItems: [], requiredParts: [],
    estimatedCost: 2500000, createdBy: "علی محمدی", createdAt: "1402/01/01", isActive: true,
  },
];

// Lubrication
export const lubricationPointsData: LubricationPoint[] = [
  { id: 1, assetId: 13, assetName: "میکسر اصلی MX-101", pointCode: "LB-01", location: "بلبرینگ اصلی", lubricantType: "گریس EP2", quantity: 20, unit: "gram", frequency: "monthly", method: "manual" },
  { id: 2, assetId: 13, assetName: "میکسر اصلی MX-101", pointCode: "LB-02", location: "بلبرینگ فرعی", lubricantType: "گریس EP2", quantity: 10, unit: "gram", frequency: "monthly", method: "manual" },
  { id: 3, assetId: 20, assetName: "نوار نقاله CV-101", pointCode: "LB-03", location: "رولرهای پیش‌رو", lubricantType: "گریس Li", quantity: 5, unit: "gram", frequency: "weekly", method: "manual" },
  { id: 4, assetId: 62, assetName: "کمپرسور CM-501", pointCode: "LB-04", location: "مخزن روغن", lubricantType: "روغن VG-46", quantity: 15, unit: "liter", frequency: "quarterly", method: "auto" },
  { id: 5, assetId: 33, assetName: "پرس PR-201", pointCode: "LB-05", location: "شفت پرس", lubricantType: "روغن هیدرولیک", quantity: 30, unit: "liter", frequency: "quarterly", method: "central" },
];

export const lubricationRoutesData: LubricationRoute[] = [
  { id: 1, code: "LR-W-01", name: "روتین هفتگی خط ۱", frequency: "هفتگی", points: [3], assignedTo: "حسن رضایی", estimatedMinutes: 30, lastExecuted: "1403/10/25", nextDue: "1403/11/01", status: "on_schedule" },
  { id: 2, code: "LR-M-01", name: "روتین ماهانه بسپار ۱", frequency: "ماهانه", points: [1, 2], assignedTo: "علی محمدی", estimatedMinutes: 60, lastExecuted: "1403/09/20", nextDue: "1403/10/20", status: "overdue" },
  { id: 3, code: "LR-Q-01", name: "روتین سه‌ماهه کمپرسور و پرس", frequency: "سه‌ماهه", points: [4, 5], assignedTo: "رضا احمدی", estimatedMinutes: 120, lastExecuted: "1403/08/10", nextDue: "1403/11/10", status: "due_soon" },
];

// Inspection
export const inspectionPointsData: InspectionPoint[] = [
  { id: 1, assetId: 13, assetName: "میکسر MX-101", pointName: "دمای موتور", parameter: "temperature", minValue: 20, maxValue: 70, unit: "°C", method: "measurement" },
  { id: 2, assetId: 13, assetName: "میکسر MX-101", pointName: "وایبرشن", parameter: "vibration", minValue: 0, maxValue: 4.5, unit: "mm/s", method: "measurement" },
  { id: 3, assetId: 20, assetName: "نوار نقاله CV-101", pointName: "کشش تسمه", parameter: "tension", unit: "N", method: "measurement" },
  { id: 4, assetId: 62, assetName: "کمپرسور CM-501", pointName: "فشار خروجی", parameter: "pressure", minValue: 6, maxValue: 8, unit: "bar", method: "measurement" },
  { id: 5, assetId: 82, assetName: "دیگ بخار BL-801", pointName: "فشار بخار", parameter: "pressure", minValue: 8, maxValue: 12, unit: "bar", method: "measurement" },
];

export const inspectionRoundsData: InspectionRound[] = [
  { id: 1, code: "IR-D-01", name: "گشت روزانه بسپار ۱", frequency: "روزانه", points: [1, 2, 3], assignedTo: "اپراتور شیفت", estimatedMinutes: 45, lastExecuted: "1403/10/28", nextDue: "1403/10/29", status: "on_schedule" },
  { id: 2, code: "IR-D-02", name: "گشت روزانه تأسیسات", frequency: "روزانه", points: [4, 5], assignedTo: "امیر حسینی", estimatedMinutes: 30, lastExecuted: "1403/10/28", nextDue: "1403/10/29", status: "on_schedule" },
  { id: 3, code: "IR-W-01", name: "گشت هفتگی جامع", frequency: "هفتگی", points: [1, 2, 3, 4, 5], assignedTo: "محمد کریمی", estimatedMinutes: 120, lastExecuted: "1403/10/22", nextDue: "1403/10/29", status: "due_soon" },
];

// Helpers
export const standardLabels: Record<Standard, string> = {
  ISO_14224: "ISO 14224",
  ISO_55000: "ISO 55000",
  TPM: "TPM",
  RCM: "RCM",
  Custom: "سفارشی",
};

export const standardColors: Record<Standard, string> = {
  ISO_14224: "#3b82f6",
  ISO_55000: "#8b5cf6",
  TPM: "#22c55e",
  RCM: "#f59e0b",
  Custom: "#6b7280",
};

export const categoryLabels: Record<string, string> = {
  mechanical: "مکانیک",
  electrical: "برق",
  hydraulic: "هیدرولیک",
  instrumentation: "ابزار دقیق",
  safety: "ایمنی",
  cleaning: "نظافت",
};

export const categoryColors: Record<string, string> = {
  mechanical: "#3b82f6",
  electrical: "#f59e0b",
  hydraulic: "#06b6d4",
  instrumentation: "#8b5cf6",
  safety: "#ef4444",
  cleaning: "#22c55e",
};

export const typeLabels: Record<MaintenanceType, string> = {
  preventive: "پیشگیرانه (PM)",
  corrective: "اصلاحی (CM)",
  predictive: "پیش‌بینانه (PdM)",
};

export const statusLabels: Record<PMStatus, string> = {
  scheduled: "برنامه‌ریزی شده",
  in_progress: "در حال انجام",
  completed: "تکمیل شده",
  overdue: "عقب‌افتاده",
  skipped: "رد شده",
};

export const statusColors: Record<PMStatus, string> = {
  scheduled: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#22c55e",
  overdue: "#ef4444",
  skipped: "#6b7280",
};
