import { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { faNum, uid, formatJalali, timeAgo, downloadCSV, printElement } from '../lib/utils';
import { Modal, ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { AIInsightCard } from '../components/AIInsightCard';
import { AIVision } from '../components/AIVision';
import { analyzeWorkOrders } from '../lib/ai';
import type { ImageAnalysisResult } from '../lib/imageAI';
import type { WorkOrder, WOStatus, WOType, WOPriority } from '../lib/types';

const STATUS_LABEL: Record<WOStatus, string> = {
  draft: 'پیش‌نویس', submitted: 'ثبت‌شده', approved: 'تأیید‌شده', assigned: 'تخصیص‌یافته',
  in_progress: 'در حال انجام', verification: 'بازرسی نهایی', completed: 'تکمیل‌شده', closed: 'بسته‌شده'
};

const TYPE_LABEL: Record<WOType, string> = {
  corrective: 'اصلاحی', preventive: 'پیشگیرانه', predictive: 'پیش‌گویانه',
  emergency: 'اضطراری', improvement: 'بهبود', inspection: 'بازرسی', project: 'پروژه'
};

const PRIO_COLOR: Record<WOPriority, string> = {
  critical: 'bg-rose-500/15 text-rose-200 border-rose-500/30',
  high: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  medium: 'bg-sky-500/15 text-sky-200 border-sky-500/30',
  low: 'bg-ink-500/15 text-ink-200 border-ink-500/30',
};

const PRIO_LABEL: Record<WOPriority, string> = { critical: 'بحرانی', high: 'بالا', medium: 'متوسط', low: 'پایین' };

export function WorkOrdersPage() {
  const { workOrders, addWO, updateWO, removeWO, equipment, users, currentUser, markWOViewed, parts } = useApp();
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<WOStatus | ''>('');
  const [filterType, setFilterType] = useState<WOType | ''>('');
  const [filterPrio, setFilterPrio] = useState<WOPriority | ''>('');
  const [editing, setEditing] = useState<WorkOrder | null>(null);
  const [detailWO, setDetailWO] = useState<WorkOrder | null>(null);
  const [delWO, setDelWO] = useState<WorkOrder | null>(null);
  const toast = useToast();

  const filtered = useMemo(() => workOrders.filter(w =>
    (!search || w.title.includes(search) || w.number.includes(search) || w.description.includes(search)) &&
    (!filterStatus || w.status === filterStatus) &&
    (!filterType || w.type === filterType) &&
    (!filterPrio || w.priority === filterPrio)
  ), [workOrders, search, filterStatus, filterType, filterPrio]);

  const insights = useMemo(() => analyzeWorkOrders(workOrders), [workOrders]);

  const openNew = () => {
    setEditing({
      id: uid('wo'),
      number: `WO-${faNum(new Date().getFullYear())}-${String(workOrders.length + 100).padStart(4, '0')}`,
      title: '', description: '', type: 'corrective', priority: 'medium', status: 'draft',
      equipmentId: undefined, department: currentUser?.department ?? 'تولید', requestedBy: currentUser?.id ?? '',
      assignedTo: [], plannedStart: new Date().toISOString(), plannedEnd: new Date(Date.now() + 86400000).toISOString(),
      estimatedCost: 0, actualCost: 0, laborHours: 0, partsUsed: [],
      attachmentsBefore: [], attachmentsAfter: [], voiceNotes: [], textNotes: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title) { toast.push('عنوان دستور کار الزامی است', 'error'); return; }
    if (workOrders.some(w => w.id === editing.id)) {
      updateWO(editing.id, editing);
      toast.push('دستور کار به‌روزرسانی شد');
    } else {
      addWO(editing);
      toast.push('دستور کار جدید ثبت شد و اعلان‌ها ارسال شد');
    }
    setEditing(null);
  };

  const dupWO = (w: WorkOrder) => {
    const copy: WorkOrder = { ...w, id: uid('wo'), number: w.number + '-کپی', status: 'draft', actualStart: undefined, actualEnd: undefined, attachmentsAfter: [], voiceNotes: [], textNotes: [], viewedAt: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    addWO(copy);
    toast.push('دستور کار کپی شد');
  };

  const openDetail = (w: WorkOrder) => {
    setDetailWO(w);
    if (currentUser) markWOViewed(w.id, currentUser.id);
  };

  const exportCSV = () => {
    downloadCSV(filtered.map(w => ({
      شماره: w.number, عنوان: w.title, نوع: TYPE_LABEL[w.type], اولویت: PRIO_LABEL[w.priority],
      وضعیت: STATUS_LABEL[w.status], دپارتمان: w.department, شروع: formatJalali(w.plannedStart),
      پایان: formatJalali(w.plannedEnd), 'هزینه برآورد': w.estimatedCost, 'هزینه واقعی': w.actualCost,
    })), 'workorders.csv');
    toast.push('فایل CSV دانلود شد');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="surface rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
            <input className="input-dark pr-8 py-2 text-sm" placeholder="جستجو در شماره، عنوان یا توضیحات..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-dark py-2 text-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value as WOStatus | '')}>
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="input-dark py-2 text-sm w-auto" value={filterType} onChange={e => setFilterType(e.target.value as WOType | '')}>
            <option value="">همه انواع</option>
            {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="input-dark py-2 text-sm w-auto" value={filterPrio} onChange={e => setFilterPrio(e.target.value as WOPriority | '')}>
            <option value="">همه اولویت‌ها</option>
            {Object.entries(PRIO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="flex rounded-lg overflow-hidden border border-amber-500/25">
            <button onClick={() => setView('table')} className={`px-3 py-2 text-xs ${view === 'table' ? 'btn-gold' : 'text-amber-300 hover:bg-amber-500/10'}`}>جدول</button>
            <button onClick={() => setView('kanban')} className={`px-3 py-2 text-xs ${view === 'kanban' ? 'btn-gold' : 'text-amber-300 hover:bg-amber-500/10'}`}>کانبان</button>
          </div>
          <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" onClick={exportCSV}><I.Download size={13} /> خروجی</button>
          <button className="btn-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" onClick={openNew}><I.Plus size={13} /> دستور کار جدید</button>
        </div>
        <div className="mt-2 text-[11px] text-ink-400">
          نمایش <span className="text-amber-300 font-bold">{faNum(filtered.length)}</span> از <span className="text-amber-300">{faNum(workOrders.length)}</span> دستور کار
        </div>
      </div>

      {/* View */}
      {view === 'table' && (
        <div className="surface rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-500/5 text-amber-300 text-xs">
                <tr>
                  <th className="px-3 py-3 text-right">شماره</th>
                  <th className="px-3 py-3 text-right">عنوان</th>
                  <th className="px-3 py-3 text-right">نوع</th>
                  <th className="px-3 py-3 text-right">اولویت</th>
                  <th className="px-3 py-3 text-right">وضعیت</th>
                  <th className="px-3 py-3 text-right">تخصیص</th>
                  <th className="px-3 py-3 text-right">سررسید</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {filtered.map(w => {
                  const isOverdue = new Date(w.plannedEnd) < new Date() && !['completed', 'closed'].includes(w.status);
                  return (
                    <tr key={w.id} className="hover:bg-amber-500/5 cursor-pointer" onClick={() => openDetail(w)}>
                      <td className="px-3 py-2.5 font-mono text-amber-300 text-xs">{w.number}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-ink-100 line-clamp-1">{w.title}</div>
                        <div className="text-[11px] text-ink-400 line-clamp-1 mt-0.5">{w.description}</div>
                      </td>
                      <td className="px-3 py-2.5"><span className="pill bg-amber-500/10 text-amber-200 border-amber-500/20">{TYPE_LABEL[w.type]}</span></td>
                      <td className="px-3 py-2.5"><span className={`pill border ${PRIO_COLOR[w.priority]}`}>{PRIO_LABEL[w.priority]}</span></td>
                      <td className="px-3 py-2.5 text-xs">{STATUS_LABEL[w.status]}</td>
                      <td className="px-3 py-2.5 text-xs">
                        <div className="flex -space-x-2 -space-x-reverse">
                          {w.assignedTo.slice(0, 3).map(id => {
                            const u = users.find(x => x.id === id);
                            return u ? <div key={id} title={u.name} className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 border-2 border-ink-900 flex items-center justify-center text-[10px] font-bold text-ink-900">{u.name.charAt(0)}</div> : null;
                          })}
                          {w.assignedTo.length === 0 && <span className="text-ink-500">—</span>}
                        </div>
                      </td>
                      <td className={`px-3 py-2.5 text-xs ${isOverdue ? 'text-rose-300 font-bold' : 'text-ink-300'}`}>
                        {formatJalali(w.plannedEnd)}
                        {isOverdue && <div className="text-[10px]">معوق!</div>}
                      </td>
                      <td className="px-3 py-2.5 text-left">
                        <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
                          <button title="کپی" onClick={() => dupWO(w)} className="p-1.5 rounded hover:bg-amber-500/10 text-amber-300"><I.Plus size={13} /></button>
                          <button title="ویرایش" onClick={() => setEditing(w)} className="p-1.5 rounded hover:bg-amber-500/10 text-amber-300"><I.Edit size={13} /></button>
                          <button title="حذف" onClick={() => setDelWO(w)} className="p-1.5 rounded hover:bg-rose-500/10 text-rose-300"><I.Trash size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-ink-400">دستور کاری یافت نشد</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'kanban' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['submitted', 'approved', 'in_progress', 'completed'] as WOStatus[]).map(s => (
            <div key={s} className="surface rounded-2xl p-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-gold-gradient">{STATUS_LABEL[s]}</h4>
                <span className="text-[11px] text-ink-400">{faNum(filtered.filter(w => w.status === s).length)}</span>
              </div>
              <div className="space-y-2 min-h-[40px]">
                {filtered.filter(w => w.status === s).map(w => (
                  <button key={w.id} onClick={() => openDetail(w)} className="surface-soft rounded-xl p-3 text-right block w-full hover:border-amber-500/40 transition">
                    <div className="text-[10px] font-mono text-amber-300/80">{w.number}</div>
                    <div className="text-sm font-semibold mt-0.5 line-clamp-2">{w.title}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`pill border ${PRIO_COLOR[w.priority]}`}>{PRIO_LABEL[w.priority]}</span>
                      <span className="text-[10px] text-ink-400">{formatJalali(w.plannedEnd).split(' ').slice(1, 3).join(' ')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Insights */}
      <div>
        <h3 className="font-bold text-base mb-3 flex items-center gap-2"><I.AI className="text-amber-400" /> <span className="text-gold-gradient">تحلیل دستور کارها</span></h3>
        <div className="grid md:grid-cols-3 gap-3">
          {insights.map(i => <AIInsightCard key={i.id} insight={i} />)}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <Modal open={true} onClose={() => setEditing(null)} size="lg"
          title={workOrders.some(w => w.id === editing.id) ? `ویرایش ${editing.number}` : 'دستور کار جدید'}
          footer={<>
            <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setEditing(null)}>انصراف</button>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={save}>ذخیره و ارسال اعلان</button>
          </>}>
          <WOForm value={editing} onChange={setEditing} equipment={equipment} users={users} parts={parts} />
        </Modal>
      )}

      {/* Detail Modal */}
      {detailWO && <WODetail wo={detailWO} onClose={() => setDetailWO(null)} />}

      <ConfirmDialog open={!!delWO} onClose={() => setDelWO(null)} title="حذف دستور کار"
        message={`آیا از حذف ${delWO?.number} اطمینان دارید؟`}
        onConfirm={() => { if (delWO) { removeWO(delWO.id); toast.push('دستور کار حذف شد', 'info'); } }} />
    </div>
  );
}

function WOForm({ value, onChange, equipment, users, parts }: {
  value: WorkOrder; onChange: (v: WorkOrder) => void;
  equipment: ReturnType<typeof useApp>['equipment']; users: ReturnType<typeof useApp>['users']; parts: ReturnType<typeof useApp>['parts'];
}) {
  const u = (patch: Partial<WorkOrder>) => onChange({ ...value, ...patch });
  return (
    <div className="grid sm:grid-cols-2 gap-3 text-sm">
      <Lbl label="شماره"><input className="input-dark" value={value.number} onChange={e => u({ number: e.target.value })} /></Lbl>
      <Lbl label="عنوان *"><input className="input-dark" value={value.title} onChange={e => u({ title: e.target.value })} /></Lbl>
      <Lbl label="توضیحات" full><textarea className="input-dark min-h-[80px]" value={value.description} onChange={e => u({ description: e.target.value })} /></Lbl>
      <Lbl label="نوع">
        <select className="input-dark" value={value.type} onChange={e => u({ type: e.target.value as WOType })}>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Lbl>
      <Lbl label="اولویت">
        <select className="input-dark" value={value.priority} onChange={e => u({ priority: e.target.value as WOPriority })}>
          {Object.entries(PRIO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Lbl>
      <Lbl label="وضعیت">
        <select className="input-dark" value={value.status} onChange={e => u({ status: e.target.value as WOStatus })}>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Lbl>
      <Lbl label="دپارتمان"><input className="input-dark" value={value.department} onChange={e => u({ department: e.target.value })} /></Lbl>
      <Lbl label="تجهیز">
        <select className="input-dark" value={value.equipmentId ?? ''} onChange={e => u({ equipmentId: e.target.value || undefined })}>
          <option value="">— انتخاب کنید —</option>
          {equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.code} — {eq.name}</option>)}
        </select>
      </Lbl>
      <Lbl label="شروع برنامه‌ریزی"><input type="date" className="input-dark" value={value.plannedStart.slice(0, 10)} onChange={e => u({ plannedStart: new Date(e.target.value).toISOString() })} /></Lbl>
      <Lbl label="پایان برنامه‌ریزی"><input type="date" className="input-dark" value={value.plannedEnd.slice(0, 10)} onChange={e => u({ plannedEnd: new Date(e.target.value).toISOString() })} /></Lbl>
      <Lbl label="هزینه برآورد (ریال)"><input type="number" className="input-dark" value={value.estimatedCost} onChange={e => u({ estimatedCost: +e.target.value })} /></Lbl>
      <Lbl label="نفر-ساعت برآورد"><input type="number" className="input-dark" value={value.laborHours} onChange={e => u({ laborHours: +e.target.value })} /></Lbl>
      <Lbl label="تخصیص به (تکنسین‌ها)" full>
        <div className="flex flex-wrap gap-1.5">
          {users.filter(u => u.role === 'technician' || u.role === 'supervisor').map(t => {
            const sel = value.assignedTo.includes(t.id);
            return (
              <button type="button" key={t.id} onClick={() => u({ assignedTo: sel ? value.assignedTo.filter(x => x !== t.id) : [...value.assignedTo, t.id] })}
                className={`px-3 py-1.5 rounded-lg text-xs border ${sel ? 'btn-gold' : 'btn-ghost-gold'}`}>
                {t.name}
              </button>
            );
          })}
        </div>
      </Lbl>
      <Lbl label="قطعات مورد نیاز" full>
        <div className="space-y-2">
          {value.partsUsed.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select className="input-dark flex-1" value={p.partId} onChange={e => u({ partsUsed: value.partsUsed.map((x, i) => i === idx ? { ...x, partId: e.target.value } : x) })}>
                {parts.map(pt => <option key={pt.id} value={pt.id}>{pt.code} — {pt.name}</option>)}
              </select>
              <input type="number" className="input-dark w-24" value={p.qty} onChange={e => u({ partsUsed: value.partsUsed.map((x, i) => i === idx ? { ...x, qty: +e.target.value } : x) })} />
              <button type="button" className="p-2 rounded-lg text-rose-300 hover:bg-rose-500/10" onClick={() => u({ partsUsed: value.partsUsed.filter((_, i) => i !== idx) })}><I.Trash size={14} /></button>
            </div>
          ))}
          <button type="button" className="btn-ghost-gold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1" onClick={() => u({ partsUsed: [...value.partsUsed, { partId: parts[0]?.id ?? '', qty: 1 }] })}>
            <I.Plus size={12} /> افزودن قطعه
          </button>
        </div>
      </Lbl>
    </div>
  );
}

function Lbl({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`block ${full ? 'sm:col-span-2' : ''}`}><span className="text-[11px] text-ink-300 mb-1 block">{label}</span>{children}</label>;
}

// Detail with photos before/after, voice notes, text notes, viewed-by
function WODetail({ wo, onClose }: { wo: WorkOrder; onClose: () => void }) {
  const { updateWO, users, currentUser, equipment } = useApp();
  const toast = useToast();
  const [current, setCurrent] = useState(wo);
  const printRef = useRef<HTMLDivElement>(null);
  const [visionOpen, setVisionOpen] = useState(false);
  const [visionImageUrl, setVisionImageUrl] = useState<string | null>(null);

  useEffect(() => { setCurrent(wo); }, [wo]);

  const eq = equipment.find(e => e.id === current.equipmentId);
  const reqBy = users.find(u => u.id === current.requestedBy);

  const handleFile = (files: FileList | null, kind: 'before' | 'after') => {
    if (!files) return;
    const arr: string[] = [];
    let read = 0;
    Array.from(files).forEach(f => {
      const r = new FileReader();
      r.onload = () => {
        arr.push(r.result as string);
        read++;
        if (read === files.length) {
          const next = kind === 'before'
            ? { ...current, attachmentsBefore: [...current.attachmentsBefore, ...arr] }
            : { ...current, attachmentsAfter: [...current.attachmentsAfter, ...arr] };
          setCurrent(next);
          updateWO(current.id, next);
          toast.push(`${faNum(arr.length)} عکس ${kind === 'before' ? 'قبل' : 'بعد'} ذخیره شد`);
        }
      };
      r.readAsDataURL(f);
    });
  };

  const addTextNote = (text: string) => {
    if (!text.trim()) return;
    const next = { ...current, textNotes: [...current.textNotes, { author: currentUser?.name ?? '', text, at: new Date().toISOString() }] };
    setCurrent(next); updateWO(current.id, next);
  };

  const [voice, setVoice] = useState<{ recording: boolean; mediaRecorder?: MediaRecorder; chunks: Blob[] }>({ recording: false, chunks: [] });

  const toggleVoice = async () => {
    if (!voice.recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        mr.ondataavailable = e => chunks.push(e.data);
        mr.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const r = new FileReader();
          r.onload = () => {
            // Mock transcription
            const transcript = 'این یک متن نمونه تبدیل صدا به متن است که توسط هوش مصنوعی تولید شده است. در نسخه عملیاتی از Whisper API استفاده می‌شود.';
            const next = { ...current, voiceNotes: [...current.voiceNotes, { url: r.result as string, transcript, at: new Date().toISOString() }] };
            setCurrent(next); updateWO(current.id, next);
            toast.push('یادداشت صوتی ذخیره و تبدیل به متن شد');
          };
          r.readAsDataURL(blob);
          stream.getTracks().forEach(t => t.stop());
        };
        mr.start();
        setVoice({ recording: true, mediaRecorder: mr, chunks });
      } catch {
        toast.push('دسترسی به میکروفون امکان‌پذیر نیست — صدای آزمایشی ذخیره شد', 'warning');
        const next = { ...current, voiceNotes: [...current.voiceNotes, { url: '', transcript: 'یادداشت آزمایشی (بدون دسترسی به میکروفون)', at: new Date().toISOString() }] };
        setCurrent(next); updateWO(current.id, next);
      }
    } else {
      voice.mediaRecorder?.stop();
      setVoice({ recording: false, chunks: [] });
    }
  };

  return (
    <Modal open={true} onClose={onClose} size="xl"
      title={`${current.number} — ${current.title}`}
      footer={<>
        <button className="btn-ghost-gold px-3 py-2 rounded-lg text-sm flex items-center gap-1" onClick={() => printElement(printRef.current)}><I.Print size={13} /> چاپ</button>
        <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={onClose}>بستن</button>
      </>}>
      <div ref={printRef} className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <Info label="نوع" value={TYPE_LABEL[current.type]} />
          <Info label="اولویت" value={PRIO_LABEL[current.priority]} />
          <Info label="وضعیت" value={STATUS_LABEL[current.status]} />
          <Info label="دپارتمان" value={current.department} />
          <Info label="تجهیز" value={eq ? `${eq.code} — ${eq.name}` : '—'} />
          <Info label="درخواست‌کننده" value={reqBy?.name ?? '—'} />
          <Info label="شروع برنامه" value={formatJalali(current.plannedStart, true)} />
          <Info label="پایان برنامه" value={formatJalali(current.plannedEnd, true)} />
          <Info label="نفر-ساعت" value={faNum(current.laborHours)} />
        </div>

        <div className="surface-soft rounded-xl p-3">
          <div className="text-xs text-amber-300 font-bold mb-1">توضیحات</div>
          <p className="text-sm text-ink-100 leading-7">{current.description}</p>
        </div>

        {/* Assigned + viewed */}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="surface-soft rounded-xl p-3">
            <div className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1"><I.Users size={12} /> تخصیص‌یافته به</div>
            <div className="space-y-1.5">
              {current.assignedTo.map(id => {
                const u = users.find(x => x.id === id);
                if (!u) return null;
                return <div key={id} className="text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400" />{u.name} <span className="text-[11px] text-ink-400">— {u.jobTitle}</span></div>;
              })}
              {current.assignedTo.length === 0 && <div className="text-xs text-ink-400">هنوز تخصیص داده نشده</div>}
            </div>
          </div>
          <div className="surface-soft rounded-xl p-3">
            <div className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1"><I.Eye size={12} /> زمان مشاهده توسط نفرات</div>
            <div className="space-y-1.5">
              {(current.viewedAt ?? []).map((v, i) => {
                const u = users.find(x => x.id === v.userId);
                return <div key={i} className="text-xs flex items-center justify-between"><span>{u?.name ?? v.userId}</span><span className="text-amber-300/80">{formatJalali(v.at, true)} ({timeAgo(v.at)})</span></div>;
              })}
              {(current.viewedAt ?? []).length === 0 && <div className="text-xs text-ink-400">هنوز توسط هیچ‌کس مشاهده نشده</div>}
            </div>
          </div>
        </div>

        {/* AI Vision quick button */}
        <div className="surface ring-gold rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <div className="p-2 rounded-lg bg-amber-500/15 text-amber-300"><I.Eye size={18} /></div>
          <div className="flex-1 min-w-[180px]">
            <h5 className="font-bold text-sm text-gold-gradient">🔍 تحلیل تصویری هوشمند</h5>
            <p className="text-[11px] text-ink-300 mt-0.5">روی هر عکس کلیک کنید تا AI آن را تحلیل و علل خرابی را تشخیص دهد.</p>
          </div>
          <button onClick={() => { setVisionImageUrl(null); setVisionOpen(true); }}
            className="btn-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1">
            <I.Camera size={12} /> تحلیل عکس جدید
          </button>
        </div>

        {/* Photos */}
        <div className="grid md:grid-cols-2 gap-3">
          {(['before', 'after'] as const).map(kind => (
            <div key={kind} className="surface-soft rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-amber-300 font-bold flex items-center gap-1"><I.Camera size={12} /> عکس‌های {kind === 'before' ? 'قبل از اقدام' : 'بعد از اقدام'}</div>
                <label className="btn-ghost-gold px-2 py-1 rounded-lg text-[11px] cursor-pointer">
                  <I.Upload size={11} className="inline-block ml-1" /> افزودن
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFile(e.target.files, kind)} />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(kind === 'before' ? current.attachmentsBefore : current.attachmentsAfter).map((src, i) => (
                  <button key={i} onClick={() => { setVisionImageUrl(src); setVisionOpen(true); }}
                    className="relative group w-full h-20 rounded-lg overflow-hidden border border-amber-500/20 hover:border-amber-400 transition" title="کلیک برای تحلیل AI">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1"><I.Eye size={10} /> تحلیل AI</span>
                    </div>
                  </button>
                ))}
                {(kind === 'before' ? current.attachmentsBefore : current.attachmentsAfter).length === 0 && (
                  <div className="col-span-3 text-center text-xs text-ink-500 py-4">عکسی ثبت نشده</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <AIVision open={visionOpen} onClose={() => setVisionOpen(false)}
          contextHint={`${current.title} — ${current.description}`}
          onResult={visionImageUrl ? undefined : (result: ImageAnalysisResult, url: string) => {
            // Save analyzed image as a "before" photo + add AI text note
            const noteText = `🤖 تحلیل AI تصویر: ${result.categoryLabel} (اطمینان ${result.confidence}٪)\n\nمشاهدات:\n${result.observations.map((o: string) => '• ' + o).join('\n')}\n\nتوصیه‌ها:\n${result.recommendations.map((r: string) => '• ' + r).join('\n')}`;
            const next = {
              ...current,
              attachmentsBefore: [...current.attachmentsBefore, url],
              textNotes: [...current.textNotes, { author: 'دستیار AI', text: noteText, at: new Date().toISOString() }],
            };
            setCurrent(next);
            updateWO(current.id, next);
            toast.push('تصویر و تحلیل AI به دستور کار اضافه شد', 'success');
          }} />

        {/* Voice + Text notes */}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="surface-soft rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-amber-300 font-bold flex items-center gap-1"><I.Mic size={12} /> یادداشت‌های صوتی (تبدیل به متن)</div>
              <button onClick={toggleVoice} className={`px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 ${voice.recording ? 'bg-rose-500/20 text-rose-300 pulse-gold' : 'btn-ghost-gold'}`}>
                <I.Mic size={11} /> {voice.recording ? 'توقف' : 'ضبط جدید'}
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {current.voiceNotes.map((v, i) => (
                <div key={i} className="surface rounded-lg p-2">
                  {v.url && <audio controls src={v.url} className="w-full h-7" />}
                  <div className="text-[11px] text-ink-200 mt-1.5 leading-5">📝 {v.transcript}</div>
                  <div className="text-[10px] text-ink-400 mt-1">{formatJalali(v.at, true)}</div>
                </div>
              ))}
              {current.voiceNotes.length === 0 && <div className="text-xs text-ink-500 text-center py-3">یادداشت صوتی ثبت نشده</div>}
            </div>
          </div>

          <div className="surface-soft rounded-xl p-3">
            <div className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1"><I.Edit size={12} /> یادداشت‌های متنی</div>
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {current.textNotes.map((n, i) => (
                <div key={i} className="surface rounded-lg p-2">
                  <div className="flex items-center justify-between text-[11px] text-amber-300/80">
                    <span>{n.author}</span><span>{timeAgo(n.at)}</span>
                  </div>
                  <p className="text-sm mt-1 leading-6">{n.text}</p>
                </div>
              ))}
              {current.textNotes.length === 0 && <div className="text-xs text-ink-500 text-center py-3">یادداشتی ثبت نشده</div>}
            </div>
            <form className="flex gap-2 mt-2" onSubmit={e => { e.preventDefault(); const t = (e.currentTarget.elements.namedItem('t') as HTMLInputElement).value; addTextNote(t); e.currentTarget.reset(); }}>
              <input name="t" className="input-dark py-1.5 text-sm" placeholder="یادداشت جدید..." />
              <button className="btn-gold px-3 rounded-lg text-xs">ثبت</button>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="surface-soft rounded-lg p-2.5"><div className="text-[10px] text-ink-400">{label}</div><div className="text-sm text-ink-100 mt-0.5">{value}</div></div>;
}
