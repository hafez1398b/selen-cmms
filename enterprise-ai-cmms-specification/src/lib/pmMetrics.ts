// World-class PM/Maintenance KPIs based on SMRP (Society for Maintenance & Reliability Professionals)
// and ISO 14224 / EN 15341 standards.
import type { WorkOrder, PMPlan, Equipment, SparePart } from './types';

export interface PMMetric {
  key: string;
  label: string;
  labelEn: string;
  value: number;
  unit: string;
  target?: number;
  benchmark?: string; // World-class benchmark
  status: 'excellent' | 'good' | 'fair' | 'poor';
  trend?: number; // % change vs previous period
  description: string;
  formula: string;
  category: 'reliability' | 'maintenance' | 'cost' | 'inventory' | 'planning' | 'safety';
}

const status = (value: number, target: number, higherIsBetter = true): PMMetric['status'] => {
  const ratio = higherIsBetter ? value / target : target / value;
  if (ratio >= 1.0) return 'excellent';
  if (ratio >= 0.85) return 'good';
  if (ratio >= 0.70) return 'fair';
  return 'poor';
};

// ====== RELIABILITY METRICS ======

/** MTBF - Mean Time Between Failures (hours) */
export function calcMTBF(wos: WorkOrder[], equipment: Equipment[]): number {
  const failures = wos.filter(w => w.type === 'corrective' || w.type === 'emergency').length;
  if (failures === 0) return 8760; // 1 year if no failures
  const activeAssets = equipment.filter(e => e.status === 'active').length || 1;
  const totalOperatingHours = activeAssets * 8760 * 0.85; // assume 85% uptime
  return totalOperatingHours / failures;
}

/** MTTR - Mean Time To Repair (hours) */
export function calcMTTR(wos: WorkOrder[]): number {
  const completed = wos.filter(w => w.actualStart && w.actualEnd);
  if (completed.length === 0) return 0;
  const totalRepairHours = completed.reduce((sum, w) => {
    const s = new Date(w.actualStart!).getTime();
    const e = new Date(w.actualEnd!).getTime();
    return sum + Math.max(0, (e - s) / 3600000);
  }, 0);
  return totalRepairHours / completed.length;
}

/** MTTF - Mean Time To Failure (hours) - for non-repairable items */
export function calcMTTF(mtbf: number, mttr: number): number {
  return Math.max(0, mtbf - mttr);
}

/** Availability % = MTBF / (MTBF + MTTR) */
export function calcAvailability(mtbf: number, mttr: number): number {
  if (mtbf + mttr === 0) return 100;
  return (mtbf / (mtbf + mttr)) * 100;
}

/** Reliability % at time t (Exponential distribution) */
export function calcReliability(mtbf: number, t = 720): number {
  if (mtbf === 0) return 0;
  return Math.exp(-t / mtbf) * 100;
}

// ====== MAINTENANCE PERFORMANCE ======

/** PM Compliance % */
export function calcPMCompliance(pms: PMPlan[]): number {
  if (pms.length === 0) return 100;
  return pms.reduce((s, p) => s + p.compliance, 0) / pms.length;
}

/** Schedule Adherence % - planned vs actual start */
export function calcScheduleAdherence(wos: WorkOrder[]): number {
  const planned = wos.filter(w => w.actualStart && w.plannedStart);
  if (planned.length === 0) return 100;
  const onTime = planned.filter(w => {
    const planned = new Date(w.plannedStart).getTime();
    const actual = new Date(w.actualStart!).getTime();
    return Math.abs(actual - planned) < 86400000; // within 24h
  }).length;
  return (onTime / planned.length) * 100;
}

/** PM vs CM Ratio (Preventive to Corrective ratio) */
export function calcPMtoCMRatio(wos: WorkOrder[]): number {
  const pm = wos.filter(w => w.type === 'preventive').length;
  const cm = wos.filter(w => w.type === 'corrective' || w.type === 'emergency').length;
  if (cm === 0) return pm > 0 ? 99 : 0;
  return (pm / cm) * 100;
}

/** Planned Work Ratio % */
export function calcPlannedWorkRatio(wos: WorkOrder[]): number {
  if (wos.length === 0) return 0;
  const planned = wos.filter(w => w.type === 'preventive' || w.type === 'predictive' || w.type === 'inspection').length;
  return (planned / wos.length) * 100;
}

/** Reactive Work % (Emergency/Breakdown) */
export function calcReactiveWork(wos: WorkOrder[]): number {
  if (wos.length === 0) return 0;
  const reactive = wos.filter(w => w.type === 'emergency' || (w.type === 'corrective' && w.priority === 'critical')).length;
  return (reactive / wos.length) * 100;
}

/** WO Backlog (weeks of work) */
export function calcBacklog(wos: WorkOrder[]): number {
  const open = wos.filter(w => !['completed', 'closed'].includes(w.status));
  const totalHours = open.reduce((s, w) => s + (w.laborHours || 0), 0);
  // assume 40h/week per technician, 5 technicians = 200h/week capacity
  return totalHours / 200;
}

/** Overdue WO % */
export function calcOverdueRate(wos: WorkOrder[]): number {
  const open = wos.filter(w => !['completed', 'closed'].includes(w.status));
  if (open.length === 0) return 0;
  const overdue = open.filter(w => new Date(w.plannedEnd) < new Date()).length;
  return (overdue / open.length) * 100;
}

/** Wrench Time % (productive time vs total time) */
export function calcWrenchTime(wos: WorkOrder[]): number {
  // Industry average ~25-35%, world-class ~55%
  const completed = wos.filter(w => w.status === 'completed' || w.status === 'closed');
  if (completed.length === 0) return 0;
  // Estimate based on actual vs planned labor hours
  const productive = completed.reduce((s, w) => s + (w.laborHours || 0), 0);
  const total = completed.length * 8; // assume 8h shift
  return Math.min(100, (productive / Math.max(total, 1)) * 100);
}

// ====== COST METRICS ======

/** Total Maintenance Cost */
export function calcMaintCost(wos: WorkOrder[]): number {
  return wos.reduce((s, w) => s + (w.actualCost || w.estimatedCost || 0), 0);
}

/** Maintenance Cost per Asset */
export function calcCostPerAsset(wos: WorkOrder[], equipment: Equipment[]): number {
  const cost = calcMaintCost(wos);
  const assets = equipment.filter(e => e.status === 'active').length || 1;
  return cost / assets;
}

/** Emergency Maintenance Cost % */
export function calcEmergencyCostRatio(wos: WorkOrder[]): number {
  const total = calcMaintCost(wos);
  if (total === 0) return 0;
  const emergency = wos.filter(w => w.type === 'emergency').reduce((s, w) => s + (w.actualCost || w.estimatedCost || 0), 0);
  return (emergency / total) * 100;
}

/** Cost Variance % (actual vs estimated) */
export function calcCostVariance(wos: WorkOrder[]): number {
  const completed = wos.filter(w => (w.status === 'completed' || w.status === 'closed') && w.actualCost && w.estimatedCost);
  if (completed.length === 0) return 0;
  const totalEstimated = completed.reduce((s, w) => s + w.estimatedCost, 0);
  const totalActual = completed.reduce((s, w) => s + w.actualCost, 0);
  if (totalEstimated === 0) return 0;
  return ((totalActual - totalEstimated) / totalEstimated) * 100;
}

// ====== INVENTORY METRICS ======

/** Spare Parts Stock-out Rate % */
export function calcStockoutRate(parts: SparePart[]): number {
  if (parts.length === 0) return 0;
  return (parts.filter(p => p.stock === 0).length / parts.length) * 100;
}

/** Inventory Turnover */
export function calcInventoryTurnover(parts: SparePart[]): number {
  const stockValue = parts.reduce((s, p) => s + p.stock * p.unitCost, 0);
  const consumption = parts.reduce((s, p) => s + p.consumptionForecast90 * 4 * p.unitCost, 0); // annual
  if (stockValue === 0) return 0;
  return consumption / stockValue;
}

// ====== SAFETY ======

/** Days since last incident (mocked from emergency WO history) */
export function calcDaysSinceIncident(wos: WorkOrder[]): number {
  const incidents = wos.filter(w => w.type === 'emergency' && w.priority === 'critical').sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  if (incidents.length === 0) return 365;
  const last = new Date(incidents[0].createdAt).getTime();
  return Math.floor((Date.now() - last) / 86400000);
}

// ====== AGGREGATOR ======

export function computeAllPMMetrics(wos: WorkOrder[], pms: PMPlan[], equipment: Equipment[], parts: SparePart[]): PMMetric[] {
  const mtbf = calcMTBF(wos, equipment);
  const mttr = calcMTTR(wos);
  const mttf = calcMTTF(mtbf, mttr);
  const availability = calcAvailability(mtbf, mttr);
  const reliability = calcReliability(mtbf);
  const pmCompliance = calcPMCompliance(pms);
  const scheduleAdh = calcScheduleAdherence(wos);
  const pmCmRatio = calcPMtoCMRatio(wos);
  const plannedRatio = calcPlannedWorkRatio(wos);
  const reactive = calcReactiveWork(wos);
  const backlog = calcBacklog(wos);
  const overdue = calcOverdueRate(wos);
  const wrench = calcWrenchTime(wos);
  const cost = calcMaintCost(wos);
  const costPerAsset = calcCostPerAsset(wos, equipment);
  const emergencyCost = calcEmergencyCostRatio(wos);
  const costVar = calcCostVariance(wos);
  const stockout = calcStockoutRate(parts);
  const turnover = calcInventoryTurnover(parts);
  const daysSafe = calcDaysSinceIncident(wos);

  return [
    {
      key: 'mtbf', label: 'میانگین زمان بین خرابی‌ها', labelEn: 'MTBF',
      value: mtbf, unit: 'ساعت', target: 720, benchmark: 'کلاس جهانی: ≥ ۷۲۰ ساعت',
      status: status(mtbf, 720), description: 'میانگین ساعت کارکرد بین دو خرابی متوالی',
      formula: 'MTBF = مجموع ساعات کارکرد ÷ تعداد خرابی‌ها',
      category: 'reliability',
    },
    {
      key: 'mttr', label: 'میانگین زمان تعمیر', labelEn: 'MTTR',
      value: mttr, unit: 'ساعت', target: 4, benchmark: 'کلاس جهانی: ≤ ۴ ساعت',
      status: status(mttr, 4, false), description: 'میانگین زمان مورد نیاز برای تعمیر یک خرابی',
      formula: 'MTTR = مجموع ساعات تعمیر ÷ تعداد تعمیرات',
      category: 'maintenance',
    },
    {
      key: 'mttf', label: 'میانگین زمان تا خرابی', labelEn: 'MTTF',
      value: mttf, unit: 'ساعت', target: 700, benchmark: 'صنعت پروسس: ≥ ۷۰۰ ساعت',
      status: status(mttf, 700), description: 'میانگین زمان کارکرد تجهیز تا اولین خرابی',
      formula: 'MTTF = MTBF - MTTR',
      category: 'reliability',
    },
    {
      key: 'availability', label: 'دسترس‌پذیری', labelEn: 'Availability',
      value: availability, unit: '٪', target: 95, benchmark: 'کلاس جهانی: ≥ ۹۵٪ — صنعت: ≥ ۹۰٪',
      status: status(availability, 95), description: 'درصد زمانی که تجهیز آماده بهره‌برداری است',
      formula: 'A = MTBF ÷ (MTBF + MTTR) × 100',
      category: 'reliability',
    },
    {
      key: 'reliability', label: 'قابلیت اطمینان (۳۰ روز)', labelEn: 'Reliability R(t)',
      value: reliability, unit: '٪', target: 85,
      status: status(reliability, 85), description: 'احتمال کارکرد بدون خرابی در ۳۰ روز آینده',
      formula: 'R(t) = e^(-t/MTBF) — t = 720h',
      category: 'reliability',
    },
    {
      key: 'pm_compliance', label: 'انطباق نگهداری پیشگیرانه', labelEn: 'PM Compliance',
      value: pmCompliance, unit: '٪', target: 90, benchmark: 'SMRP: ≥ ۹۰٪',
      status: status(pmCompliance, 90), description: 'درصد PMهای انجام‌شده در زمان مقرر',
      formula: 'PMC = (PM به‌موقع ÷ PM زمان‌بندی‌شده) × 100',
      category: 'planning',
    },
    {
      key: 'schedule_adherence', label: 'پایبندی به برنامه', labelEn: 'Schedule Adherence',
      value: scheduleAdh, unit: '٪', target: 85, benchmark: 'SMRP: ≥ ۸۵٪',
      status: status(scheduleAdh, 85), description: 'درصد دستور کارهایی که در زمان برنامه‌ریزی‌شده آغاز شدند',
      formula: 'SA = (WO شروع‌شده طبق برنامه ÷ کل WO) × 100',
      category: 'planning',
    },
    {
      key: 'pm_cm_ratio', label: 'نسبت PM به CM', labelEn: 'PM:CM Ratio',
      value: pmCmRatio, unit: '٪', target: 600, benchmark: 'کلاس جهانی: ۶:۱ یا بیشتر',
      status: status(pmCmRatio, 600), description: 'نسبت نگهداری پیشگیرانه به اصلاحی',
      formula: 'Ratio = (PM ÷ CM) × 100',
      category: 'planning',
    },
    {
      key: 'planned_ratio', label: 'نسبت کار برنامه‌ریزی‌شده', labelEn: 'Planned Work %',
      value: plannedRatio, unit: '٪', target: 85, benchmark: 'SMRP: ≥ ۸۵٪',
      status: status(plannedRatio, 85), description: 'درصد کارهای از پیش برنامه‌ریزی‌شده',
      formula: 'PW = (WO برنامه‌ریزی‌شده ÷ کل) × 100',
      category: 'planning',
    },
    {
      key: 'reactive_work', label: 'کار واکنشی (اضطراری)', labelEn: 'Reactive Work %',
      value: reactive, unit: '٪', target: 10, benchmark: 'کلاس جهانی: ≤ ۱۰٪',
      status: status(reactive, 10, false), description: 'درصد کارهای اضطراری و واکنشی',
      formula: 'RW = (WO اضطراری ÷ کل) × 100',
      category: 'maintenance',
    },
    {
      key: 'backlog', label: 'بک‌لاگ دستور کار', labelEn: 'WO Backlog',
      value: backlog, unit: 'هفته', target: 4, benchmark: 'SMRP: ۲-۴ هفته',
      status: status(backlog, 4, false), description: 'حجم کار باز برحسب هفته ظرفیت تیم',
      formula: 'Backlog = ساعات کار باز ÷ ظرفیت هفتگی',
      category: 'planning',
    },
    {
      key: 'overdue', label: 'نرخ معوقات', labelEn: 'Overdue %',
      value: overdue, unit: '٪', target: 5, benchmark: 'هدف: ≤ ۵٪',
      status: status(overdue, 5, false), description: 'درصد دستور کارهای از موعد گذشته',
      formula: 'OR = (WO معوق ÷ WO باز) × 100',
      category: 'maintenance',
    },
    {
      key: 'wrench_time', label: 'زمان مفید کار', labelEn: 'Wrench Time',
      value: wrench, unit: '٪', target: 55, benchmark: 'کلاس جهانی: ≥ ۵۵٪ — صنعت: ۲۵-۳۵٪',
      status: status(wrench, 55), description: 'درصد زمان واقعی صرف‌شده برای انجام کار',
      formula: 'WT = (ساعات مولد ÷ ساعات کاری) × 100',
      category: 'maintenance',
    },
    {
      key: 'maint_cost', label: 'هزینه کل تعمیرات', labelEn: 'Total Maint. Cost',
      value: cost, unit: 'ریال', status: 'good',
      description: 'مجموع هزینه‌های نگهداری و تعمیرات در دوره',
      formula: 'Σ هزینه‌های واقعی WO',
      category: 'cost',
    },
    {
      key: 'cost_per_asset', label: 'هزینه به ازای دارایی', labelEn: 'Cost per Asset',
      value: costPerAsset, unit: 'ریال', status: 'good',
      description: 'میانگین هزینه نگهداری برای هر تجهیز فعال',
      formula: 'هزینه کل ÷ تعداد دارایی‌های فعال',
      category: 'cost',
    },
    {
      key: 'emergency_cost', label: 'سهم هزینه اضطراری', labelEn: 'Emergency Cost %',
      value: emergencyCost, unit: '٪', target: 10, benchmark: 'هدف: ≤ ۱۰٪',
      status: status(emergencyCost, 10, false), description: 'درصد هزینه‌های اضطراری از کل',
      formula: '(هزینه اضطراری ÷ کل) × 100',
      category: 'cost',
    },
    {
      key: 'cost_variance', label: 'انحراف هزینه از برآورد', labelEn: 'Cost Variance %',
      value: costVar, unit: '٪', target: 10, benchmark: 'هدف: ≤ ±۱۰٪',
      status: status(Math.abs(costVar), 10, false), description: 'اختلاف هزینه واقعی با برآورد اولیه',
      formula: '((واقعی - برآورد) ÷ برآورد) × 100',
      category: 'cost',
    },
    {
      key: 'stockout', label: 'نرخ کمبود انبار', labelEn: 'Stockout Rate %',
      value: stockout, unit: '٪', target: 2, benchmark: 'کلاس جهانی: ≤ ۲٪',
      status: status(stockout, 2, false), description: 'درصد قطعاتی که موجودی صفر دارند',
      formula: '(اقلام صفر ÷ کل اقلام) × 100',
      category: 'inventory',
    },
    {
      key: 'turnover', label: 'گردش انبار سالانه', labelEn: 'Inventory Turnover',
      value: turnover, unit: 'بار/سال', target: 3, benchmark: 'صنعت: ۲-۴ بار',
      status: status(turnover, 3), description: 'تعداد دفعات تخلیه کامل انبار در سال',
      formula: 'مصرف سالانه ÷ ارزش موجودی',
      category: 'inventory',
    },
    {
      key: 'days_safe', label: 'روز بدون حادثه', labelEn: 'Days Without Incident',
      value: daysSafe, unit: 'روز', target: 365, benchmark: 'هدف: ≥ ۳۶۵ روز',
      status: status(daysSafe, 365), description: 'تعداد روز از آخرین حادثه ایمنی',
      formula: 'امروز - تاریخ آخرین حادثه',
      category: 'safety',
    },
  ];
}

// ====== AI ANALYSIS OF PM METRICS ======

export interface MetricAnalysis {
  metric: PMMetric;
  diagnosis: string;
  recommendations: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export function analyzeMetric(metric: PMMetric): MetricAnalysis {
  const recs: string[] = [];
  let diagnosis = '';
  let priority: MetricAnalysis['priority'] = 'medium';

  switch (metric.key) {
    case 'mtbf':
      if (metric.status === 'poor') {
        diagnosis = `MTBF در سطح بحرانی ${metric.value.toFixed(0)} ساعت قرار دارد که نشان‌دهنده خرابی‌های مکرر است.`;
        priority = 'critical';
        recs.push('اجرای فوری RCA (Root Cause Analysis) برای ۵ تجهیز با بیشترین خرابی');
        recs.push('بازنگری برنامه PM و افزایش تواتر برای تجهیزات بحرانی');
        recs.push('بررسی کیفیت قطعات یدکی و تأمین‌کنندگان');
        recs.push('پیاده‌سازی Condition Monitoring برای تجهیزات حیاتی');
      } else if (metric.status === 'fair') {
        diagnosis = `MTBF نیاز به بهبود دارد. الگوی خرابی‌ها را بررسی کنید.`;
        priority = 'high';
        recs.push('شناسایی ۳ خرابی پرتکرار و اجرای FMEA');
        recs.push('بازنگری چک‌لیست‌های PM موجود');
      } else {
        diagnosis = `عملکرد قابل قبول. ادامه روند فعلی توصیه می‌شود.`;
        recs.push('حفظ برنامه فعلی PM');
        recs.push('شناسایی Best Practiceها برای تجهیزات با بهترین عملکرد');
      }
      break;

    case 'mttr':
      if (metric.status === 'poor') {
        diagnosis = `MTTR بالا (${metric.value.toFixed(1)} ساعت) نشان‌دهنده ضعف در فرایند تعمیر است.`;
        priority = 'critical';
        recs.push('آموزش تکنسین‌ها در تعمیرات سریع (Quick Repair)');
        recs.push('تأمین قطعات یدکی پرمصرف در محل کار');
        recs.push('تهیه دستورالعمل‌های تصویری/ویدئویی تعمیر');
        recs.push('پیاده‌سازی Standard Operating Procedures (SOP)');
      } else {
        diagnosis = `زمان تعمیر در محدوده قابل قبول است.`;
        recs.push('بررسی فرصت‌های کاهش بیشتر زمان تعمیر');
      }
      break;

    case 'availability':
      if (metric.value < 90) {
        diagnosis = `دسترس‌پذیری پایین‌تر از حد استاندارد صنعت (۹۰٪) است.`;
        priority = 'critical';
        recs.push('کاهش MTTR از طریق پیش‌سازی قطعات (Kitting)');
        recs.push('افزایش MTBF با اجرای PM دقیق‌تر');
        recs.push('بررسی Spare Parts Strategy برای تجهیزات بحرانی');
      } else {
        diagnosis = `دسترس‌پذیری مطلوب و در سطح استاندارد جهانی است.`;
        recs.push('حفظ وضعیت فعلی');
      }
      break;

    case 'pm_compliance':
      if (metric.value < 80) {
        diagnosis = `انطباق PM پایین — این به معنی افزایش ریسک خرابی برنامه‌ریزی‌نشده است.`;
        priority = 'high';
        recs.push('تحلیل علل عدم اجرای PM (کمبود نفر؟ قطعه؟ زمان؟)');
        recs.push('بازنگری زمان‌بندی PM متناسب با ظرفیت تیم');
        recs.push('استفاده از سیستم اعلان خودکار برای PMهای سررسید');
      } else {
        diagnosis = `انطباق PM در سطح خوبی قرار دارد.`;
        recs.push('تلاش برای رسیدن به سطح کلاس جهانی (≥۹۰٪)');
      }
      break;

    case 'reactive_work':
      if (metric.value > 30) {
        diagnosis = `سهم بالای کار واکنشی (${metric.value.toFixed(0)}٪) نشان‌دهنده Reactive Culture است.`;
        priority = 'critical';
        recs.push('گذار از Reactive به Preventive — هدف: کاهش به <۲۰٪ در ۶ ماه');
        recs.push('سرمایه‌گذاری در آموزش و ابزارهای پیش‌بینی');
        recs.push('اجرای RCM (Reliability Centered Maintenance)');
        recs.push('استفاده از تکنیک‌های Predictive (vibration, thermography, oil analysis)');
      } else if (metric.value > 15) {
        diagnosis = `کار واکنشی نسبتاً زیاد — قابل بهبود.`;
        priority = 'high';
        recs.push('تحلیل Pareto علل خرابی‌های اضطراری');
      } else {
        diagnosis = `سهم کار واکنشی در سطح مطلوب است.`;
      }
      break;

    case 'backlog':
      if (metric.value > 6) {
        diagnosis = `بک‌لاگ بالا (${metric.value.toFixed(1)} هفته) — احتمال تأخیر و فرسایش تیم.`;
        priority = 'high';
        recs.push('اولویت‌بندی مجدد بر اساس بحرانی بودن تجهیزات');
        recs.push('بررسی نیاز به افزایش ظرفیت تیم یا برون‌سپاری');
        recs.push('حذف یا تجمیع کارهای کم‌اولویت');
      } else if (metric.value < 2) {
        diagnosis = `بک‌لاگ خیلی کم — احتمال بیکاری منابع.`;
        recs.push('بازنگری برنامه PM و افزایش گام‌های بازرسی');
      } else {
        diagnosis = `بک‌لاگ در سطح بهینه قرار دارد.`;
      }
      break;

    case 'wrench_time':
      if (metric.value < 30) {
        diagnosis = `زمان مفید پایین — تکنسین‌ها زمان زیادی را صرف فعالیت‌های غیرمولد می‌کنند.`;
        priority = 'high';
        recs.push('کاهش زمان جستجوی قطعه با Kitting و Staging');
        recs.push('بهبود برنامه‌ریزی و کاهش رفت و آمد');
        recs.push('پیاده‌سازی Pre-Job Planning استاندارد');
      } else {
        diagnosis = `زمان مفید در سطح خوبی قرار دارد.`;
      }
      break;

    case 'emergency_cost':
      if (metric.value > 20) {
        diagnosis = `هزینه اضطراری بالا (${metric.value.toFixed(0)}٪) — معمولاً ۳-۹ برابر هزینه PM است.`;
        priority = 'critical';
        recs.push('سرمایه‌گذاری در PM می‌تواند ROI ۳۰۰٪ داشته باشد');
        recs.push('شناسایی تجهیزاتی که بیشترین هزینه اضطراری دارند');
      } else {
        diagnosis = `سهم هزینه اضطراری در حد قابل قبول است.`;
      }
      break;

    case 'stockout':
      if (metric.value > 5) {
        diagnosis = `کمبود انبار باعث تأخیر در تعمیرات و افزایش MTTR می‌شود.`;
        priority = 'high';
        recs.push('بازنگری نقاط سفارش (Reorder Point)');
        recs.push('شناسایی قطعات بحرانی و افزایش Safety Stock');
        recs.push('تنوع‌بخشی به تأمین‌کنندگان برای کاهش ریسک');
      } else {
        diagnosis = `مدیریت انبار مطلوب است.`;
      }
      break;

    default:
      diagnosis = metric.status === 'excellent' ? 'وضعیت عالی است.' :
        metric.status === 'good' ? 'وضعیت مطلوب است.' :
          metric.status === 'fair' ? 'نیاز به بهبود دارد.' :
            'نیاز فوری به اقدام دارد.';
      if (metric.status === 'poor') priority = 'high';
  }

  if (recs.length === 0) recs.push('ادامه پایش و حفظ روند فعلی');

  return { metric, diagnosis, recommendations: recs, priority };
}
