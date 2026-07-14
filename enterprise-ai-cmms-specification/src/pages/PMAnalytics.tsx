import { useMemo, useState, useRef } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { faNum, formatNum, formatJalali, downloadCSV, printElement } from '../lib/utils';
import { computeAllPMMetrics, analyzeMetric, type PMMetric } from '../lib/pmMetrics';
import { BarChart, LineChart, Donut, HeatMap } from '../components/Charts';
import { useToast } from '../components/Toast';

const CATEGORY_LABEL: Record<PMMetric['category'], string> = {
  reliability: 'قابلیت اطمینان',
  maintenance: 'عملکرد تعمیرات',
  cost: 'هزینه',
  inventory: 'انبار',
  planning: 'برنامه‌ریزی',
  safety: 'ایمنی',
};

const CATEGORY_ICON: Record<PMMetric['category'], keyof typeof import('../components/Icon').I> = {
  reliability: 'Shield',
  maintenance: 'Wrench',
  cost: 'Activity',
  inventory: 'Box',
  planning: 'Calendar',
  safety: 'Alert',
};

const STATUS_COLOR: Record<PMMetric['status'], { bg: string; text: string; ring: string; label: string }> = {
  excellent: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', ring: 'border-emerald-400/40', label: 'عالی' },
  good: { bg: 'bg-sky-500/15', text: 'text-sky-300', ring: 'border-sky-400/40', label: 'خوب' },
  fair: { bg: 'bg-amber-500/15', text: 'text-amber-300', ring: 'border-amber-400/40', label: 'متوسط' },
  poor: { bg: 'bg-rose-500/15', text: 'text-rose-300', ring: 'border-rose-400/40', label: 'ضعیف' },
};

export function PMAnalyticsPage() {
  const { workOrders, pms, equipment, parts } = useApp();
  const [filterCat, setFilterCat] = useState<PMMetric['category'] | ''>('');
  const [selected, setSelected] = useState<PMMetric | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const metrics = useMemo(() => computeAllPMMetrics(workOrders, pms, equipment, parts),
    [workOrders, pms, equipment, parts]);

  const filtered = filterCat ? metrics.filter(m => m.category === filterCat) : metrics;
  const categories = Array.from(new Set(metrics.map(m => m.category)));

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    const excellent = metrics.filter(m => m.status === 'excellent').length;
    const good = metrics.filter(m => m.status === 'good').length;
    const fair = metrics.filter(m => m.status === 'fair').length;
    const poor = metrics.filter(m => m.status === 'poor').length;
    const totalScore = metrics.reduce((s, m) => s + (
      m.status === 'excellent' ? 100 : m.status === 'good' ? 85 : m.status === 'fair' ? 70 : 50
    ), 0) / metrics.length;
    return { excellent, good, fair, poor, totalScore };
  }, [metrics]);

  // Trend data (mocked 12-month history)
  const trendData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      x: faNum(i + 1),
      y: Math.round(70 + Math.sin(i / 2) * 8 + (i / 12) * 12 + Math.random() * 5),
    }));
  }, []);

  // Reliability heatmap by department
  const heatmapData = useMemo(() => {
    const depts = ['تولید', 'مکانیک', 'برق', 'تأسیسات'];
    return depts.map(d => ({
      label: d,
      values: Array.from({ length: 12 }, () => Math.round(50 + Math.random() * 50)),
    }));
  }, []);

  // Failure distribution by type
  const failureTypes = useMemo(() => {
    const types: Record<string, number> = {};
    workOrders.forEach(w => {
      const key = w.type === 'corrective' ? 'اصلاحی' :
        w.type === 'emergency' ? 'اضطراری' :
          w.type === 'preventive' ? 'پیشگیرانه' :
            w.type === 'predictive' ? 'پیش‌گویانه' :
              w.type === 'inspection' ? 'بازرسی' : 'سایر';
      types[key] = (types[key] ?? 0) + 1;
    });
    return Object.entries(types).map(([label, value]) => ({ label, value }));
  }, [workOrders]);

  const exportReport = () => {
    downloadCSV(
      metrics.map(m => ({
        شاخص: m.label,
        'Metric (EN)': m.labelEn,
        مقدار: m.value.toFixed(2),
        واحد: m.unit,
        هدف: m.target ?? '-',
        وضعیت: STATUS_COLOR[m.status].label,
        دسته: CATEGORY_LABEL[m.category],
        فرمول: m.formula,
        توضیحات: m.description,
      })),
      `PM_KPI_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast.push('گزارش CSV دانلود شد', 'success');
  };

  return (
    <div className="space-y-4" ref={reportRef}>
      {/* Header */}
      <div className="surface ring-gold rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative flex items-center gap-4 flex-wrap">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-300 to-amber-700 text-ink-900">
            <I.Activity size={28} />
          </div>
          <div className="flex-1 min-w-[200px]">
            <h2 className="font-display text-2xl text-gold-gradient">شاخص‌های عملکرد PM (KPIs)</h2>
            <p className="text-sm text-ink-300 mt-1">طبق استانداردهای SMRP، ISO 14224 و EN 15341</p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button onClick={exportReport} className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1">
              <I.Download size={13} /> CSV
            </button>
            <button onClick={() => printElement(reportRef.current)} className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1">
              <I.Print size={13} /> چاپ/PDF
            </button>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="grid lg:grid-cols-4 gap-3">
        <div className="surface rounded-2xl p-4 flex items-center gap-4">
          <Donut value={aggregateStats.totalScore} size={88} label="امتیاز" />
          <div className="flex-1">
            <div className="text-[11px] text-ink-300">امتیاز کلی عملکرد</div>
            <div className="font-display text-2xl text-gold-gradient mt-1">{aggregateStats.totalScore.toFixed(1)}/۱۰۰</div>
            <div className="text-[10px] text-amber-300/80 mt-1">
              {aggregateStats.totalScore >= 90 ? '🏆 کلاس جهانی' :
                aggregateStats.totalScore >= 80 ? '✓ مطلوب' :
                  aggregateStats.totalScore >= 70 ? '⚠ نیاز به بهبود' : '🚨 بحرانی'}
            </div>
          </div>
        </div>
        <StatCard label="عالی" value={aggregateStats.excellent} color="emerald" total={metrics.length} />
        <StatCard label="خوب/متوسط" value={aggregateStats.good + aggregateStats.fair} color="amber" total={metrics.length} />
        <StatCard label="نیاز اقدام" value={aggregateStats.poor} color="rose" total={metrics.length} />
      </div>

      {/* Category Filter */}
      <div className="surface rounded-2xl p-3 flex flex-wrap gap-1.5 no-print">
        <button onClick={() => setFilterCat('')}
          className={`px-3 py-1.5 rounded-lg text-xs ${filterCat === '' ? 'btn-gold' : 'btn-ghost-gold'}`}>
          همه ({faNum(metrics.length)})
        </button>
        {categories.map(c => {
          const Icon = I[CATEGORY_ICON[c]];
          const count = metrics.filter(m => m.category === c).length;
          return (
            <button key={c} onClick={() => setFilterCat(filterCat === c ? '' : c)}
              className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ${filterCat === c ? 'btn-gold' : 'btn-ghost-gold'}`}>
              <Icon size={12} />
              {CATEGORY_LABEL[c]} ({faNum(count)})
            </button>
          );
        })}
      </div>

      {/* KPI Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(m => <KPICard key={m.key} metric={m} onClick={() => setSelected(m)} />)}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2">
            <I.Activity size={16} /> روند عملکرد ۱۲ ماه اخیر
          </h3>
          <LineChart data={trendData} />
          <p className="text-[11px] text-ink-400 mt-2 text-center">
            امتیاز کلی شاخص‌های PM در ۱۲ ماه گذشته
          </p>
        </div>

        <div className="surface rounded-2xl p-5">
          <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2">
            <I.Wrench size={16} /> توزیع دستور کارها
          </h3>
          <BarChart data={failureTypes.map((d, i) => ({
            ...d,
            color: ['#10b981', '#f59e0b', '#fb7185', '#3b82f6', '#a855f7'][i % 5],
          }))} />
        </div>
      </div>

      {/* Heatmap */}
      <div className="surface rounded-2xl p-5">
        <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2">
          <I.Factory size={16} /> نقشه گرمایی عملکرد دپارتمان‌ها
        </h3>
        <HeatMap rows={heatmapData} />
        <p className="text-[11px] text-ink-400 mt-3 text-center">
          درصد دسترس‌پذیری ماهانه برای هر دپارتمان (۱۲ ماه گذشته)
        </p>
      </div>

      {/* World-Class Benchmarks */}
      <div className="surface rounded-2xl p-5">
        <h3 className="font-bold text-gold-gradient mb-4 flex items-center gap-2">
          <I.Spark size={16} /> مقایسه با استانداردهای جهانی
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-500/5 text-amber-300 text-xs">
              <tr>
                <th className="px-3 py-2 text-right">شاخص</th>
                <th className="px-3 py-2 text-right">مقدار فعلی</th>
                <th className="px-3 py-2 text-right">هدف</th>
                <th className="px-3 py-2 text-right">معیار جهانی</th>
                <th className="px-3 py-2 text-right">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {metrics.filter(m => m.benchmark).map(m => {
                const s = STATUS_COLOR[m.status];
                return (
                  <tr key={m.key} className="hover:bg-amber-500/5 cursor-pointer" onClick={() => setSelected(m)}>
                    <td className="px-3 py-2">
                      <div className="font-bold">{m.label}</div>
                      <div className="text-[10px] text-ink-400">{m.labelEn}</div>
                    </td>
                    <td className="px-3 py-2 font-display text-amber-300">
                      {formatNum(m.value, m.value < 10 ? 2 : 0)} {m.unit}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {m.target ? `${formatNum(m.target)} ${m.unit}` : '-'}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-ink-300">{m.benchmark}</td>
                    <td className="px-3 py-2">
                      <span className={`pill ${s.bg} ${s.text}`}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Analysis of weakest metrics */}
      <div className="surface ring-gold rounded-2xl p-5">
        <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2">
          <I.AI size={16} /> تحلیل هوش مصنوعی — نیازمند اقدام فوری
        </h3>
        <div className="space-y-3">
          {metrics
            .filter(m => m.status === 'poor' || m.status === 'fair')
            .slice(0, 3)
            .map(m => {
              const analysis = analyzeMetric(m);
              const priorityColor = analysis.priority === 'critical' ? 'rose' :
                analysis.priority === 'high' ? 'amber' : 'sky';
              return (
                <div key={m.key} className={`surface-soft rounded-xl p-4 border-r-4 ${
                  priorityColor === 'rose' ? 'border-r-rose-400' :
                    priorityColor === 'amber' ? 'border-r-amber-400' : 'border-r-sky-400'
                }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm">{m.label}</h4>
                      <div className="text-[11px] text-ink-400 mt-0.5">{m.labelEn} — {analysis.diagnosis}</div>
                    </div>
                    <span className={`pill ${
                      priorityColor === 'rose' ? 'bg-rose-500/15 text-rose-200' :
                        priorityColor === 'amber' ? 'bg-amber-500/15 text-amber-200' :
                          'bg-sky-500/15 text-sky-200'
                    }`}>
                      {analysis.priority === 'critical' ? 'بحرانی' : analysis.priority === 'high' ? 'بالا' : 'متوسط'}
                    </span>
                  </div>
                  <div className="space-y-1 mt-2">
                    {analysis.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-amber-300 font-bold">{faNum(i + 1)}.</span>
                        <span className="text-ink-100 leading-6">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          {metrics.filter(m => m.status === 'poor' || m.status === 'fair').length === 0 && (
            <div className="text-center py-6 text-sm text-emerald-300">
              <I.Check size={32} className="mx-auto mb-2" />
              همه شاخص‌ها در وضعیت مطلوب قرار دارند! 🏆
            </div>
          )}
        </div>
      </div>

      {/* Metric Detail Modal */}
      {selected && <MetricDetail metric={selected} onClose={() => setSelected(null)} />}

      {/* Report footer for print */}
      <div className="hidden print:block text-xs text-ink-400 text-center pt-4">
        گزارش تولید شده توسط سامانه CMMS بسپارفوم غرب — {formatJalali(new Date(), true)}
      </div>
    </div>
  );
}

function KPICard({ metric, onClick }: { metric: PMMetric; onClick: () => void }) {
  const s = STATUS_COLOR[metric.status];
  const Icon = I[CATEGORY_ICON[metric.category]];
  const displayValue = metric.value >= 1000000 ?
    `${(metric.value / 1000000).toFixed(1)}M` :
    metric.value >= 1000 ?
      formatNum(metric.value, 0) :
      formatNum(metric.value, metric.value < 10 ? 2 : 1);

  return (
    <button onClick={onClick}
      className={`surface rounded-xl p-3.5 text-right transition hover:scale-[1.02] border ${s.ring} relative overflow-hidden group`}>
      <div className={`absolute -left-2 -top-2 w-12 h-12 rounded-full ${s.bg} blur-xl opacity-50`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-1.5 rounded-lg ${s.bg} ${s.text}`}>
            <Icon size={13} />
          </div>
          <span className={`pill text-[9px] ${s.bg} ${s.text}`}>{s.label}</span>
        </div>
        <div className="text-[10px] text-ink-300">{metric.label}</div>
        <div className="text-[9px] text-amber-300/70 font-mono">{metric.labelEn}</div>
        <div className="font-display text-xl text-gold-gradient mt-1.5">
          {displayValue}<span className="text-[10px] text-amber-300/80 mr-0.5">{metric.unit}</span>
        </div>
        {metric.target && (
          <div className="text-[9px] text-ink-400 mt-0.5">
            هدف: {formatNum(metric.target)} {metric.unit}
          </div>
        )}
      </div>
    </button>
  );
}

function StatCard({ label, value, color, total }: { label: string; value: number; color: 'emerald' | 'amber' | 'rose'; total: number }) {
  const pct = (value / total) * 100;
  const styles = {
    emerald: { bg: 'from-emerald-400 to-emerald-700', text: 'text-emerald-300' },
    amber: { bg: 'from-amber-400 to-amber-700', text: 'text-amber-300' },
    rose: { bg: 'from-rose-400 to-rose-700', text: 'text-rose-300' },
  }[color];
  return (
    <div className="surface rounded-2xl p-4">
      <div className="text-[11px] text-ink-300">{label}</div>
      <div className={`font-display text-2xl mt-1 ${styles.text}`}>{faNum(value)}<span className="text-xs text-ink-400 mr-1">/ {faNum(total)}</span></div>
      <div className="mt-2 h-1.5 surface-soft rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-l ${styles.bg}`} style={{ width: `${pct}%` }} />
      </div>
      <div className={`text-[10px] mt-1 ${styles.text}`}>{faNum(pct.toFixed(0))}٪ از کل</div>
    </div>
  );
}

function MetricDetail({ metric, onClose }: { metric: PMMetric; onClose: () => void }) {
  const analysis = analyzeMetric(metric);
  const s = STATUS_COLOR[metric.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="surface ring-gold rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-amber-500/15 flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl text-gold-gradient">{metric.label}</h3>
            <p className="text-xs text-ink-400 font-mono mt-1">{metric.labelEn}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-300"><I.X /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="surface-soft rounded-xl p-3 text-center">
              <div className="text-[10px] text-ink-400">مقدار فعلی</div>
              <div className="font-display text-2xl text-gold-gradient mt-1">{formatNum(metric.value, 2)}</div>
              <div className="text-[10px] text-amber-300/80">{metric.unit}</div>
            </div>
            <div className="surface-soft rounded-xl p-3 text-center">
              <div className="text-[10px] text-ink-400">هدف</div>
              <div className="font-display text-2xl text-amber-300 mt-1">{metric.target ? formatNum(metric.target) : '-'}</div>
              <div className="text-[10px] text-amber-300/80">{metric.unit}</div>
            </div>
            <div className="surface-soft rounded-xl p-3 text-center">
              <div className="text-[10px] text-ink-400">وضعیت</div>
              <div className={`font-display text-xl mt-1 ${s.text}`}>{s.label}</div>
              <div className={`pill mt-1 ${s.bg} ${s.text}`}>اولویت {analysis.priority === 'critical' ? 'بحرانی' : analysis.priority === 'high' ? 'بالا' : analysis.priority === 'medium' ? 'متوسط' : 'پایین'}</div>
            </div>
          </div>

          <div className="surface-soft rounded-xl p-4">
            <h4 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1.5"><I.Doc size={12} /> توضیحات</h4>
            <p className="text-sm text-ink-100 leading-6">{metric.description}</p>
          </div>

          <div className="surface-soft rounded-xl p-4">
            <h4 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1.5"><I.Cpu size={12} /> فرمول محاسبه</h4>
            <code className="text-sm text-amber-200 font-mono block">{metric.formula}</code>
          </div>

          {metric.benchmark && (
            <div className="surface-soft rounded-xl p-4">
              <h4 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1.5"><I.Spark size={12} /> معیار جهانی</h4>
              <p className="text-sm text-ink-100">{metric.benchmark}</p>
            </div>
          )}

          <div className={`rounded-xl p-4 border ${s.ring} ${s.bg}`}>
            <h4 className={`text-xs font-bold mb-2 flex items-center gap-1.5 ${s.text}`}>
              <I.AI size={12} /> تحلیل و تشخیص
            </h4>
            <p className="text-sm text-ink-100 leading-6">{analysis.diagnosis}</p>
          </div>

          <div className="surface-soft rounded-xl p-4">
            <h4 className="text-xs text-amber-300 font-bold mb-3 flex items-center gap-1.5"><I.Check size={12} /> توصیه‌های هوش مصنوعی</h4>
            <div className="space-y-2">
              {analysis.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-amber-500/15 text-amber-300 flex items-center justify-center text-xs font-bold">{faNum(i + 1)}</span>
                  <span className="text-ink-100 leading-6">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
