// AI insights engine — heuristic, deterministic, Baspar Foam Gharb domain-aware.
// In production these would be Supabase Edge Functions calling GPT-4o.
import type { Equipment, WorkOrder, PMPlan, SparePart, User } from './types';

export interface AIInsight {
  id: string;
  level: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  body: string;
  recommendation: string;
  reasoning: string;
  confidence: number; // 0-100
}

let _idc = 0;
const mk = (i: Omit<AIInsight, 'id'>): AIInsight => ({ id: `ai_${++_idc}`, ...i });

export function analyzeEquipment(eq: Equipment, wos: WorkOrder[]): AIInsight[] {
  const out: AIInsight[] = [];
  const eqWOs = wos.filter(w => w.equipmentId === eq.id);
  const emergencies = eqWOs.filter(w => w.type === 'emergency').length;

  if (eq.healthScore < 60) {
    out.push(mk({
      level: 'critical',
      title: `سلامت بحرانی: ${eq.name}`,
      body: `امتیاز سلامت ${eq.healthScore} نشان‌دهنده وضعیت نگران‌کننده است.`,
      recommendation: 'برنامه‌ریزی فوری برای بازرسی کامل و بازنگری PM',
      reasoning: `ترکیب امتیاز سلامت پایین، RUL ${eq.rulDays} روز و ${emergencies} خرابی اضطراری در سابقه.`,
      confidence: 88,
    }));
  } else if (eq.healthScore < 80) {
    out.push(mk({
      level: 'warning',
      title: 'نیاز به توجه',
      body: `${eq.name} در محدوده هشدار قرار دارد (${eq.healthScore}/۱۰۰).`,
      recommendation: 'افزایش تواتر PM به ۳۰٪ کمتر از مقدار فعلی',
      reasoning: 'الگوی کاهش تدریجی سلامت در ۳ ماه اخیر تشخیص داده شد.',
      confidence: 76,
    }));
  } else {
    out.push(mk({
      level: 'success',
      title: 'وضعیت پایدار',
      body: `${eq.name} با سلامت ${eq.healthScore} در محدوده مطلوب است.`,
      recommendation: 'حفظ برنامه فعلی PM و مانیتورینگ معمول',
      reasoning: 'هیچ روند نزولی معناداری مشاهده نشد.',
      confidence: 92,
    }));
  }

  if (eq.rulDays < 90 && eq.criticality === 'critical') {
    out.push(mk({
      level: 'critical',
      title: 'هشدار RUL پایین',
      body: `عمر مفید باقی‌مانده تنها ${eq.rulDays} روز برآورد می‌شود.`,
      recommendation: 'سفارش قطعات یدکی کلیدی و برنامه‌ریزی اورهال در پنجره خاموشی بعدی',
      reasoning: 'تجهیز بحرانی + RUL کوتاه + احتمال خرابی برنامه‌ریزی‌نشده بالا.',
      confidence: 84,
    }));
  }

  return out;
}

export function analyzeWorkOrders(wos: WorkOrder[]): AIInsight[] {
  const total = wos.length;
  const overdue = wos.filter(w => new Date(w.plannedEnd) < new Date() && !['completed', 'closed'].includes(w.status)).length;
  const emergency = wos.filter(w => w.type === 'emergency').length;
  const out: AIInsight[] = [];

  if (overdue > 0) {
    out.push(mk({
      level: 'warning',
      title: `${overdue} دستور کار معوق`,
      body: `از مجموع ${total} دستور کار، ${overdue} مورد از موعد گذشته است.`,
      recommendation: 'بازتوزیع بار کاری به تکنسین‌های با ظرفیت آزاد و فعال‌سازی Escalation سطح ۲',
      reasoning: 'تحلیل بار کاری نشان می‌دهد ۲ تکنسین ظرفیت آزاد دارند.',
      confidence: 81,
    }));
  }

  if (emergency / Math.max(total, 1) > 0.15) {
    out.push(mk({
      level: 'critical',
      title: 'نسبت بالای اضطراری',
      body: `${Math.round(emergency / total * 100)}٪ دستور کارها از نوع اضطراری بوده‌اند.`,
      recommendation: 'بازنگری برنامه PM خط تولید ۱ و میکسر اصلی',
      reasoning: 'تحلیل NLP توضیحات WO نشان می‌دهد ۷۲٪ خرابی‌ها قابل پیشگیری بوده‌اند.',
      confidence: 79,
    }));
  }

  out.push(mk({
    level: 'info',
    title: 'بهینه‌سازی زمان‌بندی',
    body: 'با تجمیع PMهای مکانیکی خط ۱ در یک پنجره ۴ ساعته، می‌توان ۲۲٪ زمان توقف را کاهش داد.',
    recommendation: 'تجمیع PMهای میکسر، نوار نقاله و پمپ MDI در شیفت شب چهارشنبه',
    reasoning: 'تحلیل تقویم تولید + ظرفیت پرسنل + وابستگی تجهیزات.',
    confidence: 86,
  }));

  return out;
}

export function analyzeInventory(parts: SparePart[]): AIInsight[] {
  const low = parts.filter(p => p.stock < p.min);
  const overstock = parts.filter(p => p.stock > p.max * 0.9);
  const out: AIInsight[] = [];

  if (low.length > 0) {
    out.push(mk({
      level: 'critical',
      title: `${low.length} قلم کالا زیر حداقل`,
      body: `قطعات کلیدی شامل ${low.slice(0, 3).map(p => p.name).join('، ')} نیاز فوری به سفارش دارند.`,
      recommendation: `صدور درخواست خرید فوری برای ${low.length} قلم با لیدتایم ۷–۳۰ روز`,
      reasoning: 'پیش‌بینی مصرف ۳۰ روز آینده بیش از موجودی فعلی است.',
      confidence: 93,
    }));
  }

  if (overstock.length > 0) {
    out.push(mk({
      level: 'info',
      title: 'موجودی مازاد',
      body: `${overstock.length} قلم به سقف موجودی نزدیک شده‌اند که سرمایه راکد ایجاد می‌کند.`,
      recommendation: 'بازنگری Max-Level و مذاکره با تأمین‌کننده برای کاهش حجم سفارش',
      reasoning: 'پیش‌بینی مصرف ۹۰ روز کمتر از ۳۰٪ موجودی فعلی است.',
      confidence: 71,
    }));
  }

  out.push(mk({
    level: 'success',
    title: 'پیش‌بینی هوشمند تأمین',
    body: 'با تنظیم نقطه سفارش بر اساس مصرف واقعی، می‌توان ۱۸٪ هزینه انبار را کاهش داد.',
    recommendation: 'به‌کارگیری EOQ و Safety Stock پویا',
    reasoning: 'تحلیل مصرف ۱۲ ماه گذشته + lead time تأمین‌کنندگان.',
    confidence: 82,
  }));

  return out;
}

export function analyzePersonnel(users: User[], wos: WorkOrder[]): AIInsight[] {
  const techs = users.filter(u => u.role === 'technician');
  if (techs.length === 0) return [];
  const top = [...techs].sort((a, b) => b.performance - a.performance)[0];
  const bottom = [...techs].sort((a, b) => a.performance - b.performance)[0];
  const out: AIInsight[] = [];

  out.push(mk({
    level: 'success',
    title: `بهترین عملکرد: ${top.name}`,
    body: `با امتیاز ${top.performance} و ${wos.filter(w => w.assignedTo.includes(top.id)).length} دستور کار محول‌شده، در صدر قرار دارد.`,
    recommendation: 'پیشنهاد پاداش عملکرد و سپردن آموزش به سایر تکنسین‌ها',
    reasoning: 'ترکیب نرخ تکمیل + کیفیت + پایبندی به زمان‌بندی.',
    confidence: 89,
  }));

  if (bottom.performance < 80) {
    out.push(mk({
      level: 'warning',
      title: 'نیاز به آموزش',
      body: `${bottom.name} با امتیاز ${bottom.performance} نیاز به برنامه توسعه فردی دارد.`,
      recommendation: `دوره مهارت‌افزایی در ${bottom.skills[0] || 'مهارت اصلی'} طی ۳۰ روز آینده`,
      reasoning: 'الگوی کاهش نرخ تکمیل دستور کار در ۲ ماه اخیر.',
      confidence: 74,
    }));
  }

  return out;
}

export function analyzePM(pms: PMPlan[]): AIInsight[] {
  const overdue = pms.filter(p => new Date(p.nextDue) < new Date()).length;
  const lowCompliance = pms.filter(p => p.compliance < 85).length;
  const out: AIInsight[] = [];

  if (overdue > 0) {
    out.push(mk({
      level: 'warning',
      title: `${overdue} PM معوق`,
      body: 'برنامه‌های PM زیر سررسید شده‌اند و نیاز به اجرای فوری دارند.',
      recommendation: 'تخصیص فوری تکنسین و اجرا در شیفت بعدی',
      reasoning: 'تأخیر در PM، احتمال خرابی برنامه‌ریزی‌نشده را ۴.۲ برابر می‌کند.',
      confidence: 91,
    }));
  }

  if (lowCompliance > 0) {
    out.push(mk({
      level: 'warning',
      title: 'انطباق پایین',
      body: `${lowCompliance} PM با انطباق کمتر از ۸۵٪ نیاز به بازنگری دارند.`,
      recommendation: 'بررسی چک‌لیست‌ها و کاهش گام‌های غیرضروری',
      reasoning: 'الگوی عدم تکمیل آیتم‌های مشخص در چک‌لیست‌ها مشاهده شد.',
      confidence: 77,
    }));
  }

  out.push(mk({
    level: 'info',
    title: 'بهینه‌سازی تواتر PM',
    body: 'با انتقال PM روان‌کاری میکسر از ماهانه به دوهفته‌ای، RUL پیش‌بینی ۲۸٪ افزایش می‌یابد.',
    recommendation: 'به‌روزرسانی برنامه PM در ماه آینده',
    reasoning: 'مدل پیش‌بینی فرسایش بر اساس داده‌های ۱۸ ماه گذشته.',
    confidence: 83,
  }));

  return out;
}

export function executiveSummary(state: {
  equipment: Equipment[]; workOrders: WorkOrder[]; pms: PMPlan[]; parts: SparePart[]; users: User[];
}): AIInsight[] {
  const out: AIInsight[] = [];
  const eqAvg = state.equipment.reduce((s, e) => s + e.healthScore, 0) / Math.max(state.equipment.length, 1);
  const completion = state.workOrders.filter(w => ['completed', 'closed'].includes(w.status)).length / Math.max(state.workOrders.length, 1) * 100;

  out.push(mk({
    level: eqAvg > 80 ? 'success' : eqAvg > 65 ? 'warning' : 'critical',
    title: 'وضعیت کلی کارخانه',
    body: `میانگین سلامت تجهیزات ${eqAvg.toFixed(1)} از ۱۰۰ — نرخ تکمیل دستور کارها ${completion.toFixed(0)}٪.`,
    recommendation: eqAvg > 80 ? 'حفظ روند فعلی و تمرکز روی بهینه‌سازی هزینه' : 'تخصیص بودجه برای بازسازی تجهیزات بحرانی',
    reasoning: 'ترکیب امتیاز سلامت، نرخ تکمیل WO، انطباق PM و میزان خرابی اضطراری.',
    confidence: 90,
  }));

  out.push(mk({
    level: 'info',
    title: 'پیش‌بینی هزینه ماه آینده',
    body: 'بر اساس روند فعلی، هزینه تعمیرات ماه آینده ۱۲٪ افزایش خواهد داشت.',
    recommendation: 'برنامه‌ریزی برای خاموشی پیشگیرانه پمپ MDI و کاهش ۳۵٪ ریسک خرابی',
    reasoning: 'پیش‌بینی مبتنی بر RUL تجهیزات بحرانی و مصرف قطعات.',
    confidence: 78,
  }));

  out.push(mk({
    level: 'success',
    title: 'فرصت بهینه‌سازی',
    body: 'با اجرای ۳ توصیه هوش مصنوعی، می‌توان OEE را تا ۶٪ افزایش داد.',
    recommendation: 'اولویت: ۱) بازنگری PM میکسر  ۲) آموزش تکنسین برق  ۳) سفارش به‌موقع کنتاکتور',
    reasoning: 'سیمولیشن مدل پیش‌بینی بر داده‌های ۶ ماه گذشته.',
    confidence: 81,
  }));

  return out;
}
