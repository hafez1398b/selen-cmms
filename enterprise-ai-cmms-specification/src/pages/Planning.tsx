import { useState, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { faNum, formatJalali, toJalali } from '../lib/utils';
import { AIInsightCard } from '../components/AIInsightCard';
import { analyzeWorkOrders } from '../lib/ai';

export function PlanningPage() {
  const { workOrders, pms, users } = useApp();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [cursor, setCursor] = useState(new Date());

  // Combine WO + PM into events
  const events = useMemo(() => {
    const wo = workOrders.map(w => ({ id: w.id, kind: 'wo' as const, title: w.title, date: w.plannedStart, priority: w.priority, assigned: w.assignedTo }));
    const pm = pms.map(p => ({ id: p.id, kind: 'pm' as const, title: p.name, date: p.nextDue, priority: 'medium' as const, assigned: [p.assignedTo] }));
    return [...wo, ...pm];
  }, [workOrders, pms]);

  const days = useMemo(() => {
    const arr: Date[] = [];
    const start = new Date(cursor);
    if (period === 'day') arr.push(start);
    else if (period === 'week') {
      start.setDate(start.getDate() - start.getDay());
      for (let i = 0; i < 7; i++) { const d = new Date(start); d.setDate(start.getDate() + i); arr.push(d); }
    } else {
      const first = new Date(start.getFullYear(), start.getMonth(), 1);
      const last = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      for (let i = 0; i < last.getDate(); i++) { const d = new Date(first); d.setDate(first.getDate() + i); arr.push(d); }
    }
    return arr;
  }, [cursor, period]);

  const evOn = (d: Date) => events.filter(e => {
    const ed = new Date(e.date);
    return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth() && ed.getDate() === d.getDate();
  });

  const insights = useMemo(() => analyzeWorkOrders(workOrders), [workOrders]);

  return (
    <div className="space-y-4">
      <div className="surface rounded-2xl p-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg overflow-hidden border border-amber-500/25">
          {(['day', 'week', 'month'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-2 text-xs ${period === p ? 'btn-gold' : 'text-amber-300 hover:bg-amber-500/10'}`}>
              {p === 'day' ? 'روز' : p === 'week' ? 'هفته' : 'ماه'}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs" onClick={() => {
          const d = new Date(cursor); d.setDate(d.getDate() - (period === 'day' ? 1 : period === 'week' ? 7 : 30)); setCursor(d);
        }}>قبلی</button>
        <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs" onClick={() => setCursor(new Date())}>امروز</button>
        <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs" onClick={() => {
          const d = new Date(cursor); d.setDate(d.getDate() + (period === 'day' ? 1 : period === 'week' ? 7 : 30)); setCursor(d);
        }}>بعدی</button>
      </div>

      <div className="surface rounded-2xl p-4">
        <h3 className="font-bold text-gold-gradient mb-3">
          {formatJalali(cursor)} — {period === 'day' ? 'روزانه' : period === 'week' ? 'هفتگی' : 'ماهانه'}
        </h3>
        <div className={`grid gap-2 ${period === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}>
          {days.map((d, i) => {
            const events = evOn(d);
            const j = toJalali(d);
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div key={i} className={`surface-soft rounded-xl p-2.5 min-h-[120px] ${isToday ? 'ring-2 ring-amber-400/50' : ''}`}>
                <div className="text-xs font-bold text-amber-300 mb-1.5">{faNum(j.jd)} {['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'][j.jm - 1]}</div>
                <div className="space-y-1">
                  {events.slice(0, 4).map(e => (
                    <div key={e.id} className={`text-[10px] px-1.5 py-1 rounded ${e.kind === 'wo' ? 'bg-amber-500/15 text-amber-200' : 'bg-sky-500/15 text-sky-200'} truncate`} title={e.title}>
                      {e.kind === 'wo' ? '🔧' : '📅'} {e.title}
                    </div>
                  ))}
                  {events.length > 4 && <div className="text-[10px] text-amber-300">+ {faNum(events.length - 4)} مورد</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-bold text-base text-gold-gradient mb-3">گانت چارت ساده — برنامه پیش‌رو</h3>
          <div className="space-y-2">
            {workOrders.slice(0, 8).map(w => {
              const start = new Date(w.plannedStart).getTime();
              const end = new Date(w.plannedEnd).getTime();
              const now = Date.now();
              const totalRange = 14 * 86400000;
              const offset = Math.max(0, Math.min(100, ((start - now) / totalRange) * 100));
              const width = Math.max(5, Math.min(100 - offset, ((end - start) / totalRange) * 100));
              return (
                <div key={w.id} className="flex items-center gap-3 text-sm">
                  <div className="w-40 truncate text-xs">{w.title}</div>
                  <div className="flex-1 relative h-6 surface-soft rounded">
                    <div className="absolute h-6 rounded btn-gold" style={{ right: `${offset}%`, width: `${width}%` }} title={`${formatJalali(w.plannedStart)} → ${formatJalali(w.plannedEnd)}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="surface rounded-2xl p-5">
          <h3 className="font-bold text-base text-gold-gradient mb-3">بار کاری پرسنل</h3>
          <div className="space-y-2">
            {users.filter(u => u.role === 'technician').map(u => {
              const count = workOrders.filter(w => w.assignedTo.includes(u.id) && !['completed', 'closed'].includes(w.status)).length;
              const max = 10;
              const pct = Math.min(100, (count / max) * 100);
              return (
                <div key={u.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{u.name}</span>
                    <span className="text-amber-300">{faNum(count)} / {faNum(max)}</span>
                  </div>
                  <div className="h-2 rounded-full surface-soft overflow-hidden">
                    <div className="h-full btn-gold" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-base mb-3 flex items-center gap-2"><I.AI className="text-amber-400" /> <span className="text-gold-gradient">بهینه‌سازی برنامه‌ریزی</span></h3>
        <div className="grid md:grid-cols-3 gap-3">{insights.map(i => <AIInsightCard key={i.id} insight={i} />)}</div>
      </div>
    </div>
  );
}
