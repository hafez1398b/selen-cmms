import { useState, useMemo, useRef } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { faNum, uid, formatJalali, toJalali, downloadCSV, printElement } from '../lib/utils';
import { Modal, ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import type { Equipment } from '../lib/types';

// ====== Types matching the paper form (BFG-FR-27-V2) ======
type ActionType = 'تعمیر اضطراری' | 'پیشگیرانه' | 'خدمات' | 'ساخت ابزار تولیدی/کنترلی';
type ServiceType = 'تأسیسات' | 'برقی' | 'هیدرولیکی' | 'سایر';
type Urgency = 'فوق العاده ضروری' | 'ضروری';
type RepairMethod = 'داخلی' | 'خارجی (بیرون از شرکت)';
type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';

interface ConsumedItem {
  description: string;
  qtyOrManHours: string;
  cost: string;
  notes: string;
}

interface ServiceRequest {
  id: string;
  /** Receipt number — auto */
  receiptNumber: string;
  /** Request date (ISO) */
  requestDate: string;
  /** درخواست‌کننده */
  actionType?: ActionType;
  serviceType?: ServiceType;
  equipmentName: string;
  equipmentCode: string;
  equipmentId?: string;
  installLocation: string;
  faultDateTime: string;
  faultDescription: string;
  additionalInfo: string;
  causedStop: boolean | null;
  stopDateTime?: string;
  urgency?: Urgency;
  requestingUnit: string;
  requestedBy: string;
  /** مسئول نت */
  faultCauseDiagnosis?: string;
  repairMethod?: RepairMethod;
  externalContractor?: string;
  ntManagerName?: string;
  managementApproval?: string;
  /** اقدام انجام‌شده */
  workDescription?: string;
  startDateTime?: string;
  endDateTime?: string;
  netDuration?: string;
  consumedItems: ConsumedItem[];
  /** تحویل */
  maintenanceSignatory?: string;
  requesterSignatory?: string;
  downtimeHours?: string;
  /** رسید تحویل */
  deliveryTo?: string;
  deliveryReceiptNumber?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  /** وضعیت کلی */
  status: RequestStatus;
  createdAt: string;
}

const STORAGE_KEY = 'baspar_service_requests_v1';

function loadRequests(): ServiceRequest[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

function saveRequests(items: ServiceRequest[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* */ }
}

// Generate jalali receipt number like 1405-0001
function genReceiptNumber(existingCount: number): string {
  const { jy } = toJalali(new Date());
  return `BFG-${jy}-${String(existingCount + 1).padStart(4, '0')}`;
}

export function ServiceRequestPage() {
  const { equipment, currentUser } = useApp();
  const [items, setItems] = useState<ServiceRequest[]>(loadRequests);
  const [editing, setEditing] = useState<ServiceRequest | null>(null);
  const [viewing, setViewing] = useState<ServiceRequest | null>(null);
  const [del, setDel] = useState<ServiceRequest | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | ''>('');
  const toast = useToast();

  const filtered = useMemo(() => items.filter(r =>
    (!search || r.equipmentName.includes(search) || r.equipmentCode.includes(search) || r.receiptNumber.includes(search)) &&
    (!filterStatus || r.status === filterStatus)
  ), [items, search, filterStatus]);

  const newRequest = (): ServiceRequest => ({
    id: uid('sr'),
    receiptNumber: genReceiptNumber(items.length),
    requestDate: new Date().toISOString(),
    equipmentName: '',
    equipmentCode: '',
    installLocation: '',
    faultDateTime: new Date().toISOString().slice(0, 16),
    faultDescription: '',
    additionalInfo: '',
    causedStop: null,
    requestingUnit: currentUser?.department ?? '',
    requestedBy: currentUser?.name ?? '',
    consumedItems: [],
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  const persist = (next: ServiceRequest[]) => { setItems(next); saveRequests(next); };

  const save = () => {
    if (!editing) return;
    if (!editing.equipmentName.trim() && !editing.equipmentCode.trim()) {
      toast.push('نام یا کد تجهیز را وارد کنید', 'error'); return;
    }
    if (!editing.faultDescription.trim()) {
      toast.push('شرح خرابی الزامی است', 'error'); return;
    }
    const exists = items.some(i => i.id === editing.id);
    if (exists) {
      persist(items.map(i => i.id === editing.id ? editing : i));
      toast.push(`درخواست ${editing.receiptNumber} به‌روزرسانی شد`, 'success');
    } else {
      persist([editing, ...items]);
      toast.push(`درخواست ${editing.receiptNumber} ثبت شد`, 'success');
    }
    setEditing(null);
  };

  const exportAll = () => {
    downloadCSV(items.map(r => ({
      شماره_رسید: r.receiptNumber,
      تاریخ: formatJalali(r.requestDate),
      نوع_اقدام: r.actionType ?? '',
      نوع_خدمت: r.serviceType ?? '',
      نام_تجهیز: r.equipmentName,
      کد_تجهیز: r.equipmentCode,
      محل_نصب: r.installLocation,
      شرح_خرابی: r.faultDescription,
      ضرورت: r.urgency ?? '',
      وضعیت: STATUS_LABEL[r.status],
      درخواست‌کننده: r.requestedBy,
    })), `service_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.push('خروجی CSV دانلود شد');
  };

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="surface ring-gold rounded-2xl p-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-300 to-amber-700 text-ink-900 shrink-0">
            <I.Alert size={28} />
          </div>
          <div className="flex-1 min-w-[200px]">
            <h2 className="font-bold text-xl text-gold-gradient">فرم درخواست تعمیرات / ساخت و خدمات</h2>
            <p className="text-xs text-ink-300 mt-1">کد سند: BFG-FR-27-V2 • مطابق فرم رسمی شرکت بسپار فوم غرب</p>
          </div>
          <button onClick={() => setEditing(newRequest())}
            className="btn-gold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
            <I.Plus size={14} /> ثبت درخواست جدید
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="surface rounded-2xl p-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
          <input className="input-dark pr-8 py-2 text-sm" placeholder="جستجو در شماره، نام یا کد تجهیز..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-dark py-2 text-sm w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value as RequestStatus | '')}>
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" onClick={exportAll}>
          <I.Download size={13} /> خروجی CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatBox label="کل درخواست‌ها" value={faNum(items.length)} color="amber" />
        <StatBox label="در انتظار" value={faNum(items.filter(i => i.status === 'pending').length)} color="sky" />
        <StatBox label="در حال انجام" value={faNum(items.filter(i => i.status === 'in_progress').length)} color="amber" />
        <StatBox label="تکمیل‌شده" value={faNum(items.filter(i => i.status === 'completed').length)} color="emerald" />
      </div>

      {/* List */}
      <div className="surface rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-500/5 text-amber-300 text-xs">
              <tr>
                <th className="px-3 py-3 text-right">شماره رسید</th>
                <th className="px-3 py-3 text-right">تاریخ</th>
                <th className="px-3 py-3 text-right">نوع اقدام</th>
                <th className="px-3 py-3 text-right">تجهیز</th>
                <th className="px-3 py-3 text-right">محل نصب</th>
                <th className="px-3 py-3 text-right">ضرورت</th>
                <th className="px-3 py-3 text-right">وضعیت</th>
                <th className="px-3 py-3 text-right">درخواست‌کننده</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-sm text-ink-400">
                  هیچ درخواستی ثبت نشده — روی «ثبت درخواست جدید» کلیک کنید
                </td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-amber-500/5 cursor-pointer" onClick={() => setViewing(r)}>
                  <td className="px-3 py-2.5 font-mono text-amber-300 text-xs">{r.receiptNumber}</td>
                  <td className="px-3 py-2.5 text-xs">{formatJalali(r.requestDate)}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {r.actionType && <span className="pill bg-amber-500/10 text-amber-200">{r.actionType}</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-sm">{r.equipmentName}</div>
                    <div className="text-[10px] text-ink-400 font-mono">{r.equipmentCode}</div>
                  </td>
                  <td className="px-3 py-2.5 text-xs">{r.installLocation || '—'}</td>
                  <td className="px-3 py-2.5">
                    {r.urgency && <span className={`pill ${r.urgency === 'فوق العاده ضروری' ? 'bg-rose-500/15 text-rose-200' : 'bg-amber-500/15 text-amber-200'}`}>{r.urgency}</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`pill ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs">{r.requestedBy}</td>
                  <td className="px-3 py-2.5 text-left">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setEditing(r)} title="ویرایش" className="p-1.5 rounded hover:bg-amber-500/10 text-amber-300"><I.Edit size={12} /></button>
                      <button onClick={() => setDel(r)} title="حذف" className="p-1.5 rounded hover:bg-rose-500/10 text-rose-300"><I.Trash size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal open={true} onClose={() => setEditing(null)} size="xl"
          title={`📝 ${items.some(i => i.id === editing.id) ? 'ویرایش' : 'ثبت'} درخواست — ${editing.receiptNumber}`}
          footer={<>
            <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setEditing(null)}>انصراف</button>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={save}>ذخیره</button>
          </>}>
          <ServiceRequestForm value={editing} onChange={setEditing} equipment={equipment} />
        </Modal>
      )}

      {/* View modal */}
      {viewing && <ServiceRequestView request={viewing} onClose={() => setViewing(null)} />}

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="حذف درخواست"
        message={`آیا از حذف درخواست «${del?.receiptNumber}» اطمینان دارید؟`}
        onConfirm={() => { if (del) { persist(items.filter(i => i.id !== del.id)); toast.push('درخواست حذف شد', 'info'); } }} />
    </div>
  );
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: 'در انتظار', in_progress: 'در حال انجام', completed: 'تکمیل‌شده', rejected: 'رد‌شده',
};
const STATUS_COLOR: Record<RequestStatus, string> = {
  pending: 'bg-sky-500/15 text-sky-200',
  in_progress: 'bg-amber-500/15 text-amber-200',
  completed: 'bg-emerald-500/15 text-emerald-200',
  rejected: 'bg-rose-500/15 text-rose-200',
};

function StatBox({ label, value, color }: { label: string; value: string; color: 'amber' | 'sky' | 'emerald' }) {
  const cls = { amber: 'text-amber-300', sky: 'text-sky-300', emerald: 'text-emerald-300' }[color];
  return (
    <div className="surface rounded-xl p-4">
      <div className="text-[11px] text-ink-300">{label}</div>
      <div className={`font-display text-2xl mt-1 ${cls}`}>{value}</div>
    </div>
  );
}

// ====== FORM ======
function ServiceRequestForm({ value, onChange, equipment }: {
  value: ServiceRequest; onChange: (v: ServiceRequest) => void; equipment: Equipment[];
}) {
  const u = (patch: Partial<ServiceRequest>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5 text-sm">
      {/* Section 1: درخواست‌کننده */}
      <Section title="بخش ۱ — درخواست‌کننده">
        <div className="grid sm:grid-cols-2 gap-3">
          <F label="تاریخ درخواست"><input type="date" className="input-dark" value={value.requestDate.slice(0, 10)} onChange={e => u({ requestDate: new Date(e.target.value).toISOString() })} /></F>
          <F label="شماره رسید درخواست"><input className="input-dark font-mono" value={value.receiptNumber} onChange={e => u({ receiptNumber: e.target.value })} /></F>
        </div>

        <Radios label="نوع اقدام" value={value.actionType} options={['تعمیر اضطراری', 'پیشگیرانه', 'خدمات', 'ساخت ابزار تولیدی/کنترلی']}
          onChange={v => u({ actionType: v as ActionType })} />
        <Radios label="نوع خدمت" value={value.serviceType} options={['تأسیسات', 'برقی', 'هیدرولیکی', 'سایر']}
          onChange={v => u({ serviceType: v as ServiceType })} />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <F label="نام تجهیز *">
            <input className="input-dark" list="eq-list" value={value.equipmentName}
              onChange={e => {
                const name = e.target.value;
                const found = equipment.find(eq => eq.name === name);
                if (found) {
                  u({ equipmentName: name, equipmentCode: found.code, equipmentId: found.id, installLocation: found.location });
                } else {
                  u({ equipmentName: name });
                }
              }} />
            <datalist id="eq-list">
              {equipment.map(eq => <option key={eq.id} value={eq.name}>{eq.code} - {eq.location}</option>)}
            </datalist>
          </F>
          <F label="کد تجهیز"><input className="input-dark font-mono" value={value.equipmentCode} onChange={e => u({ equipmentCode: e.target.value })} /></F>
          <F label="محل نصب"><input className="input-dark" value={value.installLocation} onChange={e => u({ installLocation: e.target.value })} /></F>
          <F label="ساعت/تاریخ خرابی"><input type="datetime-local" className="input-dark" value={value.faultDateTime} onChange={e => u({ faultDateTime: e.target.value })} /></F>
        </div>

        <F label="شرح خرابی / یا درخواست خدمت *">
          <textarea className="input-dark min-h-[80px]" value={value.faultDescription} onChange={e => u({ faultDescription: e.target.value })} />
        </F>

        <F label="اطلاعات تکمیلی در خصوص خرابی">
          <textarea className="input-dark min-h-[60px]" value={value.additionalInfo} onChange={e => u({ additionalInfo: e.target.value })} />
        </F>

        <div className="grid sm:grid-cols-2 gap-3">
          <F label="آیا خرابی موجب توقف شده است؟">
            <div className="flex gap-3 pt-2">
              {[
                { v: true, l: 'بله' },
                { v: false, l: 'خیر' },
              ].map(o => (
                <label key={String(o.v)} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="caused-stop" checked={value.causedStop === o.v} onChange={() => u({ causedStop: o.v })} className="accent-amber-500" />
                  <span className="text-sm">{o.l}</span>
                </label>
              ))}
            </div>
          </F>
          <F label="ساعت/تاریخ توقف"><input type="datetime-local" className="input-dark" disabled={!value.causedStop}
            value={value.stopDateTime ?? ''} onChange={e => u({ stopDateTime: e.target.value })} /></F>
        </div>

        <Radios label="میزان ضرورت انجام کار" value={value.urgency} options={['فوق العاده ضروری', 'ضروری']}
          onChange={v => u({ urgency: v as Urgency })} />

        <div className="grid sm:grid-cols-2 gap-3">
          <F label="واحد درخواست‌کننده"><input className="input-dark" value={value.requestingUnit} onChange={e => u({ requestingUnit: e.target.value })} /></F>
          <F label="نام درخواست‌کننده"><input className="input-dark" value={value.requestedBy} onChange={e => u({ requestedBy: e.target.value })} /></F>
        </div>
      </Section>

      {/* Section 2: مسئول نت */}
      <Section title="بخش ۲ — مسئول نگهداری و تعمیرات">
        <F label="تشخیص علت خرابی">
          <textarea className="input-dark min-h-[60px]" value={value.faultCauseDiagnosis ?? ''} onChange={e => u({ faultCauseDiagnosis: e.target.value })} />
        </F>

        <Radios label="تشخیص روش رفع خرابی" value={value.repairMethod} options={['داخلی', 'خارجی (بیرون از شرکت)']}
          onChange={v => u({ repairMethod: v as RepairMethod })} />

        {value.repairMethod === 'خارجی (بیرون از شرکت)' && (
          <F label="توسط پیمانکار خارجی"><input className="input-dark" value={value.externalContractor ?? ''} onChange={e => u({ externalContractor: e.target.value })} placeholder="نام پیمانکار..." /></F>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <F label="نام و امضاء مسئول نت"><input className="input-dark" value={value.ntManagerName ?? ''} onChange={e => u({ ntManagerName: e.target.value })} /></F>
          <F label="تأیید مدیریت"><input className="input-dark" value={value.managementApproval ?? ''} onChange={e => u({ managementApproval: e.target.value })} /></F>
        </div>
      </Section>

      {/* Section 3: نگهداری/تعمیرات/ساخت */}
      <Section title="بخش ۳ — نگهداری، تعمیرات و ساخت">
        <F label="شرح کار انجام‌شده">
          <textarea className="input-dark min-h-[60px]" value={value.workDescription ?? ''} onChange={e => u({ workDescription: e.target.value })} />
        </F>

        <div className="grid sm:grid-cols-3 gap-3">
          <F label="تاریخ و ساعت شروع تعمیر/ساخت"><input type="datetime-local" className="input-dark" value={value.startDateTime ?? ''} onChange={e => u({ startDateTime: e.target.value })} /></F>
          <F label="تاریخ و ساعت پایان تعمیر/ساخت"><input type="datetime-local" className="input-dark" value={value.endDateTime ?? ''} onChange={e => u({ endDateTime: e.target.value })} /></F>
          <F label="کل زمان خالص (ساعت)"><input className="input-dark" value={value.netDuration ?? ''} onChange={e => u({ netDuration: e.target.value })} placeholder="مثلاً 3.5" /></F>
        </div>

        {/* Consumed items table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-amber-300 font-bold">اقلام یا خدمات مصرف‌شده</label>
            <button onClick={() => u({ consumedItems: [...value.consumedItems, { description: '', qtyOrManHours: '', cost: '', notes: '' }] })}
              className="btn-ghost-gold px-2.5 py-1 rounded text-[11px] flex items-center gap-1">
              <I.Plus size={11} /> ردیف جدید
            </button>
          </div>
          <div className="surface-soft rounded-lg overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-amber-500/10 text-amber-300">
                <tr>
                  <th className="px-2 py-2 text-right">شرح</th>
                  <th className="px-2 py-2 text-right">نفر-ساعت / تعداد</th>
                  <th className="px-2 py-2 text-right">هزینه</th>
                  <th className="px-2 py-2 text-right">توضیحات</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {value.consumedItems.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-ink-400 py-3 text-[11px]">ردیفی اضافه نشده</td></tr>
                )}
                {value.consumedItems.map((it, i) => (
                  <tr key={i}>
                    <td className="p-1"><input className="input-dark py-1 text-xs" value={it.description} onChange={e => { const c = [...value.consumedItems]; c[i] = { ...c[i], description: e.target.value }; u({ consumedItems: c }); }} /></td>
                    <td className="p-1"><input className="input-dark py-1 text-xs" value={it.qtyOrManHours} onChange={e => { const c = [...value.consumedItems]; c[i] = { ...c[i], qtyOrManHours: e.target.value }; u({ consumedItems: c }); }} /></td>
                    <td className="p-1"><input className="input-dark py-1 text-xs" value={it.cost} onChange={e => { const c = [...value.consumedItems]; c[i] = { ...c[i], cost: e.target.value }; u({ consumedItems: c }); }} /></td>
                    <td className="p-1"><input className="input-dark py-1 text-xs" value={it.notes} onChange={e => { const c = [...value.consumedItems]; c[i] = { ...c[i], notes: e.target.value }; u({ consumedItems: c }); }} /></td>
                    <td className="p-1 text-center"><button onClick={() => u({ consumedItems: value.consumedItems.filter((_, j) => j !== i) })} className="p-1 rounded hover:bg-rose-500/10 text-rose-300"><I.Trash size={11} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Section 4: تحویل */}
      <Section title="بخش ۴ — تحویل">
        <div className="grid sm:grid-cols-3 gap-3">
          <F label="امضاء مسئول نگهداری/تعمیرات"><input className="input-dark" value={value.maintenanceSignatory ?? ''} onChange={e => u({ maintenanceSignatory: e.target.value })} /></F>
          <F label="امضاء درخواست‌کننده"><input className="input-dark" value={value.requesterSignatory ?? ''} onChange={e => u({ requesterSignatory: e.target.value })} /></F>
          <F label="مدت زمان خواب دستگاه (ساعت)"><input className="input-dark" value={value.downtimeHours ?? ''} onChange={e => u({ downtimeHours: e.target.value })} /></F>
        </div>
      </Section>

      {/* Section 5: رسید تحویل */}
      <Section title="بخش ۵ — رسید تحویل به واحد نت">
        <div className="grid sm:grid-cols-4 gap-3">
          <F label="درخواست تحویل به"><input className="input-dark" value={value.deliveryTo ?? ''} onChange={e => u({ deliveryTo: e.target.value })} /></F>
          <F label="شماره رسید تحویل"><input className="input-dark font-mono" value={value.deliveryReceiptNumber ?? ''} onChange={e => u({ deliveryReceiptNumber: e.target.value })} /></F>
          <F label="تاریخ تحویل"><input type="date" className="input-dark" value={value.deliveryDate ?? ''} onChange={e => u({ deliveryDate: e.target.value })} /></F>
          <F label="ساعت تحویل"><input type="time" className="input-dark" value={value.deliveryTime ?? ''} onChange={e => u({ deliveryTime: e.target.value })} /></F>
        </div>
      </Section>

      {/* Status */}
      <Section title="وضعیت کلی درخواست">
        <Radios label="وضعیت" value={STATUS_LABEL[value.status]}
          options={Object.values(STATUS_LABEL)}
          onChange={v => {
            const key = Object.entries(STATUS_LABEL).find(([, lbl]) => lbl === v)?.[0] as RequestStatus;
            if (key) u({ status: key });
          }} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-soft rounded-xl p-4 space-y-3">
      <h4 className="font-bold text-sm text-gold-gradient border-b border-amber-500/20 pb-2">{title}</h4>
      {children}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] text-ink-300 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function Radios({ label, value, options, onChange }: { label: string; value: string | undefined; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[11px] text-ink-300 mb-1.5 block">{label}</label>
      <div className="flex flex-wrap gap-3">
        {options.map(o => (
          <label key={o} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-xs transition ${value === o ? 'bg-amber-500/20 border border-amber-400/40 text-amber-200' : 'surface-soft border border-amber-500/15 hover:bg-amber-500/10'}`}>
            <input type="radio" checked={value === o} onChange={() => onChange(o)} className="accent-amber-500" />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ====== VIEW (printable) ======
function ServiceRequestView({ request, onClose }: { request: ServiceRequest; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);
  const r = request;
  return (
    <Modal open={true} onClose={onClose} size="xl" title={`📄 درخواست ${r.receiptNumber}`}
      footer={<>
        <button onClick={() => printElement(printRef.current)} className="btn-ghost-gold px-3 py-2 rounded-lg text-sm flex items-center gap-1">
          <I.Print size={13} /> چاپ / PDF
        </button>
        <button onClick={onClose} className="btn-gold px-4 py-2 rounded-lg text-sm">بستن</button>
      </>}>
      <div ref={printRef} className="space-y-3 text-sm">
        <div className="grid sm:grid-cols-3 gap-2">
          <Info label="تاریخ درخواست" value={formatJalali(r.requestDate)} />
          <Info label="شماره رسید" value={r.receiptNumber} />
          <Info label="وضعیت" value={STATUS_LABEL[r.status]} />
          {r.actionType && <Info label="نوع اقدام" value={r.actionType} />}
          {r.serviceType && <Info label="نوع خدمت" value={r.serviceType} />}
          {r.urgency && <Info label="ضرورت" value={r.urgency} />}
          <Info label="نام تجهیز" value={r.equipmentName} />
          <Info label="کد تجهیز" value={r.equipmentCode} />
          <Info label="محل نصب" value={r.installLocation || '—'} />
          <Info label="ساعت/تاریخ خرابی" value={r.faultDateTime ? formatJalali(r.faultDateTime, true) : '—'} />
          <Info label="موجب توقف؟" value={r.causedStop === true ? 'بله' : r.causedStop === false ? 'خیر' : '—'} />
          <Info label="واحد درخواست‌کننده" value={r.requestingUnit || '—'} />
        </div>

        <Box label="شرح خرابی / درخواست خدمت" value={r.faultDescription} />
        {r.additionalInfo && <Box label="اطلاعات تکمیلی" value={r.additionalInfo} />}

        {(r.faultCauseDiagnosis || r.repairMethod) && (
          <div className="border-t border-amber-500/20 pt-3">
            <h5 className="font-bold text-amber-300 mb-2 text-sm">مسئول نت</h5>
            {r.faultCauseDiagnosis && <Box label="تشخیص علت خرابی" value={r.faultCauseDiagnosis} />}
            {r.repairMethod && <Info label="روش رفع خرابی" value={r.repairMethod + (r.externalContractor ? ` — ${r.externalContractor}` : '')} />}
          </div>
        )}

        {r.workDescription && (
          <div className="border-t border-amber-500/20 pt-3">
            <h5 className="font-bold text-amber-300 mb-2 text-sm">شرح اقدام</h5>
            <Box label="شرح کار انجام‌شده" value={r.workDescription} />
            <div className="grid sm:grid-cols-3 gap-2 mt-2">
              {r.startDateTime && <Info label="شروع" value={formatJalali(r.startDateTime, true)} />}
              {r.endDateTime && <Info label="پایان" value={formatJalali(r.endDateTime, true)} />}
              {r.netDuration && <Info label="مدت خالص" value={`${r.netDuration} ساعت`} />}
            </div>
          </div>
        )}

        {r.consumedItems.length > 0 && (
          <div className="border-t border-amber-500/20 pt-3">
            <h5 className="font-bold text-amber-300 mb-2 text-sm">اقلام مصرف‌شده</h5>
            <table className="w-full text-xs">
              <thead className="bg-amber-500/10 text-amber-300">
                <tr><th className="p-2">شرح</th><th>نفر-ساعت/تعداد</th><th>هزینه</th><th>توضیحات</th></tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {r.consumedItems.map((it, i) => (
                  <tr key={i}>
                    <td className="p-2">{it.description}</td>
                    <td className="p-2">{it.qtyOrManHours}</td>
                    <td className="p-2">{it.cost}</td>
                    <td className="p-2">{it.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft rounded-lg p-2.5">
      <div className="text-[10px] text-ink-400">{label}</div>
      <div className="text-sm text-ink-100 mt-0.5">{value}</div>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft rounded-lg p-3">
      <div className="text-[10px] text-amber-300 font-bold mb-1">{label}</div>
      <p className="text-sm text-ink-100 leading-7 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
