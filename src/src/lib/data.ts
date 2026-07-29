// Seed data for the CMMS application

export interface AssetData {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  level: number;
  status: string;
  healthScore: string;
  criticality: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  mtbf: string;
  mttr: string;
  availability: string;
  reliability: string;
  failureRate: string;
  totalFailures: number;
  totalDowntime: string;
  oee: string;
}

export interface WorkOrderData {
  id: number;
  orderNumber: string;
  title: string;
  assetId: number | null;
  assetName: string;
  priority: string;
  type: string;
  status: string;
  assignedTo: string;
  scheduledDate: string;
  estimatedHours: string;
  actualHours: string;
}

export interface FailureData {
  id: number;
  title: string;
  assetName: string;
  severity: string;
  status: string;
  failureType: string;
  downtimeHours: string;
  cost: string;
  createdAt: string;
}

export interface PersonnelData {
  id: number;
  fullName: string;
  username: string;
  position: string;
  department: string;
  role: string;
  productivity: string;
  completedWorkOrders: number;
  workingHours: string;
  isActive: boolean;
}

export interface SparePartData {
  id: number;
  code: string;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: string;
  status: string;
  location: string;
}

export interface PMData {
  id: number;
  title: string;
  assetName: string;
  type: string;
  interval: number;
  intervalUnit: string;
  nextDue: string;
  status: string;
  assignedTo: string;
}

// Asset Hierarchy Data
export const assetsData: AssetData[] = [
  { id: 1, code: "ST-001", name: "سایت تولید اصلی", parentId: null, level: 0, status: "active", healthScore: "92", criticality: "critical", manufacturer: "", model: "", serialNumber: "", mtbf: "0", mttr: "0", availability: "95", reliability: "97", failureRate: "0", totalFailures: 0, totalDowntime: "0", oee: "87" },
  { id: 2, code: "ZN-001", name: "ناحیه فرآوری", parentId: 1, level: 1, status: "active", healthScore: "90", criticality: "high", manufacturer: "", model: "", serialNumber: "", mtbf: "0", mttr: "0", availability: "93", reliability: "95", failureRate: "0", totalFailures: 0, totalDowntime: "0", oee: "0" },
  { id: 3, code: "ZN-002", name: "ناحیه بسته‌بندی", parentId: 1, level: 1, status: "active", healthScore: "88", criticality: "high", manufacturer: "", model: "", serialNumber: "", mtbf: "0", mttr: "0", availability: "91", reliability: "93", failureRate: "0", totalFailures: 0, totalDowntime: "0", oee: "0" },
  { id: 4, code: "UN-001", name: "واحد آسیاب", parentId: 2, level: 2, status: "active", healthScore: "85", criticality: "high", manufacturer: "", model: "", serialNumber: "", mtbf: "450", mttr: "3.5", availability: "92", reliability: "90", failureRate: "2.2", totalFailures: 3, totalDowntime: "24", oee: "82" },
  { id: 5, code: "UN-002", name: "واحد انتقال مواد", parentId: 2, level: 2, status: "active", healthScore: "94", criticality: "medium", manufacturer: "", model: "", serialNumber: "", mtbf: "680", mttr: "2.1", availability: "96", reliability: "94", failureRate: "1.5", totalFailures: 1, totalDowntime: "8", oee: "88" },
  { id: 6, code: "EQ-001", name: "دستگاه آسیاب صنعتی", parentId: 4, level: 3, status: "active", healthScore: "82", criticality: "critical", manufacturer: "زیمنس", model: "GM-2000X", serialNumber: "SN-2023-4521", mtbf: "320", mttr: "5.2", availability: "89", reliability: "85", failureRate: "3.1", totalFailures: 5, totalDowntime: "48", oee: "78" },
  { id: 7, code: "EQ-002", name: "نوار نقاله اصلی", parentId: 5, level: 3, status: "active", healthScore: "91", criticality: "high", manufacturer: "متسو", model: "CV-500", serialNumber: "SN-2023-7832", mtbf: "520", mttr: "2.8", availability: "94", reliability: "92", failureRate: "1.9", totalFailures: 2, totalDowntime: "12", oee: "85" },
  { id: 8, code: "EQ-003", name: "پمپ هیدرولیک", parentId: 4, level: 3, status: "maintenance", healthScore: "75", criticality: "high", manufacturer: "گریوند", model: "HP-350", serialNumber: "SN-2022-1234", mtbf: "280", mttr: "6.5", availability: "85", reliability: "78", failureRate: "3.6", totalFailures: 8, totalDowntime: "72", oee: "72" },
  { id: 9, code: "EQ-004", name: "کمپرسور هوا", parentId: 4, level: 3, status: "active", healthScore: "88", criticality: "medium", manufacturer: "اطلس کوپکو", model: "GA-75", serialNumber: "SN-2023-5678", mtbf: "600", mttr: "3.0", availability: "93", reliability: "91", failureRate: "1.7", totalFailures: 2, totalDowntime: "10", oee: "84" },
  { id: 10, code: "SE-001", name: "موتور الکتریکی", parentId: 6, level: 4, status: "active", healthScore: "90", criticality: "high", manufacturer: "ABB", model: "M3BP-200", serialNumber: "SN-2023-9012", mtbf: "480", mttr: "2.0", availability: "95", reliability: "93", failureRate: "2.1", totalFailures: 1, totalDowntime: "6", oee: "0" },
  { id: 11, code: "SE-002", name: "سیستم روانکاری", parentId: 6, level: 4, status: "active", healthScore: "78", criticality: "medium", manufacturer: "اسکا", model: "LCS-100", serialNumber: "SN-2022-3456", mtbf: "350", mttr: "4.0", availability: "88", reliability: "82", failureRate: "2.9", totalFailures: 4, totalDowntime: "20", oee: "0" },
  { id: 12, code: "EQ-005", name: "دستگاه بسته‌بندی اتوماتیک", parentId: 3, level: 2, status: "active", healthScore: "86", criticality: "high", manufacturer: "اشیما", model: "VP-800", serialNumber: "SN-2023-6789", mtbf: "420", mttr: "4.2", availability: "90", reliability: "87", failureRate: "2.4", totalFailures: 4, totalDowntime: "30", oee: "80" },
];

// Work Orders Data
export const workOrdersData: WorkOrderData[] = [
  { id: 1, orderNumber: "WO-1401", title: "تعویض بلبرینگ آسیاب صنعتی", assetId: 6, assetName: "دستگاه آسیاب صنعتی", priority: "critical", type: "corrective", status: "in_progress", assignedTo: "علی محمدی", scheduledDate: "1403/10/15", estimatedHours: "4", actualHours: "3.5" },
  { id: 2, orderNumber: "WO-1402", title: "سرویس دوره‌ای کمپرسور هوا", assetId: 9, assetName: "کمپرسور هوا", priority: "medium", type: "preventive", status: "open", assignedTo: "رضا احمدی", scheduledDate: "1403/10/18", estimatedHours: "2", actualHours: "0" },
  { id: 3, orderNumber: "WO-1403", title: "بازدید نوار نقاله اصلی", assetId: 7, assetName: "نوار نقاله اصلی", priority: "high", type: "preventive", status: "completed", assignedTo: "حسن رضایی", scheduledDate: "1403/10/10", estimatedHours: "3", actualHours: "3.2" },
  { id: 4, orderNumber: "WO-1404", title: "تعمیر پمپ هیدرولیک", assetId: 8, assetName: "پمپ هیدرولیک", priority: "high", type: "corrective", status: "in_progress", assignedTo: "علی محمدی", scheduledDate: "1403/10/12", estimatedHours: "6", actualHours: "5" },
  { id: 5, orderNumber: "WO-1405", title: "کالیبراسیون سنسورهای دستگاه بسته‌بندی", assetId: 12, assetName: "دستگاه بسته‌بندی اتوماتیک", priority: "medium", type: "preventive", status: "open", assignedTo: "محمد کریمی", scheduledDate: "1403/10/20", estimatedHours: "2", actualHours: "0" },
  { id: 6, orderNumber: "WO-1406", title: "تعویض فیلتر روغن موتور", assetId: 10, assetName: "موتور الکتریکی", priority: "low", type: "preventive", status: "completed", assignedTo: "رضا احمدی", scheduledDate: "1403/10/08", estimatedHours: "1", actualHours: "0.8" },
  { id: 7, orderNumber: "WO-1407", title: "رفع نشتی سیستم روانکاری", assetId: 11, assetName: "سیستم روانکاری", priority: "high", type: "corrective", status: "open", assignedTo: "حسن رضایی", scheduledDate: "1403/10/16", estimatedHours: "4", actualHours: "0" },
  { id: 8, orderNumber: "WO-1408", title: "بررسی وایبرشن موتور الکتریکی", assetId: 10, assetName: "موتور الکتریکی", priority: "medium", type: "predictive", status: "completed", assignedTo: "محمد کریمی", scheduledDate: "1403/10/05", estimatedHours: "2", actualHours: "1.5" },
];

// Failures Data
export const failuresData: FailureData[] = [
  { id: 1, title: "خرابی بلبرینگ اصلی آسیاب", assetName: "دستگاه آسیاب صنعتی", severity: "critical", status: "open", failureType: "مکانیکی", downtimeHours: "12", cost: "25000000", createdAt: "1403/10/15" },
  { id: 2, title: "نشتی شدید روغن هیدرولیک", assetName: "پمپ هیدرولیک", severity: "high", status: "investigating", failureType: "هیدرولیک", downtimeHours: "8", cost: "15000000", createdAt: "1403/10/12" },
  { id: 3, title: "پارگی تسمه نوار نقاله", assetName: "نوار نقاله اصلی", severity: "high", status: "resolved", failureType: "مکانیکی", downtimeHours: "4", cost: "8000000", createdAt: "1403/10/10" },
  { id: 4, title: "افزایش دمای موتور الکتریکی", assetName: "موتور الکتریکی", severity: "medium", status: "resolved", failureType: "الکتریکی", downtimeHours: "2", cost: "5000000", createdAt: "1403/10/08" },
  { id: 5, title: "خرابی سنسور دما", assetName: "دستگاه بسته‌بندی اتوماتیک", severity: "medium", status: "open", failureType: "الکترونیکی", downtimeHours: "3", cost: "6000000", createdAt: "1403/10/14" },
  { id: 6, title: "فرسایش سیلندر پمپ", assetName: "پمپ هیدرولیک", severity: "high", status: "closed", failureType: "مکانیکی", downtimeHours: "16", cost: "35000000", createdAt: "1403/09/28" },
];

// Personnel Data
export const personnelData: PersonnelData[] = [
  { id: 1, fullName: "علی محمدی", username: "mohammadi", position: "سرپرست تعمیرات مکانیک", department: "تعمیرات مکانیک", role: "سرپرست", productivity: "94", completedWorkOrders: 45, workingHours: "380", isActive: true },
  { id: 2, fullName: "رضا احمدی", username: "ahmadi", position: "تکنسین برق", department: "تعمیرات برق", role: "تکنسین", productivity: "88", completedWorkOrders: 38, workingHours: "360", isActive: true },
  { id: 3, fullName: "حسن رضایی", username: "rezaei", position: "تکنسین مکانیک", department: "تعمیرات مکانیک", role: "تکنسین", productivity: "91", completedWorkOrders: 42, workingHours: "375", isActive: true },
  { id: 4, fullName: "محمد کریمی", username: "karimi", position: "کارشناس ابزار دقیق", department: "ابزار دقیق", role: "کارشناس", productivity: "86", completedWorkOrders: 35, workingHours: "350", isActive: true },
  { id: 5, fullName: "سعید نوری", username: "nouri", position: "تکنسین برق", department: "تعمیرات برق", role: "تکنسین", productivity: "82", completedWorkOrders: 30, workingHours: "340", isActive: true },
  { id: 6, fullName: "امیر حسینی", username: "hosseini", position: "سرپرست تعمیرات برق", department: "تعمیرات برق", role: "سرپرست", productivity: "90", completedWorkOrders: 40, workingHours: "370", isActive: true },
  { id: 7, fullName: "مهدی عباسی", username: "abbasi", position: "تکنسین هیدرولیک", department: "تعمیرات مکانیک", role: "تکنسین", productivity: "85", completedWorkOrders: 33, workingHours: "355", isActive: true },
];

// Spare Parts Data
export const sparePartsData: SparePartData[] = [
  { id: 1, code: "SP-001", name: "بلبرینگ 6205-2RS", category: "بلبرینگ", currentStock: 12, minimumStock: 5, unitPrice: "850000", status: "in_stock", location: "قفسه A-1" },
  { id: 2, code: "SP-002", name: "تسمه V-Belt B68", category: "تسمه", currentStock: 3, minimumStock: 5, unitPrice: "320000", status: "low_stock", location: "قفسه B-2" },
  { id: 3, code: "SP-003", name: "فیلتر روغن هیدرولیک", category: "فیلتر", currentStock: 8, minimumStock: 3, unitPrice: "450000", status: "in_stock", location: "قفسه C-1" },
  { id: 4, code: "SP-004", name: "اورینگ سیلندر 50mm", category: "واشر و اورینگ", currentStock: 0, minimumStock: 10, unitPrice: "120000", status: "out_of_stock", location: "قفسه A-3" },
  { id: 5, code: "SP-005", name: "سنسور دما PT100", category: "سنسور", currentStock: 6, minimumStock: 2, unitPrice: "1200000", status: "in_stock", location: "قفسه D-1" },
  { id: 6, code: "SP-006", name: "کنتاکتور 3RT60", category: "الکتریکی", currentStock: 4, minimumStock: 2, unitPrice: "2500000", status: "in_stock", location: "قفسه E-1" },
  { id: 7, code: "SP-007", name: "روغن هیدرولیک ISO 46", category: "روغن و گریس", currentStock: 2, minimumStock: 5, unitPrice: "680000", status: "low_stock", location: "قفسه F-1" },
  { id: 8, code: "SP-008", name: "شلنگ فشار قوی 1\"", category: "شلنگ و اتصالات", currentStock: 7, minimumStock: 3, unitPrice: "550000", status: "in_stock", location: "قفسه G-1" },
];

// PM Data
export const pmData: PMData[] = [
  { id: 1, title: "سرویس ماهانه آسیاب صنعتی", assetName: "دستگاه آسیاب صنعتی", type: "time", interval: 30, intervalUnit: "روز", nextDue: "1403/11/01", status: "active", assignedTo: "علی محمدی" },
  { id: 2, title: "بازدید هفتگی نوار نقاله", assetName: "نوار نقاله اصلی", type: "time", interval: 7, intervalUnit: "روز", nextDue: "1403/10/20", status: "active", assignedTo: "حسن رضایی" },
  { id: 3, title: "سرویس ۵۰۰ ساعته کمپرسور", assetName: "کمپرسور هوا", type: "hours", interval: 500, intervalUnit: "ساعت", nextDue: "1403/10/25", status: "active", assignedTo: "رضا احمدی" },
  { id: 4, title: "تعویض فیلتر روغن پمپ", assetName: "پمپ هیدرولیک", type: "time", interval: 14, intervalUnit: "روز", nextDue: "1403/10/28", status: "active", assignedTo: "علی محمدی" },
  { id: 5, title: "کالیبراسیون فصلی سنسورها", assetName: "دستگاه بسته‌بندی اتوماتیک", type: "time", interval: 90, intervalUnit: "روز", nextDue: "1403/12/15", status: "active", assignedTo: "محمد کریمی" },
  { id: 6, title: "بررسی وایبرشن ماهانه موتور", assetName: "موتور الکتریکی", type: "time", interval: 30, intervalUnit: "روز", nextDue: "1403/09/28", status: "overdue", assignedTo: "محمد کریمی" },
  { id: 7, title: "تعویض روغن ۱۰۰۰ ساعته", assetName: "کمپرسور هوا", type: "hours", interval: 1000, intervalUnit: "ساعت", nextDue: "1403/11/15", status: "active", assignedTo: "رضا احمدی" },
];

// Helper functions
export function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: "فعال", className: "badge-active" },
    inactive: { label: "غیرفعال", className: "badge-inactive" },
    maintenance: { label: "در تعمیر", className: "badge-maintenance" },
    failed: { label: "خراب", className: "badge-failed" },
    open: { label: "باز", className: "badge-open" },
    in_progress: { label: "در حال انجام", className: "badge-progress" },
    completed: { label: "تکمیل شده", className: "badge-completed" },
    cancelled: { label: "لغو شده", className: "badge-cancelled" },
    investigating: { label: "در حال بررسی", className: "badge-progress" },
    resolved: { label: "رفع شده", className: "badge-completed" },
    closed: { label: "بسته شده", className: "badge-cancelled" },
    in_stock: { label: "موجود", className: "badge-active" },
    low_stock: { label: "کم موجود", className: "badge-high" },
    out_of_stock: { label: "ناموجود", className: "badge-failed" },
    on_order: { label: "در سفارش", className: "badge-open" },
    critical: { label: "بحرانی", className: "badge-critical" },
    high: { label: "بالا", className: "badge-high" },
    medium: { label: "متوسط", className: "badge-medium" },
    low: { label: "پایین", className: "badge-low" },
    overdue: { label: "عقب‌افتاده", className: "badge-failed" },
    preventive: { label: "پیشگیرانه", className: "badge-active" },
    corrective: { label: "اصلاحی", className: "badge-high" },
    predictive: { label: "پیش‌بینانه", className: "badge-open" },
    emergency: { label: "اضطراری", className: "badge-critical" },
  };
  return map[status] || { label: status, className: "badge-inactive" };
}

export function formatNumber(num: string | number) {
  return Number(num).toLocaleString("fa-IR");
}
