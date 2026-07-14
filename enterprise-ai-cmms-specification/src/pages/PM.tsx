import { useState, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { faNum, uid, formatJalali } from '../lib/utils';
import { Modal, ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { Donut } from '../components/Charts';
import { AIInsightCard } from '../components/AIInsightCard';
import { analyzePM } from '../lib/ai';
import type { PMPlan } from '../lib/types';

const FREQ_LABEL: Record<PMPlan['frequency'], string> = {
  daily: 'روزانه', weekly: 'هفتگی', monthly: 'ماهانه',
  quarterly: 'فصلی', semiannual: '۶ ماهه', annual: 'سالیانه'
};

const TASK_LABEL: Record<PMPlan['taskType'], string> = {
  inspection: 'بازرسی', lubrication: 'روان‌کاری', calibration: 'کالیبراسیون',
  cleaning: 'تمیزکاری', replacement: 'تعویض', adjustment: 'تنظیم',
  testing: 'تست', overhaul: 'اورهال'
};

export function PMPage() {
  const { pms, addPM, updatePM, removePM, equipment, users } = useApp();
  const [editing, setEditing] = useState<PMPlan | null>(null);
  const [del, setDel] = useState<PMPlan | null>(null);
  const [filter, setFilter] = useState<'all' | 'due' | 'overdue'>('all');
  const toast = useToast();

  const filtered = useMemo(() => {
    const now = new Date();
    return pms.filter(p => {
      if (filter === 'due') return new Date(p.nextDue).getTime() - now.getTime() < 7 * 86400000;
      if (filter === 'overdue') return new Date(p.nextDue) < now;
      return true;
    });
  }, [pms, filter]);

  const insights = useMemo(() => analyzePM(pms), [pms]);

  const openNew = () => setEditing({
    id: uid('pm'), name: '', equipmentId: equipment[0]?.id ?? '',
    frequency: 'monthly', taskType: 'inspection', checklist: [{ item: '', done: false }],
    assignedTo: users[0]?.id ?? '', nextDue: new Date(Date.now() + 7 * 86400000).toISOString(),
    compliance: 100, active: true,
  });

  const save = () => {
    if (!editing) return;
    if (!editing.name) { toast.push('نام الزامی است', 'error'); return; }
    if (pms.some(p => p.id === editing.id)) updatePM(editing.id, editing);
    else addPM(editing);
    toast.push('ذخیره شد');
    setEditing(null);
  };

  const overallCompliance = pms.length ? pms.reduce((s, p) => s + p.compliance, 0) / pms.length : 0;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-4 gap-3">
        <div className="surface rounded-xl p-4 flex items-center gap-3">
          <Donut value={overallCompliance} size={68} label="٪" />
          <div>
            <div className="text-[11px] text-ink-300">انطباق کلی PM</div>
            <div className="font-display text-2xl text-gold-gradient mt-1">{overallCompliance.toFixed(0)}٪</div>
          </div>
        </div>
        <KPI label="مجموع برنامه‌ها" value={faNum(pms.length)} />
        <KPI label="معوق" value={faNum(pms.filter(p => new Date(p.nextDue) < new Date()).length)} bad />
        <KPI label="هفته آینده" value={faNum(pms.filter(p => { const d = new Date(p.nextDue).getTime() - Date.now(); return d > 0 && d < 7 * 86400000; }).length)} />
      </div>

      <div className="surface rounded-2xl p-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg overflow-hidden border border-amber-500/25">
          {(['all', 'due', 'overdue'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-xs ${filter === f ? 'btn-gold' : 'text-amber-300 hover:bg-amber-500/10'}`}>
              {f === 'all' ? 'همه' : f === 'due' ? 'هفته آینده' : 'معوق'}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button className="btn-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" onClick={openNew}><I.Plus size={13} /> PM جدید</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(p => {
          const eq = equipment.find(e => e.id === p.equipmentId);
          const tech = users.find(u => u.id === p.assignedTo);
          const overdue = new Date(p.nextDue) < new Date();
          const done = p.checklist.filter(c => c.done).length;
          return (
            <div key={p.id} className="surface rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="pill bg-amber-500/15 text-amber-200 border-amber-500/25">{FREQ_LABEL[p.frequency]}</span>
                    <span className="pill bg-sky-500/15 text-sky-200 border-sky-500/25">{TASK_LABEL[p.taskType]}</span>
                    {overdue && <span className="pill bg-rose-500/15 text-rose-200 border-rose-500/25">معوق</span>}
                  </div>
                  <h4 className="font-bold text-sm">{p.name}</h4>
                  <div className="text-[11px] text-ink-400 mt-1">{eq?.name ?? '—'}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button className="p-1.5 rounded hover:bg-amber-500/10 text-amber-300" onClick={() => setEditing(p)}><I.Edit size={13} /></button>
                  <button className="p-1.5 rounded hover:bg-rose-500/10 text-rose-300" onClick={() => setDel(p)}><I.Trash size={13} /></button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div className="surface-soft rounded-lg p-2 text-center">
                  <div className="text-ink-400">سررسید</div>
                  <div className={`font-bold mt-0.5 ${overdue ? 'text-rose-300' : 'text-amber-300'}`}>{formatJalali(p.nextDue)}</div>
                </div>
                <div className="surface-soft rounded-lg p-2 text-center">
                  <div className="text-ink-400">تکنسین</div>
                  <div className="font-bold mt-0.5 text-amber-300">{tech?.name ?? '—'}</div>
                </div>
                <div className="surface-soft rounded-lg p-2 text-center">
                  <div className="text-ink-400">انطباق</div>
                  <div className="font-bold mt-0.5 text-emerald-300">{faNum(p.compliance)}٪</div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-ink-400 mb-1">
                  <span>چک‌لیست</span>
                  <span>{faNum(done)} / {faNum(p.checklist.length)}</span>
                </div>
                <div className="space-y-1">
                  {p.checklist.slice(0, 3).map((c, i) => (
                    <label key={i} className="flex items-start gap-2 text-xs cursor-pointer">
                      <input type="checkbox" className="accent-amber-500 mt-0.5" checked={c.done}
                        onChange={e => updatePM(p.id, { checklist: p.checklist.map((x, j) => j === i ? { ...x, done: e.target.checked } : x) })} />
                      <span className={c.done ? 'line-through text-ink-500' : 'text-ink-200'}>{c.item}</span>
                    </label>
                  ))}
                  {p.checklist.length > 3 && <div className="text-[11px] text-amber-300">+ {faNum(p.checklist.length - 3)} مورد دیگر</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="font-bold text-base mb-3 flex items-center gap-2"><I.AI className="text-amber-400" /> <span className="text-gold-gradient">تحلیل PM</span></h3>
        <div className="grid md:grid-cols-3 gap-3">{insights.map(i => <AIInsightCard key={i.id} insight={i} />)}</div>
      </div>

      {editing && (
        <Modal open={true} onClose={() => setEditing(null)} title={pms.some(p => p.id === editing.id) ? 'ویرایش PM' : 'PM جدید'}
          footer={<>
            <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setEditing(null)}>انصراف</button>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={save}>ذخیره</button>
          </>}>
          <PMForm value={editing} onChange={setEditing} />
        </Modal>
      )}
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="حذف PM" message={`«${del?.name}» حذف شود؟`}
        onConfirm={() => { if (del) { removePM(del.id); toast.push('PM حذف شد', 'info'); } }} />
    </div>
  );
}

function KPI({ label, value, bad }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="surface rounded-xl p-4">
      <div className="text-[11px] text-ink-300">{label}</div>
      <div className={`font-display text-2xl mt-1 ${bad ? 'text-rose-300' : 'text-gold-gradient'}`}>{value}</div>
    </div>
  );
}

function PMForm({ value, onChange }: { value: PMPlan; onChange: (v: PMPlan) => void }) {
  const { equipment, users } = useApp();
  const u = (p: Partial<PMPlan>) => onChange({ ...value, ...p });
  return (
    <div className="grid sm:grid-cols-2 gap-3 text-sm">
      <L label="نام برنامه *" full><input className="input-dark" value={value.name} onChange={e => u({ name: e.target.value })} /></L>
      <L label="تجهیز">
        <select className="input-dark" value={value.equipmentId} onChange={e => u({ equipmentId: e.target.value })}>
          {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.code} — {eq.name}</option>)}
        </select>
      </L>
      <L label="تواتر">
        <select className="input-dark" value={value.frequency} onChange={e => u({ frequency: e.target.value as PMPlan['frequency'] })}>
          {Object.entries(FREQ_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </L>
      <L label="نوع کار">
        <select className="input-dark" value={value.taskType} onChange={e => u({ taskType: e.target.value as PMPlan['taskType'] })}>
          {Object.entries(TASK_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </L>
      <L label="تخصیص به">
        <select className="input-dark" value={value.assignedTo} onChange={e => u({ assignedTo: e.target.value })}>
          {users.filter(u => u.role === 'technician' || u.role === 'supervisor').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </L>
      <L label="سررسید بعدی"><input type="date" className="input-dark" value={value.nextDue.slice(0, 10)} onChange={e => u({ nextDue: new Date(e.target.value).toISOString() })} /></L>
      <L label="چک‌لیست" full>
        <div className="space-y-2">
          {value.checklist.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="input-dark flex-1" value={c.item} onChange={e => u({ checklist: value.checklist.map((x, j) => j === i ? { ...x, item: e.target.value } : x) })} />
              <button type="button" className="p-2 rounded text-rose-300 hover:bg-rose-500/10" onClick={() => u({ checklist: value.checklist.filter((_, j) => j !== i) })}><I.Trash size={14} /></button>
            </div>
          ))}
          <button type="button" className="btn-ghost-gold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1" onClick={() => u({ checklist: [...value.checklist, { item: '', done: false }] })}>
            <I.Plus size={12} /> افزودن مورد
          </button>
        </div>
      </L>
    </div>
  );
}

function L({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`block ${full ? 'sm:col-span-2' : ''}`}><span className="text-[11px] text-ink-300 mb-1 block">{label}</span>{children}</label>;
}
