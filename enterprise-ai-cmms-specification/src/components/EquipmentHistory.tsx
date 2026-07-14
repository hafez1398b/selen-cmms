import { useState, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from './Icon';
import { faNum, formatJalali, downloadCSV, printElement } from '../lib/utils';
import type { Equipment, WOType, WOStatus } from '../lib/types';
import { useRef } from 'react';
import { useToast } from './Toast';

interface Props { equipment: Equipment }

const TYPE_LABEL: Record<WOType, string> = {
  corrective: 'اصلاحی', preventive: 'پیشگیرانه', predictive: 'پیش‌گویانه',
  emergency: 'اضطراری', improvement: 'بهبود', inspection: 'بازرسی', project: 'پروژه',
};
const STATUS_LABEL: Record<WOStatus, string> = {
  draft: 'پیش‌نویس', submitted: 'ثبت‌شده', approved: 'تأیید‌شده', assigned: 'تخصیص‌یافته',
  in_progress: 'در حال انجام', verification: 'بازرسی نهایی', completed: 'تکمیل‌شده', closed: 'بسته‌شده',
};
const STATUS_COLOR: Record<WOStatus, string> = {
  draft: 'bg-ink-500/15 text-ink-200',
  submitted: 'bg-sky-500/15 text-sky-200',
  approved: 'bg-sky-500/15 text-sky-200',
  assigned: 'bg-amber-500/15 text-amber-200',
  in_progress: 'bg-amber-500/15 text-amber-200',
  verification: 'bg-violet-500/15 text-violet-200',
  completed: 'bg-emerald-500/15 text-emerald-200',
  closed: 'bg-emerald-500/15 text-emerald-200',
};

export function EquipmentHistory({ equipment }: Props) {
  const { workOrders, users } = useApp();
  const toast = useToast();
  const [typeFilter, setTypeFilter] = useState<WOType | ''>('');
  const [statusFilter, setStatusFilter] = useState<WOStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const history = useMemo(() => {
    let list = workOrders.filter(w => w.equipmentId === equipment.id);
    if (typeFilter) list = list.filter(w => w.type === typeFilter);
    if (statusFilter) list = list.filter(w => w.status === statusFilter);
    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter(w => new Date(w.plannedStart) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59);
      list = list.filter(w => new Date(w.plannedStart) <= to);
    }
    return list.sort((a, b) => new Date(b.plannedStart).getTime() - new Date(a.plannedStart).getTime());
  }, [workOrders, equipment.id, typeFilter, statusFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const all = workOrders.filter(w => w.equipmentId === equipment.id);
    return {
      total: all.length,
      completed: all.filter(w => w.status === 'completed' || w.status === 'closed').length,
      open: all.filter(w => !['completed', 'closed'].includes(w.status)).length,
      preventive: all.filter(w => w.type === 'preventive').length,
      corrective: all.filter(w => w.type === 'corrective' || w.type === 'emergency').length,
      totalCost: all.reduce((s, w) => s + (w.actualCost || w.estimatedCost || 0), 0),
      totalHours: all.reduce((s, w) => s + (w.laborHours || 0), 0),
    };
  }, [workOrders, equipment.id]);

  const exportCSV = () => {
    if (history.length === 0) { toast.push('سابقه‌ای برای خروجی وجود ندارد', 'warning'); return; }
    downloadCSV(history.map(w => ({
      شماره: w.number,
      عنوان: w.title,
      نوع: TYPE_LABEL[w.type],
      وضعیت: STATUS_LABEL[w.status],
      شروع_برنامه: formatJalali(w.plannedStart),
      پایان_برنامه: formatJalali(w.plannedEnd),
      شروع_واقعی: w.actualStart ? formatJalali(w.actualStart) : '-',
      پایان_واقعی: w.actualEnd ? formatJalali(w.actualEnd) : '-',
      'نفر-ساعت': w.laborHours,
      'هزینه (ریال)': w.actualCost || w.estimatedCost,
      تخصیص: w.assignedTo.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join('، '),
    })), `history_${equipment.code}_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.push('خروجی CSV دانلود شد', 'success');
  };

  return (
    <div className="surface rounded-2xl p-5 sm:p-6 space-y-5" ref={printRef}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-base text-gold-gradient flex items-center gap-2">
            <I.Activity size={16} /> سوابق تعمیر و نگهداری
          </h3>
          <p className="text-[11px] text-ink-400 mt-1">
            تمام دستور کارهای انجام‌شده و در حال انجام برای این تجهیز
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={exportCSV} className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1">
            <I.Download size={12} /> CSV
          </button>
          <button onClick={() => printElement(printRef.current)} className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1">
            <I.Print size={12} /> چاپ / PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <StatBox label="کل سوابق" value={faNum(stats.total)} />
        <StatBox label="تکمیل‌شده" value={faNum(stats.completed)} color="emerald" />
        <StatBox label="در جریان" value={faNum(stats.open)} color="amber" />
        <StatBox label="پیشگیرانه" value={faNum(stats.preventive)} color="sky" />
        <StatBox label="اصلاحی/اضطراری" value={faNum(stats.corrective)} color="rose" />
        <StatBox label="مجموع ساعت" value={faNum(stats.totalHours.toFixed(0))} />
        <StatBox label="هزینه کل" value={faNum((stats.totalCost / 1_000_000).toFixed(1)) + 'M ﷼'} small />
      </div>

      {/* Filters */}
      <div className="surface-soft rounded-xl p-3 grid sm:grid-cols-4 gap-2 no-print">
        <select className="input-dark py-1.5 text-xs" value={typeFilter} onChange={e => setTypeFilter(e.target.value as WOType | '')}>
          <option value="">همه انواع</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input-dark py-1.5 text-xs" value={statusFilter} onChange={e => setStatusFilter(e.target.value as WOStatus | '')}>
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div>
          <label className="text-[10px] text-ink-400 block mb-1">از تاریخ (میلادی):</label>
          <input type="date" className="input-dark py-1.5 text-xs" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] text-ink-400 block mb-1">تا تاریخ (میلادی):</label>
          <input type="date" className="input-dark py-1.5 text-xs" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      {/* History table */}
      {history.length === 0 ? (
        <div className="surface-soft rounded-xl p-8 text-center">
          <I.Doc size={32} className="text-amber-400 mx-auto mb-2" />
          <p className="text-sm text-ink-300">سابقه‌ای با این فیلتر یافت نشد</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-500/5 text-amber-300 text-xs">
              <tr>
                <th className="px-2 py-2.5 text-right">شماره</th>
                <th className="px-2 py-2.5 text-right">عنوان</th>
                <th className="px-2 py-2.5 text-right">نوع</th>
                <th className="px-2 py-2.5 text-right">وضعیت</th>
                <th className="px-2 py-2.5 text-right">تاریخ برنامه</th>
                <th className="px-2 py-2.5 text-right">تاریخ واقعی</th>
                <th className="px-2 py-2.5 text-right">تخصیص</th>
                <th className="px-2 py-2.5 text-right">ساعت</th>
                <th className="px-2 py-2.5 text-right">هزینه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {history.map(w => (
                <tr key={w.id} className="hover:bg-amber-500/5 align-top">
                  <td className="px-2 py-2 text-xs font-mono text-amber-300">{w.number}</td>
                  <td className="px-2 py-2 text-xs max-w-xs">
                    <div className="font-bold leading-5">{w.title}</div>
                    {w.textNotes.length > 0 && (
                      <div className="text-[10px] text-emerald-300/80 mt-0.5 truncate" title={w.textNotes[0].text}>
                        ✓ {w.textNotes[0].text.slice(0, 60)}...
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 text-xs">
                    <span className="pill bg-amber-500/10 text-amber-200">{TYPE_LABEL[w.type]}</span>
                  </td>
                  <td className="px-2 py-2 text-xs">
                    <span className={`pill ${STATUS_COLOR[w.status]}`}>{STATUS_LABEL[w.status]}</span>
                  </td>
                  <td className="px-2 py-2 text-[11px] text-ink-300">
                    {formatJalali(w.plannedStart)}
                  </td>
                  <td className="px-2 py-2 text-[11px] text-emerald-300/90">
                    {w.actualEnd ? formatJalali(w.actualEnd) : w.actualStart ? `از: ${formatJalali(w.actualStart)}` : '—'}
                  </td>
                  <td className="px-2 py-2 text-[11px]">
                    {w.assignedTo.slice(0, 2).map(id => {
                      const u = users.find(x => x.id === id);
                      return u ? <div key={id}>{u.name}</div> : null;
                    })}
                  </td>
                  <td className="px-2 py-2 text-xs text-amber-300 font-bold">
                    {faNum(w.laborHours.toFixed(1))}
                  </td>
                  <td className="px-2 py-2 text-[11px]">
                    {faNum(((w.actualCost || w.estimatedCost) / 1_000_000).toFixed(1))}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color = 'amber', small }: { label: string; value: string; color?: 'amber' | 'emerald' | 'rose' | 'sky'; small?: boolean }) {
  const cls = { amber: 'text-amber-300', emerald: 'text-emerald-300', rose: 'text-rose-300', sky: 'text-sky-300' }[color];
  return (
    <div className="surface-soft rounded-xl p-2.5 border border-amber-500/10">
      <div className="text-[10px] text-ink-400">{label}</div>
      <div className={`font-display ${small ? 'text-sm' : 'text-lg'} mt-0.5 ${cls}`}>{value}</div>
    </div>
  );
}
