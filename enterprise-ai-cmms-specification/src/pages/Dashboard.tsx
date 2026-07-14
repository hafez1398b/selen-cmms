import { useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { faNum, formatJalali } from '../lib/utils';
import { BarChart, LineChart, Donut, Sparkline, HeatMap } from '../components/Charts';
import { AIInsightCard } from '../components/AIInsightCard';
import { executiveSummary, analyzeWorkOrders } from '../lib/ai';
import { Logo } from '../components/Logo';

export function DashboardPage({ onNavigate }: { onNavigate?: (key: string) => void } = {}) {
  const { equipment, workOrders, pms, parts, users } = useApp();
  const go = (k: string) => onNavigate?.(k);

  const stats = useMemo(() => {
    const eqAvg = equipment.reduce((s, e) => s + e.healthScore, 0) / Math.max(equipment.length, 1);
    const openWO = workOrders.filter(w => !['completed', 'closed'].includes(w.status)).length;
    const overdue = workOrders.filter(w => new Date(w.plannedEnd) < new Date() && !['completed', 'closed'].includes(w.status)).length;
    const critical = equipment.filter(e => e.healthScore < 60 || e.criticality === 'critical').length;
    const lowStock = parts.filter(p => p.stock < p.min).length;
    const compliance = pms.length ? pms.reduce((s, p) => s + p.compliance, 0) / pms.length : 0;
    return { eqAvg, openWO, overdue, critical, lowStock, compliance };
  }, [equipment, workOrders, pms, parts]);

  const insights = useMemo(() =>
    [...executiveSummary({ equipment, workOrders, pms, parts, users }), ...analyzeWorkOrders(workOrders)].slice(0, 4),
    [equipment, workOrders, pms, parts, users]);

  const woByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    workOrders.forEach(w => { map[w.status] = (map[w.status] ?? 0) + 1; });
    const labels: Record<string, string> = {
      draft: 'پیش‌نویس', submitted: 'ثبت‌شده', approved: 'تأیید', assigned: 'تخصیص',
      in_progress: 'در حال انجام', verification: 'بازرسی', completed: 'تکمیل', closed: 'بسته‌شده',
    };
    return Object.entries(map).map(([k, v]) => ({ label: labels[k] ?? k, value: v }));
  }, [workOrders]);

  const downtimeTrend = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const baseline = 30 + Math.sin(i / 2) * 10 + Math.random() * 8;
      return { x: faNum(i + 1), y: Math.round(baseline) };
    });
  }, []);

  const heatRows = useMemo(() => [
    { label: 'خط ۱', values: Array.from({ length: 14 }, () => Math.round(40 + Math.random() * 60)) },
    { label: 'خط ۲', values: Array.from({ length: 14 }, () => Math.round(20 + Math.random() * 50)) },
    { label: 'یوتیلیتی', values: Array.from({ length: 14 }, () => Math.round(15 + Math.random() * 40)) },
    { label: 'برق', values: Array.from({ length: 14 }, () => Math.round(10 + Math.random() * 30)) },
    { label: 'انبار', values: Array.from({ length: 14 }, () => Math.round(5 + Math.random() * 20)) },
  ], []);

  return (
    <div className="space-y-5">
      {/* Brand Hero */}
      <BrandHero />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI label="میانگین سلامت" value={stats.eqAvg.toFixed(1)} suffix="/۱۰۰" icon="Activity" delta={2.3} onClick={() => go('equipment')} />
        <KPI label="انطباق PM" value={stats.compliance.toFixed(0)} suffix="٪" icon="Calendar" delta={1.5} onClick={() => go('pm')} />
        <KPI label="دستور کار باز" value={faNum(stats.openWO)} icon="Wrench" delta={-3} onClick={() => go('workorders')} />
        <KPI label="معوق" value={faNum(stats.overdue)} icon="Alert" delta={1} badStatus onClick={() => go('workorders')} />
        <KPI label="تجهیز بحرانی" value={faNum(stats.critical)} icon="Cpu" onClick={() => go('equipment')} />
        <KPI label="کمبود انبار" value={faNum(stats.lowStock)} icon="Box" badStatus onClick={() => go('inventory')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Equipment Health Donut */}
        <div className="surface rounded-2xl p-5">
          <SectionHeader title="سلامت کلی تجهیزات" subtitle="میانگین وزنی بر اساس بحرانی بودن" />
          <div className="flex items-center justify-around mt-3">
            <Donut value={stats.eqAvg} label="سلامت کلی" size={150} />
            <div className="space-y-2.5 text-sm">
              {['healthy', 'warning', 'critical'].map(t => {
                const count = t === 'healthy' ? equipment.filter(e => e.healthScore >= 80).length :
                  t === 'warning' ? equipment.filter(e => e.healthScore >= 60 && e.healthScore < 80).length :
                    equipment.filter(e => e.healthScore < 60).length;
                const color = t === 'healthy' ? 'bg-emerald-400' : t === 'warning' ? 'bg-amber-400' : 'bg-rose-400';
                const label = t === 'healthy' ? 'سالم' : t === 'warning' ? 'هشدار' : 'بحرانی';
                return (
                  <div key={t} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-ink-200 w-14">{label}</span>
                    <span className="font-display text-gold-gradient">{faNum(count)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* WO by Status */}
        <div className="surface rounded-2xl p-5 lg:col-span-2">
          <SectionHeader title="توزیع دستور کارها بر اساس وضعیت" subtitle={`مجموع ${faNum(workOrders.length)} دستور کار`} />
          <div className="mt-2">
            <BarChart data={woByStatus.map((d, i) => ({ ...d, color: ['#ffcb4d', '#f59e0b', '#d97706', '#92400e'][i % 4] }))} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="surface rounded-2xl p-5 lg:col-span-2">
          <SectionHeader title="روند توقفات ۱۴ روز اخیر" subtitle="مجموع زمان توقف به دقیقه" />
          <LineChart data={downtimeTrend} />
        </div>
        <div className="surface rounded-2xl p-5">
          <SectionHeader title="گرمای فعالیت" subtitle="دستور کار به تفکیک دپارتمان" />
          <div className="mt-3"><HeatMap rows={heatRows} /></div>
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base flex items-center gap-2">
            <I.AI className="text-amber-400" /> <span className="text-gold-gradient">بینش‌های هوش مصنوعی بسپارفوم غرب</span>
          </h3>
          <span className="pill bg-amber-500/15 text-amber-200 border-amber-500/25"><I.Spark size={11} /> به‌روزرسانی لحظه‌ای</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {insights.map(i => <AIInsightCard key={i.id} insight={i} />)}
        </div>
      </div>

      {/* Upcoming - clickable cards */}
      <div className="grid lg:grid-cols-2 gap-5">
        <button onClick={() => go('workorders')} className="surface rounded-2xl p-5 text-right card-clickable">
          <SectionHeader title="دستور کارهای پیش‌رو" subtitle="۵ مورد بعدی — کلیک برای مشاهده همه" right={<I.Chevron size={14} className="text-amber-300/60" />} />
          <div className="mt-3 space-y-2">
            {workOrders.slice(0, 5).map(w => (
              <div key={w.id} className="surface-soft rounded-xl p-3 flex items-center gap-3">
                <div className={`w-1.5 h-12 rounded-full ${w.priority === 'critical' ? 'bg-rose-400' : w.priority === 'high' ? 'bg-amber-400' : 'bg-sky-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink-100 truncate">{w.title}</div>
                  <div className="text-[11px] text-ink-400 mt-0.5">{w.number} • {formatJalali(w.plannedStart)}</div>
                </div>
                <Sparkline data={[10, 14, 9, 18, 22, 20, 26]} />
              </div>
            ))}
          </div>
        </button>
        <button onClick={() => go('personnel')} className="surface rounded-2xl p-5 text-right card-clickable">
          <SectionHeader title="برترین تکنسین‌های ماه" subtitle="بر اساس امتیاز AI — کلیک برای مدیریت پرسنل" right={<I.Chevron size={14} className="text-amber-300/60" />} />
          <div className="mt-3 space-y-2">
            {[...users].filter(u => u.role === 'technician').sort((a, b) => b.performance - a.performance).slice(0, 5).map((u, i) => (
              <div key={u.id} className="surface-soft rounded-xl p-3 flex items-center gap-3">
                <div className="font-display text-lg text-gold-gradient w-6 text-center">{faNum(i + 1)}</div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 flex items-center justify-center font-bold text-ink-900 text-sm">{u.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{u.name}</div>
                  <div className="text-[11px] text-ink-400">{u.jobTitle}</div>
                </div>
                <div className="text-left">
                  <div className="font-display text-base text-gold-gradient">{faNum(u.performance)}</div>
                  <div className="text-[10px] text-ink-400">امتیاز</div>
                </div>
              </div>
            ))}
          </div>
        </button>
      </div>

      {/* Quick action cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickAction icon="Tree" label="درخت تجهیزات" desc="مشاهده تمام تجهیزات کارخانه" onClick={() => go('equipment')} />
        <QuickAction icon="Alert" label="درخواست تعمیرات" desc="ثبت درخواست جدید" onClick={() => go('service_request')} />
        <QuickAction icon="Calendar" label="مرکز برنامه‌ریزی" desc="تقویم و زمان‌بندی" onClick={() => go('planning')} />
        <QuickAction icon="AI" label="مرکز هوش مصنوعی" desc="تحلیل‌ها و توصیه‌ها" onClick={() => go('ai')} />
      </div>
    </div>
  );
}

function KPI({ label, value, suffix, icon, delta, badStatus, onClick }: { label: string; value: string | number; suffix?: string; icon: keyof typeof I; delta?: number; badStatus?: boolean; onClick?: () => void }) {
  const Icon = I[icon];
  const isClickable = !!onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={`surface rounded-xl p-3.5 relative overflow-hidden text-right w-full ${isClickable ? 'card-clickable cursor-pointer' : 'cursor-default'}`}
    >
      <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full bg-amber-500/5 blur-2xl" />
      <div className="flex items-start justify-between relative">
        <div>
          <div className="text-[11px] text-ink-300">{label}</div>
          <div className="font-display text-xl text-gold-gradient mt-1">
            {value}<span className="text-xs text-amber-300/80">{suffix}</span>
          </div>
          {delta !== undefined && (
            <div className={`text-[10px] mt-1 ${delta >= 0 ? (badStatus ? 'text-rose-300' : 'text-emerald-300') : (badStatus ? 'text-emerald-300' : 'text-rose-300')}`}>
              {delta >= 0 ? '▲' : '▼'} {faNum(Math.abs(delta))}٪ vs ماه قبل
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300"><Icon size={16} /></div>
      </div>
      {isClickable && (
        <div className="absolute bottom-1.5 left-2 text-[9px] text-amber-300/60 flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          مشاهده <I.Chevron size={9} />
        </div>
      )}
    </button>
  );
}

export function SectionHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-bold text-base text-ink-50">{title}</h3>
        {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function QuickAction({ icon, label, desc, onClick }: { icon: keyof typeof I; label: string; desc: string; onClick: () => void }) {
  const Icon = I[icon];
  return (
    <button onClick={onClick} className="surface rounded-2xl p-4 text-right card-clickable flex items-center gap-3 group">
      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-300/20 to-amber-700/20 text-amber-300 group-hover:from-amber-300 group-hover:to-amber-700 group-hover:text-ink-900 transition-all shrink-0">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-gold-gradient">{label}</div>
        <div className="text-[11px] text-ink-400 mt-0.5 truncate">{desc}</div>
      </div>
      <I.Chevron size={14} className="text-amber-300/40 group-hover:text-amber-300 transition" />
    </button>
  );
}

function BrandHero() {
  const { company, currentUser } = useApp();
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'شب‌تان به‌خیر' : hour < 12 ? 'صبح‌تان به‌خیر' : hour < 17 ? 'ظهرتان به‌خیر' : hour < 20 ? 'عصرتان به‌خیر' : 'شب‌تان به‌خیر';

  return (
    <div className="surface ring-gold rounded-2xl p-5 sm:p-6 relative overflow-hidden">
      {/* Background watermark logo */}
      <div className="absolute -left-12 -bottom-12 opacity-[0.08] pointer-events-none">
        <Logo size={260} />
      </div>
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(600px 300px at 100% 0%, rgba(245,158,11,0.20), transparent 60%)' }} />

      <div className="relative flex items-center gap-4 sm:gap-5 flex-wrap">
        <div className="relative shrink-0 float-slow">
          <Logo size={88} variant="full" />
          <div className="absolute inset-0 bg-amber-400/20 blur-2xl -z-10 rounded-2xl" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="pill bg-amber-500/15 text-amber-200 border-amber-500/25">
              <I.Spark size={11} /> پلتفرم هوشمند CMMS/EAM
            </span>
            <span className="text-[11px] text-ink-300">{greeting}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-gold-gradient">
            {currentUser?.name ? `خوش آمدید، ${currentUser.name}` : company.nameEn.toUpperCase()}
          </h1>
          <p className="text-sm text-amber-300/80 mt-1">
            {company.name} — {company.industry}
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end text-left">
          <div className="text-[11px] text-ink-300">سال تأسیس</div>
          <div className="font-display text-xl text-gold-gradient">{company.established}</div>
        </div>
      </div>
    </div>
  );
}
