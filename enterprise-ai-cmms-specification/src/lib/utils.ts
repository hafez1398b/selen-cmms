import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function formatNum(n: number, digits = 0): string {
  if (isNaN(n)) return '0';
  return n.toLocaleString('fa-IR', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

export function formatCurrency(n: number): string {
  return `${formatNum(n)} ﷼`;
}

// Jalali date conversion — using proven jalaali-js library
import jalaali from 'jalaali-js';

export function toJalali(date: Date): { jy: number; jm: number; jd: number } {
  return jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function toGregorian(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

const jMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
// JS getDay(): 0=Sunday, 1=Monday, 2=Tuesday, 3=Wed, 4=Thu, 5=Fri, 6=Saturday
const jWeekdays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

export { jMonths, jWeekdays };

export function formatJalali(input: string | Date, withTime = false): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return '-';
  try {
    const { jy, jm, jd } = toJalali(d);
    const wd = jWeekdays[d.getDay()];
    const base = `${wd} ${faNum(jd)} ${jMonths[jm - 1]} ${faNum(jy)}`;
    if (!withTime) return base;
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${base} - ${faNum(hh)}:${faNum(mm)}`;
  } catch {
    return d.toLocaleDateString('fa-IR');
  }
}

export function faNum(input: number | string): string {
  const map = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/\d/g, (d) => map[+d]);
}

export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${faNum(Math.floor(diff))} ثانیه پیش`;
  if (diff < 3600) return `${faNum(Math.floor(diff / 60))} دقیقه پیش`;
  if (diff < 86400) return `${faNum(Math.floor(diff / 3600))} ساعت پیش`;
  return `${faNum(Math.floor(diff / 86400))} روز پیش`;
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => {
      const v = r[h];
      const s = v == null ? '' : String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    }).join(','))
  ].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function printElement(el: HTMLElement | null) {
  if (!el) return;
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  w.document.write(`<html dir="rtl"><head><title>چاپ</title>
    <style>
      body{font-family:Vazirmatn,sans-serif;padding:24px;color:#111;background:#fff}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th,td{border:1px solid #ddd;padding:8px;text-align:right;font-size:13px}
      th{background:#faf3e0}
      h1,h2,h3{color:#7a4a00}
    </style></head><body>${el.innerHTML}</body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); }, 250);
}
