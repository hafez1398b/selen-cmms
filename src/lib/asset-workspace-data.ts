// Sample data for Asset Workspace tabs

export interface AssetHistoryEvent {
  id: number;
  assetId: number;
  type: "failure" | "pm" | "repair" | "modification" | "inspection" | "install";
  title: string;
  description: string;
  date: string;
  by: string;
  cost?: number;
  duration?: number;
  status: "completed" | "in_progress" | "cancelled";
  attachments?: number;
}

export interface AssetDocument {
  id: number;
  assetId: number;
  type: "manual" | "drawing" | "certificate" | "photo" | "report" | "warranty";
  title: string;
  fileSize: string;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  version?: string;
}

export interface AssetSparePart {
  id: number;
  assetId: number;
  partCode: string;
  partName: string;
  category: string;
  quantity: number;
  supplier: string;
  lastReplaced?: string;
  nextReplacement?: string;
  criticality: "low" | "medium" | "high" | "critical";
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
}

export interface AssetPM {
  id: number;
  assetId: number;
  title: string;
  type: "time" | "meter" | "condition";
  interval: string;
  lastExecuted: string;
  nextDue: string;
  assignedTo: string;
  estimatedHours: number;
  status: "on_schedule" | "due_soon" | "overdue";
  standard: "ISO" | "TPM" | "RCM" | "Custom";
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const assetHistoryData: AssetHistoryEvent[] = [
  { id: 1, assetId: 13, type: "install", title: "نصب اولیه دستگاه", description: "نصب و راه‌اندازی توسط تیم Cannon", date: "1398/03/15", by: "تیم فنی Cannon", status: "completed", duration: 72 },
  { id: 2, assetId: 13, type: "pm", title: "سرویس ۳ ماهه اول", description: "بازدید و کالیبراسیون کامل سنسورها", date: "1398/06/20", by: "علی محمدی", status: "completed", duration: 4, cost: 3500000 },
  { id: 3, assetId: 13, type: "failure", title: "خرابی بلبرینگ اصلی", description: "لرزش غیرعادی، نیاز به تعویض", date: "1400/02/10", by: "حسن رضایی", status: "completed", duration: 6, cost: 15000000, attachments: 3 },
  { id: 4, assetId: 13, type: "repair", title: "تعمیر سیستم روانکاری", description: "تعویض پمپ و فیلترها", date: "1400/08/05", by: "رضا احمدی", status: "completed", duration: 8, cost: 12000000 },
  { id: 5, assetId: 13, type: "pm", title: "سرویس ماهانه", description: "بازدید روتین، تعویض روغن", date: "1402/09/12", by: "علی محمدی", status: "completed", duration: 3, cost: 2500000 },
  { id: 6, assetId: 13, type: "modification", title: "ارتقای سیستم کنترل", description: "به‌روزرسانی PLC به S7-1500", date: "1403/01/20", by: "محمد کریمی", status: "completed", duration: 24, cost: 45000000, attachments: 5 },
  { id: 7, assetId: 13, type: "inspection", title: "بازرسی بیمه", description: "بازرسی سالانه توسط شرکت بیمه", date: "1403/06/15", by: "شرکت بیمه", status: "completed", duration: 2 },
  { id: 8, assetId: 13, type: "pm", title: "سرویس ماهانه فعلی", description: "برنامه‌ریزی شده", date: "1403/11/01", by: "علی محمدی", status: "in_progress", duration: 4 },
];

export const assetDocumentsData: AssetDocument[] = [
  { id: 1, assetId: 13, type: "manual", title: "دفترچه راهنمای فنی", fileSize: "5.2 MB", mimeType: "application/pdf", uploadedBy: "مدیر فنی", uploadedAt: "1398/03/10", version: "v2.1" },
  { id: 2, assetId: 13, type: "drawing", title: "نقشه انفجاری کامل", fileSize: "3.8 MB", mimeType: "application/pdf", uploadedBy: "مدیر فنی", uploadedAt: "1398/03/12" },
  { id: 3, assetId: 13, type: "certificate", title: "گواهی CE اروپا", fileSize: "820 KB", mimeType: "application/pdf", uploadedBy: "امور کیفیت", uploadedAt: "1398/03/15" },
  { id: 4, assetId: 13, type: "warranty", title: "گارانتی ۲۴ ماهه", fileSize: "450 KB", mimeType: "application/pdf", uploadedBy: "امور بازرگانی", uploadedAt: "1398/03/15" },
  { id: 5, assetId: 13, type: "photo", title: "عکس نامپلیت", fileSize: "1.2 MB", mimeType: "image/jpeg", uploadedBy: "علی محمدی", uploadedAt: "1400/02/10" },
  { id: 6, assetId: 13, type: "report", title: "گزارش خرابی 1400/02", fileSize: "2.1 MB", mimeType: "application/pdf", uploadedBy: "حسن رضایی", uploadedAt: "1400/02/12" },
  { id: 7, assetId: 13, type: "manual", title: "راهنمای PLC S7-1500", fileSize: "8.7 MB", mimeType: "application/pdf", uploadedBy: "محمد کریمی", uploadedAt: "1403/01/22", version: "v4.0" },
];

export const assetSparePartsData: AssetSparePart[] = [
  { id: 1, assetId: 13, partCode: "SP-BRG-6205", partName: "بلبرینگ 6205-2RS", category: "بلبرینگ", quantity: 4, supplier: "SKF ایران", lastReplaced: "1400/02/10", nextReplacement: "1404/02/10", criticality: "high", stockStatus: "in_stock" },
  { id: 2, assetId: 13, partCode: "SP-OIL-46", partName: "روغن هیدرولیک ISO 46", category: "روغن و گریس", quantity: 12, supplier: "شرکت بهران", lastReplaced: "1403/06/01", nextReplacement: "1403/12/01", criticality: "medium", stockStatus: "in_stock" },
  { id: 3, assetId: 13, partCode: "SP-FLT-100", partName: "فیلتر هیدرولیک", category: "فیلتر", quantity: 2, supplier: "پارکر ایران", criticality: "high", stockStatus: "low_stock" },
  { id: 4, assetId: 13, partCode: "SP-SNS-PT100", partName: "سنسور دما PT100", category: "سنسور", quantity: 3, supplier: "Siemens", lastReplaced: "1402/05/20", criticality: "critical", stockStatus: "in_stock" },
  { id: 5, assetId: 13, partCode: "SP-BLT-V", partName: "تسمه V-Belt", category: "تسمه", quantity: 0, supplier: "بازار داخلی", criticality: "medium", stockStatus: "out_of_stock" },
  { id: 6, assetId: 13, partCode: "SP-SEL-100", partName: "سیل روغن", category: "واشر", quantity: 8, supplier: "بازار داخلی", criticality: "low", stockStatus: "in_stock" },
];

export const assetPMData: AssetPM[] = [
  { id: 1, assetId: 13, title: "سرویس روزانه", type: "time", interval: "روزانه", lastExecuted: "1403/10/28", nextDue: "1403/10/29", assignedTo: "اپراتور شیفت", estimatedHours: 0.5, status: "on_schedule", standard: "TPM" },
  { id: 2, assetId: 13, title: "سرویس هفتگی", type: "time", interval: "هفتگی", lastExecuted: "1403/10/25", nextDue: "1403/11/01", assignedTo: "حسن رضایی", estimatedHours: 2, status: "due_soon", standard: "TPM" },
  { id: 3, assetId: 13, title: "سرویس ماهانه اصلی", type: "time", interval: "ماهانه", lastExecuted: "1403/09/12", nextDue: "1403/11/01", assignedTo: "علی محمدی", estimatedHours: 4, status: "on_schedule", standard: "ISO" },
  { id: 4, assetId: 13, title: "سرویس ۵۰۰ ساعته", type: "meter", interval: "۵۰۰ ساعت", lastExecuted: "1403/07/15", nextDue: "1403/12/10", assignedTo: "علی محمدی", estimatedHours: 8, status: "on_schedule", standard: "RCM" },
  { id: 5, assetId: 13, title: "بازرسی وایبرشن", type: "condition", interval: "ماهانه", lastExecuted: "1403/09/28", nextDue: "1403/10/28", assignedTo: "محمد کریمی", estimatedHours: 1.5, status: "overdue", standard: "ISO" },
  { id: 6, assetId: 13, title: "بازرسی سالانه Overhaul", type: "time", interval: "سالانه", lastExecuted: "1402/12/20", nextDue: "1403/12/20", assignedTo: "تیم فنی", estimatedHours: 48, status: "on_schedule", standard: "ISO" },
];

// Helper functions
export function getAssetHistory(assetId: number): AssetHistoryEvent[] {
  return assetHistoryData.filter(h => h.assetId === assetId);
}

export function getAssetDocuments(assetId: number): AssetDocument[] {
  return assetDocumentsData.filter(d => d.assetId === assetId);
}

export function getAssetSpareParts(assetId: number): AssetSparePart[] {
  return assetSparePartsData.filter(p => p.assetId === assetId);
}

export function getAssetPMs(assetId: number): AssetPM[] {
  return assetPMData.filter(pm => pm.assetId === assetId);
}
