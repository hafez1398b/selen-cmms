import type { AIInsight } from '../lib/ai';
import { I } from './Icon';
import { faNum } from '../lib/utils';

const levelStyles: Record<AIInsight['level'], { ring: string; text: string; chip: string; label: string }> = {
  info: { ring: 'border-sky-400/30', text: 'text-sky-300', chip: 'bg-sky-500/15 text-sky-200', label: 'اطلاعاتی' },
  success: { ring: 'border-emerald-400/30', text: 'text-emerald-300', chip: 'bg-emerald-500/15 text-emerald-200', label: 'مطلوب' },
  warning: { ring: 'border-amber-400/35', text: 'text-amber-300', chip: 'bg-amber-500/15 text-amber-200', label: 'هشدار' },
  critical: { ring: 'border-rose-400/35', text: 'text-rose-300', chip: 'bg-rose-500/15 text-rose-200', label: 'بحرانی' },
};

export function AIInsightCard({ insight }: { insight: AIInsight }) {
  const s = levelStyles[insight.level];
  return (
    <div className={`surface rounded-xl p-4 border ${s.ring} relative overflow-hidden`}>
      <div className="absolute inset-x-0 top-0 h-px shimmer" />
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${s.chip} shrink-0`}>
          <I.AI size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className={`font-bold text-sm ${s.text}`}>{insight.title}</h4>
            <div className="flex items-center gap-1.5">
              <span className={`pill ${s.chip}`}>{s.label}</span>
              <span className="pill bg-amber-500/10 text-amber-200 border-amber-500/20">
                <I.Spark size={11} /> اطمینان {faNum(insight.confidence)}٪
              </span>
            </div>
          </div>
          <p className="text-sm text-ink-200 mt-2 leading-6">{insight.body}</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs">
            <div className="surface-soft rounded-lg p-2.5">
              <div className="text-amber-300/80 font-semibold mb-0.5 flex items-center gap-1"><I.Check size={12} /> توصیه</div>
              <div className="text-ink-100 leading-5">{insight.recommendation}</div>
            </div>
            <div className="surface-soft rounded-lg p-2.5">
              <div className="text-amber-300/80 font-semibold mb-0.5 flex items-center gap-1"><I.Cpu size={12} /> دلیل</div>
              <div className="text-ink-200 leading-5">{insight.reasoning}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
