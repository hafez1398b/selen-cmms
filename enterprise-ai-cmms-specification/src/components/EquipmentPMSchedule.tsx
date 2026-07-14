import { useMemo, useState } from 'react';
import { I } from './Icon';
import { faNum } from '../lib/utils';
import { generatePMPlan, FREQUENCY_LABEL, FREQUENCY_COLOR, type PMFrequency } from '../lib/pmGenerator';
import type { Equipment } from '../lib/types';

interface Props {
  equipment: Equipment;
}

const FREQ_ORDER: PMFrequency[] = ['daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual'];

export function EquipmentPMSchedule({ equipment }: Props) {
  const plan = useMemo(() => generatePMPlan(equipment), [equipment]);
  const [filter, setFilter] = useState<PMFrequency | 'all'>('all');

  const filteredTasks = filter === 'all'
    ? plan.tasks
    : plan.tasks.filter(t => t.frequency === filter);

  const tasksByFreq = useMemo(() => {
    const grouped: Record<PMFrequency, typeof plan.tasks> = {
      daily: [], weekly: [], monthly: [], quarterly: [], semiannual: [], annual: [],
    };
    plan.tasks.forEach(t => grouped[t.frequency].push(t));
    return grouped;
  }, [plan.tasks]);

  if (plan.tasks.length === 0) {
    return (
      <div className="surface rounded-2xl p-6 text-center">
        <I.Calendar size={32} className="text-amber-400 mx-auto mb-2" />
        <p className="text-sm text-ink-300">برنامه PM استاندارد برای این نوع تجهیز هنوز تعریف نشده است.</p>
      </div>
    );
  }

  return (
    <div className="surface rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header with type and stats */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-base text-gold-gradient flex items-center gap-2">
            <I.Calendar size={16} /> برنامه نگهداری پیشگیرانه (PM)
          </h3>
          <p className="text-[11px] text-ink-400 mt-1">
            تولید خودکار بر اساس استانداردهای ISO 55000 و بهترین شیوه‌های صنعتی
          </p>
        </div>
        <div className="flex gap-2 text-[11px]">
          <span className="pill bg-amber-500/15 text-amber-200">
            نوع: {plan.equipmentType}
          </span>
          <span className="pill bg-sky-500/15 text-sky-200">
            {faNum(plan.tasks.length)} فعالیت
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatBox label="نفر-ساعت سالیانه" value={faNum(plan.totalAnnualHours)} unit="ساعت" />
        <StatBox label="هزینه تخمینی سالیانه" value={plan.estimatedAnnualCost} small />
        <StatBox label="فعالیت‌های روزانه/هفتگی" value={faNum(tasksByFreq.daily.length + tasksByFreq.weekly.length)} />
        <StatBox label="فعالیت‌های ماهانه+" value={faNum(tasksByFreq.monthly.length + tasksByFreq.quarterly.length + tasksByFreq.semiannual.length + tasksByFreq.annual.length)} />
      </div>

      {/* Frequency filters */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs transition ${filter === 'all' ? 'btn-gold' : 'btn-ghost-gold'}`}>
          همه ({faNum(plan.tasks.length)})
        </button>
        {FREQ_ORDER.map(freq => {
          const count = tasksByFreq[freq].length;
          if (count === 0) return null;
          return (
            <button key={freq} onClick={() => setFilter(freq)}
              className={`px-3 py-1.5 rounded-lg text-xs transition ${
                filter === freq ? 'btn-gold' : 'btn-ghost-gold'
              }`}>
              {FREQUENCY_LABEL[freq]} ({faNum(count)})
            </button>
          );
        })}
      </div>

      {/* Tasks table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-amber-500/5 text-amber-300 text-xs">
            <tr>
              <th className="px-2.5 py-2.5 text-right">#</th>
              <th className="px-2.5 py-2.5 text-right">فعالیت</th>
              <th className="px-2.5 py-2.5 text-right">تناوب</th>
              <th className="px-2.5 py-2.5 text-right">مدت</th>
              <th className="px-2.5 py-2.5 text-right">سطح تخصص</th>
              <th className="px-2.5 py-2.5 text-right">معیار پذیرش</th>
              <th className="px-2.5 py-2.5 text-right">قطعات/ابزار</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-500/10">
            {filteredTasks.map((task, idx) => (
              <tr key={task.id} className="hover:bg-amber-500/5 align-top">
                <td className="px-2.5 py-3 text-xs text-amber-300 font-mono">{faNum(idx + 1)}</td>
                <td className="px-2.5 py-3">
                  <div className="text-sm font-bold text-ink-100 leading-6">{task.activity}</div>
                  {task.safetyNotes && (
                    <div className="text-[10px] text-rose-300 mt-1 flex items-start gap-1">
                      <I.Alert size={10} className="mt-0.5 shrink-0" />
                      <span>{task.safetyNotes}</span>
                    </div>
                  )}
                </td>
                <td className="px-2.5 py-3">
                  <span className={`pill border ${FREQUENCY_COLOR[task.frequency]}`}>
                    {FREQUENCY_LABEL[task.frequency]}
                  </span>
                </td>
                <td className="px-2.5 py-3 text-xs">
                  <div className="font-bold text-amber-300">{faNum(task.duration)}</div>
                  <div className="text-[10px] text-ink-400">دقیقه</div>
                </td>
                <td className="px-2.5 py-3 text-xs text-ink-200">{task.skillLevel}</td>
                <td className="px-2.5 py-3 text-xs text-emerald-200/90 leading-6 max-w-[200px]">{task.acceptanceCriteria}</td>
                <td className="px-2.5 py-3 text-[11px]">
                  {task.tools.length > 0 && (
                    <div className="mb-1">
                      <span className="text-amber-300/80">🔧 </span>
                      <span className="text-ink-200">{task.tools.join('، ')}</span>
                    </div>
                  )}
                  {task.spareParts.length > 0 && (
                    <div>
                      <span className="text-amber-300/80">📦 </span>
                      <span className="text-ink-200">{task.spareParts.join('، ')}</span>
                    </div>
                  )}
                  {task.tools.length === 0 && task.spareParts.length === 0 && (
                    <span className="text-ink-500 text-[10px]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8 text-sm text-ink-400">
          فعالیتی با این تناوب وجود ندارد
        </div>
      )}

      {/* Legend */}
      <div className="surface-soft rounded-xl p-3 text-[11px] text-ink-300 leading-6">
        <strong className="text-amber-300">💡 توجه:</strong> این برنامه به‌صورت هوشمند بر اساس نوع تجهیز («{plan.equipmentType}»)
        و استانداردهای صنعتی تولید شده است. قابل تنظیم و سفارشی‌سازی برای شرایط خاص کارخانه است.
      </div>
    </div>
  );
}

function StatBox({ label, value, unit, small }: { label: string; value: string; unit?: string; small?: boolean }) {
  return (
    <div className="surface-soft rounded-xl p-3 border border-amber-500/15">
      <div className="text-[10px] text-ink-400">{label}</div>
      <div className={`font-display ${small ? 'text-base' : 'text-xl'} text-gold-gradient mt-1`}>
        {value}
        {unit && <span className="text-[10px] text-amber-300/80 mr-1">{unit}</span>}
      </div>
    </div>
  );
}
