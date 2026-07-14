import { useState, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { faNum, formatJalali, downloadCSV } from '../lib/utils';
import { NotificationCenter } from './NotificationCenter';
import { useToast } from '../components/Toast';
import { Modal, ConfirmDialog } from '../components/Modal';
import { ImportWizard } from '../components/ImportWizard';
import { EquipmentImportWizard } from '../components/EquipmentImportWizard';
import { SmartEquipmentImport } from '../components/SmartEquipmentImport';
import { AIVision } from '../components/AIVision';
import { AIInsightCard } from '../components/AIInsightCard';
import { executiveSummary, analyzeEquipment, analyzeWorkOrders, analyzeInventory, analyzePersonnel, analyzePM } from '../lib/ai';
import { LineChart, BarChart } from '../components/Charts';

// Helper: editable field
function CF({ label, value, onChange, disabled, full, textarea, password }: {
  label: string; value: string; onChange: (v: string) => void;
  disabled?: boolean; full?: boolean; textarea?: boolean; password?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2 lg:col-span-3' : ''}>
      <label className="text-[11px] text-ink-300 mb-1 block">{label}</label>
      {textarea ? (
        <textarea className="input-dark min-h-[70px]" value={value} disabled={disabled} onChange={e => onChange(e.target.value)} />
      ) : (
        <input type={password ? 'password' : 'text'} className="input-dark" value={value} disabled={disabled} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

// ============== Suppliers ==============
export function SuppliersPage() {
  const { suppliers, parts, addSupplier, updateSupplier, removeSupplier } = useApp();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<import('../lib/types').Supplier | null>(null);
  const [del, setDel] = useState<import('../lib/types').Supplier | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const toast = useToast();

  const filtered = suppliers.filter(s => !search ||
    s.name.includes(search) || s.contact.includes(search) || s.phone.includes(search));

  const openNew = () => setEditing({
    id: 'sup_' + Math.random().toString(36).slice(2, 10),
    name: '', contact: '', phone: '', email: '', rating: 4.5, leadDays: 7,
  });

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) { toast.push('نام تأمین‌کننده الزامی است', 'error'); return; }
    if (suppliers.some(s => s.id === editing.id)) {
      updateSupplier(editing.id, editing);
      toast.push('تأمین‌کننده به‌روزرسانی شد', 'success');
    } else {
      addSupplier(editing);
      toast.push('تأمین‌کننده جدید اضافه شد', 'success');
    }
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="surface rounded-2xl p-4 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
          <input className="input-dark pr-8 py-2 text-sm" placeholder="جستجو در تأمین‌کنندگان..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <label className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer" title="واردسازی Excel/CSV">
          <I.Upload size={13} /> واردسازی فایل
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={e => { if (e.target.files?.[0]) { setImportFile(e.target.files[0]); e.target.value = ''; } }} />
        </label>
        <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1"
          onClick={() => { downloadCSV(suppliers.map(s => ({ نام: s.name, طرف_حساب: s.contact, تلفن: s.phone, ایمیل: s.email, امتیاز: s.rating, 'لیدتایم (روز)': s.leadDays })), 'suppliers.csv'); toast.push('خروجی دانلود شد'); }}>
          <I.Download size={13} /> خروجی
        </button>
        <button className="btn-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" onClick={openNew}>
          <I.Plus size={13} /> تأمین‌کننده جدید
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="surface rounded-2xl p-10 text-center text-sm text-ink-400">
          <I.Factory size={40} className="mx-auto text-amber-400 mb-2" />
          {search ? 'تأمین‌کننده‌ای با این مشخصات یافت نشد' : 'هنوز تأمین‌کننده‌ای ثبت نشده — روی «تأمین‌کننده جدید» کلیک کنید'}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(s => {
          const supplied = parts.filter(p => p.supplierId === s.id).length;
          return (
            <div key={s.id} className="surface rounded-2xl p-4 group">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-amber-700 flex items-center justify-center font-bold text-ink-900 shrink-0">
                  <I.Factory />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate">{s.name}</h4>
                  <div className="text-[11px] text-ink-400">{s.contact || '—'}</div>
                </div>
                <div className="text-amber-300 font-display text-lg shrink-0">{faNum(s.rating.toFixed(1))}★</div>
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-2"><I.Phone size={11} className="text-amber-400" />{s.phone || '—'}</div>
                <div className="flex items-center gap-2"><I.Mail size={11} className="text-amber-400" />{s.email || '—'}</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="surface-soft rounded-lg p-2 text-center">
                  <div className="text-ink-400">لیدتایم</div>
                  <div className="text-amber-300 font-bold">{faNum(s.leadDays)} روز</div>
                </div>
                <div className="surface-soft rounded-lg p-2 text-center">
                  <div className="text-ink-400">قطعات</div>
                  <div className="text-amber-300 font-bold">{faNum(supplied)}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => setEditing(s)}
                  className="px-2.5 py-1 rounded text-[11px] btn-ghost-gold flex items-center gap-1">
                  <I.Edit size={11} /> ویرایش
                </button>
                <button onClick={() => setDel(s)}
                  className="px-2.5 py-1 rounded text-[11px] border border-rose-400/30 text-rose-300 hover:bg-rose-500/10 flex items-center gap-1">
                  <I.Trash size={11} /> حذف
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editing && (
        <Modal open={true} onClose={() => setEditing(null)}
          title={suppliers.some(s => s.id === editing.id) ? 'ویرایش تأمین‌کننده' : 'افزودن تأمین‌کننده'}
          footer={<>
            <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setEditing(null)}>انصراف</button>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={save}>ذخیره</button>
          </>}>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <SF label="نام شرکت *" value={editing.name} onChange={v => setEditing({ ...editing, name: v })} />
            <SF label="طرف حساب / نماینده" value={editing.contact} onChange={v => setEditing({ ...editing, contact: v })} />
            <SF label="تلفن" value={editing.phone} onChange={v => setEditing({ ...editing, phone: v })} placeholder="۰۲۱..." />
            <SF label="ایمیل" value={editing.email} onChange={v => setEditing({ ...editing, email: v })} placeholder="info@example.ir" />
            <div>
              <label className="text-[11px] text-ink-300 mb-1 block">امتیاز (۰ تا ۵)</label>
              <input type="number" step={0.1} min={0} max={5} className="input-dark"
                value={editing.rating} onChange={e => setEditing({ ...editing, rating: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-[11px] text-ink-300 mb-1 block">لیدتایم (روز)</label>
              <input type="number" min={0} className="input-dark"
                value={editing.leadDays} onChange={e => setEditing({ ...editing, leadDays: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="حذف تأمین‌کننده"
        message={`آیا از حذف «${del?.name}» اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
        onConfirm={() => { if (del) { removeSupplier(del.id); toast.push('تأمین‌کننده حذف شد', 'info'); } }} />

      <ImportWizard file={importFile} onClose={() => setImportFile(null)} />
    </div>
  );
}

function SF({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] text-ink-300 mb-1 block">{label}</label>
      <input className="input-dark" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

// ============== Reports ==============
export function ReportsPage() {
  const { workOrders, equipment, parts, pms, users } = useApp();
  const toast = useToast();
  const [type, setType] = useState<'exec' | 'eq' | 'wo' | 'inv' | 'pm' | 'people'>('exec');

  const trend = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    x: faNum(i + 1), y: Math.round(150 + Math.sin(i / 2) * 40 + Math.random() * 30)
  })), []);

  const reports = [
    { k: 'exec', t: 'اجرایی', d: 'خلاصه مدیریتی' },
    { k: 'eq', t: 'تجهیزات', d: 'سلامت و عملکرد' },
    { k: 'wo', t: 'دستور کار', d: 'آمار و SLA' },
    { k: 'pm', t: 'PM', d: 'انطباق و معوقات' },
    { k: 'inv', t: 'انبار', d: 'موجودی و مصرف' },
    { k: 'people', t: 'پرسنل', d: 'عملکرد و آموزش' },
  ] as const;

  const data: Record<string, Record<string, unknown>[]> = {
    exec: [{ شاخص: 'میانگین سلامت', مقدار: equipment.reduce((s, e) => s + e.healthScore, 0) / equipment.length }],
    eq: equipment.map(e => ({ کد: e.code, نام: e.name, سلامت: e.healthScore, عمر: e.rulDays })),
    wo: workOrders.map(w => ({ شماره: w.number, عنوان: w.title, وضعیت: w.status, هزینه: w.estimatedCost })),
    pm: pms.map(p => ({ نام: p.name, انطباق: p.compliance, سررسید: formatJalali(p.nextDue) })),
    inv: parts.map(p => ({ کد: p.code, نام: p.name, موجودی: p.stock, حداقل: p.min })),
    people: users.map(u => ({ نام: u.name, نقش: u.role, امتیاز: u.performance })),
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 md:grid-cols-6 gap-2">
        {reports.map(r => (
          <button key={r.k} onClick={() => setType(r.k)} className={`surface rounded-xl p-3 text-right transition ${type === r.k ? 'ring-gold' : 'hover:bg-amber-500/5'}`}>
            <div className="font-bold text-sm">{r.t}</div>
            <div className="text-[10px] text-ink-400 mt-0.5">{r.d}</div>
          </button>
        ))}
      </div>

      <div className="surface rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-gold-gradient">گزارش: {reports.find(r => r.k === type)?.t}</h3>
          <div className="flex gap-2">
            <button className="btn-ghost-gold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1" onClick={() => { downloadCSV(data[type], `report_${type}.csv`); toast.push('CSV دانلود شد'); }}>
              <I.Download size={12} /> CSV
            </button>
            <button className="btn-ghost-gold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1" onClick={() => window.print()}>
              <I.Print size={12} /> چاپ / PDF
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="surface-soft rounded-xl p-4">
            <div className="text-[11px] text-ink-300">مجموع رکوردها</div>
            <div className="font-display text-2xl text-gold-gradient mt-1">{faNum(data[type].length)}</div>
          </div>
          <div className="surface-soft rounded-xl p-4">
            <div className="text-[11px] text-ink-300">دوره گزارش</div>
            <div className="font-bold text-sm mt-1">۱۲ ماه گذشته</div>
          </div>
          <div className="surface-soft rounded-xl p-4">
            <div className="text-[11px] text-ink-300">تاریخ تولید</div>
            <div className="font-bold text-sm mt-1">{formatJalali(new Date(), true)}</div>
          </div>
        </div>

        <div className="surface-soft rounded-xl p-3 mb-4">
          <h4 className="text-xs text-amber-300 font-bold mb-2">روند ۱۲ ماه</h4>
          <LineChart data={trend} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-500/5 text-amber-300 text-xs">
              <tr>{data[type][0] && Object.keys(data[type][0]).map(h => <th key={h} className="px-3 py-2 text-right">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {data[type].slice(0, 20).map((r, i) => (
                <tr key={i} className="hover:bg-amber-500/5">
                  {Object.values(r).map((v, j) => <td key={j} className="px-3 py-2">{String(v)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============== AI Hub ==============
export function AIHubPage() {
  const { equipment, workOrders, pms, parts, users } = useApp();
  const [visionOpen, setVisionOpen] = useState(false);

  const all = useMemo(() => [
    ...executiveSummary({ equipment, workOrders, pms, parts, users }),
    ...analyzeWorkOrders(workOrders),
    ...analyzeInventory(parts),
    ...analyzePersonnel(users, workOrders),
    ...analyzePM(pms),
    ...equipment.filter(e => e.healthScore < 70).slice(0, 3).flatMap(e => analyzeEquipment(e, workOrders)),
  ], [equipment, workOrders, pms, parts, users]);

  const byLevel = {
    critical: all.filter(i => i.level === 'critical'),
    warning: all.filter(i => i.level === 'warning'),
    info: all.filter(i => i.level === 'info'),
    success: all.filter(i => i.level === 'success'),
  };

  return (
    <div className="space-y-4">
      <div className="surface rounded-2xl p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-300 to-amber-700 text-ink-900"><I.AI size={28} /></div>
          <div className="flex-1 min-w-[200px]">
            <h2 className="font-display text-xl text-gold-gradient">مرکز هوش مصنوعی بسپارفوم غرب</h2>
            <p className="text-sm text-ink-300">تحلیل‌های اختصاصی برای صنعت تولید فوم پلی‌اورتان</p>
          </div>
          <button onClick={() => setVisionOpen(true)} className="btn-gold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <I.Eye size={16} /> تحلیل تصویری (مثل گوگل لنز)
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <div className="surface-soft rounded-xl p-3">
            <div className="font-display text-2xl text-rose-300">{faNum(byLevel.critical.length)}</div>
            <div className="text-[11px] text-ink-300 mt-1">بحرانی</div>
          </div>
          <div className="surface-soft rounded-xl p-3">
            <div className="font-display text-2xl text-amber-300">{faNum(byLevel.warning.length)}</div>
            <div className="text-[11px] text-ink-300 mt-1">هشدار</div>
          </div>
          <div className="surface-soft rounded-xl p-3">
            <div className="font-display text-2xl text-sky-300">{faNum(byLevel.info.length)}</div>
            <div className="text-[11px] text-ink-300 mt-1">اطلاعاتی</div>
          </div>
          <div className="surface-soft rounded-xl p-3">
            <div className="font-display text-2xl text-emerald-300">{faNum(byLevel.success.length)}</div>
            <div className="text-[11px] text-ink-300 mt-1">مطلوب</div>
          </div>
        </div>
      </div>

      {/* AI Vision feature card */}
      <div className="surface ring-gold rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative grid sm:grid-cols-[1fr_auto] gap-3 items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <I.Eye className="text-amber-400" size={20} />
              <h3 className="font-display text-lg text-gold-gradient">تحلیل تصویری هوشمند</h3>
              <span className="pill bg-amber-500/15 text-amber-200">جدید</span>
            </div>
            <p className="text-sm text-ink-200 leading-7">
              عکس بگیرید یا آپلود کنید — AI تجهیز را شناسایی می‌کند، نشانه‌های خرابی (نشتی، زنگ‌زدگی، سوختگی، فرسایش)
              را تشخیص می‌دهد، علل احتمالی را بررسی می‌کند و راهکار ارائه می‌دهد.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['📸 دوربین زنده', '🖼 آپلود از گالری', '🔍 تشخیص رنگ', '⚡ تحلیل لحظه‌ای', '🎯 راهکار عملی'].map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-200 border border-amber-500/20">{t}</span>
              ))}
            </div>
          </div>
          <button onClick={() => setVisionOpen(true)} className="btn-gold px-6 py-4 rounded-xl text-base flex items-center gap-2 self-stretch sm:self-center">
            <I.Camera size={20} />
            شروع تحلیل
          </button>
        </div>
      </div>

      {(['critical', 'warning', 'info', 'success'] as const).map(lvl => byLevel[lvl].length > 0 && (
        <div key={lvl}>
          <h3 className="font-bold text-base mb-3 text-gold-gradient">
            {lvl === 'critical' ? '🚨 موارد بحرانی' : lvl === 'warning' ? '⚠ هشدارها' : lvl === 'info' ? 'ℹ پیشنهادها' : '✓ نقاط قوت'}
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {byLevel[lvl].map(i => <AIInsightCard key={i.id} insight={i} />)}
          </div>
        </div>
      ))}

      <AIVision open={visionOpen} onClose={() => setVisionOpen(false)} />
    </div>
  );
}

// ============== Notifications ==============
export function NotificationsPage() {
  return <NotificationCenter />;
}

// ============== Excel Repository ==============
export function ExcelRepoPage() {
  const { excelFiles, removeExcel, mappingTemplates, deleteMappingTemplate } = useApp();
  const toast = useToast();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [equipmentFile, setEquipmentFile] = useState<File | null>(null);
  const [smartFile, setSmartFile] = useState<File | null>(null);
  const [queue, setQueue] = useState<File[]>([]);

  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setPendingFile(list[0]);
    setQueue(list.slice(1));
  };

  const handleEquipmentUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setEquipmentFile(files[0]);
  };

  const handleComplete = () => {
    if (queue.length > 0) {
      setPendingFile(queue[0]);
      setQueue(queue.slice(1));
    } else {
      setPendingFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="surface rounded-2xl p-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-300"><I.Folder size={28} /></div>
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-bold text-base text-gold-gradient">انبار فایل‌های اکسل (با واردسازی هوشمند)</h3>
            <p className="text-sm text-ink-300 mt-1">فایل را آپلود کنید — هوش مصنوعی نوع آن را تشخیص می‌دهد و به ماژول مناسب وارد می‌کند.</p>
          </div>
        </div>

        {/* Three main entry points */}
        <div className="grid lg:grid-cols-3 gap-3 mt-4">
          <label className="surface ring-gold rounded-xl p-4 cursor-pointer hover:bg-amber-500/10 transition flex flex-col gap-2 group relative overflow-hidden">
            <div className="absolute -left-4 -top-4 w-20 h-20 rounded-full bg-amber-500/20 blur-2xl" />
            <div className="relative flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-300 to-amber-700 text-ink-900 shrink-0 group-hover:scale-105 transition">
                <I.AI size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <h4 className="font-bold text-sm text-gold-gradient">🤖 شناسنامه هوشمند</h4>
                  <span className="pill bg-emerald-500/15 text-emerald-200 text-[10px]">پیشنهادی</span>
                </div>
                <p className="text-[11px] text-ink-300 leading-5">
                  <strong>برای فایل‌های شناسنامه با ساختار آزاد!</strong>
                  AI خودش فیلدها را پیدا می‌کند — حتی اگر Excel به‌صورت Key-Value یا با Merged Cells باشد.
                </p>
              </div>
            </div>
            <div className="text-[10px] text-amber-300/80 flex flex-wrap gap-1.5 relative">
              <span className="px-1.5 py-0.5 bg-amber-500/10 rounded">✓ Merged Cells</span>
              <span className="px-1.5 py-0.5 bg-amber-500/10 rounded">✓ Key-Value</span>
              <span className="px-1.5 py-0.5 bg-amber-500/10 rounded">✓ Dynamic Fields</span>
              <span className="px-1.5 py-0.5 bg-amber-500/10 rounded">✓ AI Learning</span>
            </div>
            <input type="file" accept=".xlsx,.xls" className="hidden"
              onChange={e => { if (e.target.files?.[0]) { setSmartFile(e.target.files[0]); e.target.value = ''; } }} />
          </label>

          <label className="surface-soft rounded-xl p-4 cursor-pointer hover:bg-amber-500/10 transition flex flex-col gap-2 group border border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-300 shrink-0 group-hover:scale-105 transition">
                <I.Tree size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-amber-200 mb-1">📥 ویزارد جدول‌محور (۷ مرحله‌ای)</h4>
                <p className="text-[11px] text-ink-300 leading-5">
                  مناسب فایل‌هایی که هر <strong>ردیف = یک تجهیز</strong> با ستون‌های مشخص (مثل لیست تجهیزات).
                </p>
              </div>
            </div>
            <div className="text-[10px] text-ink-400">با انتخاب درختچه + Mapping دستی</div>
            <input type="file" accept=".xlsx,.xls,.csv,.ods" className="hidden"
              onChange={e => { handleEquipmentUpload(e.target.files); e.target.value = ''; }} />
          </label>

          <label className="surface-soft rounded-xl p-4 cursor-pointer hover:bg-amber-500/10 transition flex flex-col gap-2 group border border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-300 shrink-0 group-hover:scale-105 transition">
                <I.Folder size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-amber-200 mb-1">📋 واردسازی عمومی</h4>
                <p className="text-[11px] text-ink-300 leading-5">
                  دستور کار، PM، انبار قطعات، پرسنل، تأمین‌کنندگان یا فقط بایگانی فایل.
                </p>
              </div>
            </div>
            <div className="text-[10px] text-ink-400">برای ماژول‌های غیر از تجهیزات</div>
            <input type="file" accept=".xlsx,.xls,.csv,.pdf,.docx,.doc,.odt,.ods,.txt,image/*" multiple className="hidden"
              onChange={e => { handleUpload(e.target.files); e.target.value = ''; }} />
          </label>
        </div>

        {queue.length > 0 && (
          <div className="mt-3 surface-soft rounded-lg p-2 text-xs text-amber-300 flex items-center gap-2">
            <I.Folder size={14} /> {faNum(queue.length)} فایل دیگر در صف انتظار...
          </div>
        )}
      </div>

      {/* Saved mapping templates */}
      {mappingTemplates.length > 0 && (
        <div className="surface rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gold-gradient flex items-center gap-2">
              <I.Spark size={16} /> الگوهای ذخیره‌شده Mapping (یادگیری AI)
            </h3>
            <span className="pill bg-emerald-500/15 text-emerald-200">{faNum(mappingTemplates.length)} الگو</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {mappingTemplates.slice(0, 6).map(t => (
              <div key={t.id} className="surface-soft rounded-lg p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="text-xs font-bold text-amber-200 truncate flex-1">{t.name}</div>
                  <button onClick={() => { deleteMappingTemplate(t.id); toast.push('الگو حذف شد', 'info'); }}
                    className="p-1 rounded hover:bg-rose-500/10 text-rose-300 shrink-0"><I.Trash size={11} /></button>
                </div>
                <div className="text-[10px] text-ink-400">
                  ماژول: {t.target} • {faNum(Object.values(t.mapping).filter(v => v).length)} فیلد مَپ‌شده
                </div>
                <div className="text-[10px] text-amber-300/80 mt-1">
                  استفاده شده: {faNum(t.usageCount)} بار
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-ink-400 mt-2">
            💡 وقتی فایل با ستون‌های مشابه آپلود کنید، الگو خودکار اعمال می‌شود.
          </p>
        </div>
      )}

      {/* Quick guide */}
      <div className="grid sm:grid-cols-4 gap-2">
        {[
          { i: '۱', t: 'بارگذاری', d: 'فایل را آپلود کنید', icon: 'Upload' as const },
          { i: '۲', t: 'تشخیص', d: 'AI ستون‌ها را شناسایی می‌کند', icon: 'Cpu' as const },
          { i: '۳', t: 'انتخاب ماژول', d: 'مقصد را انتخاب کنید', icon: 'Folder' as const },
          { i: '۴', t: 'واردسازی', d: 'با یک کلیک تأیید کنید', icon: 'Check' as const },
        ].map(s => {
          const Icon = I[s.icon];
          return (
            <div key={s.i} className="surface rounded-xl p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full btn-gold flex items-center justify-center font-bold text-sm shrink-0">{s.i}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs flex items-center gap-1"><Icon size={12} className="text-amber-300" />{s.t}</div>
                <div className="text-[10px] text-ink-400 mt-0.5">{s.d}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="surface rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-500/5 text-amber-300 text-xs">
            <tr>
              <th className="px-3 py-3 text-right">نام فایل</th>
              <th className="px-3 py-3 text-right">برگه‌ها</th>
              <th className="px-3 py-3 text-right">حجم</th>
              <th className="px-3 py-3 text-right">نسخه</th>
              <th className="px-3 py-3 text-right">آپلودکننده</th>
              <th className="px-3 py-3 text-right">تاریخ</th>
              <th className="px-3 py-3 text-right">Checksum</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-500/10">
            {excelFiles.map(f => (
              <tr key={f.id} className="hover:bg-amber-500/5">
                <td className="px-3 py-2.5 font-bold">{f.name}</td>
                <td className="px-3 py-2.5 text-xs">{f.sheets.join(' • ')}</td>
                <td className="px-3 py-2.5 text-xs">{faNum((f.size / 1024).toFixed(0))} KB</td>
                <td className="px-3 py-2.5 text-xs"><span className="pill bg-amber-500/15 text-amber-200">v{faNum(f.version)}</span></td>
                <td className="px-3 py-2.5 text-xs">{f.uploadedBy}</td>
                <td className="px-3 py-2.5 text-xs">{formatJalali(f.uploadedAt)}</td>
                <td className="px-3 py-2.5 text-[10px] font-mono text-ink-400 truncate max-w-[120px]">{f.checksum}</td>
                <td className="px-3 py-2.5 text-left">
                  <div className="flex justify-end gap-1">
                    <button className="p-1.5 rounded hover:bg-amber-500/10 text-amber-300" title="پیش‌نمایش"><I.Eye size={13} /></button>
                    <button className="p-1.5 rounded hover:bg-amber-500/10 text-amber-300" title="دانلود"><I.Download size={13} /></button>
                    <button className="p-1.5 rounded hover:bg-rose-500/10 text-rose-300" title="حذف" onClick={() => { removeExcel(f.id); toast.push('فایل حذف شد', 'info'); }}><I.Trash size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {excelFiles.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-ink-400">فایلی موجود نیست</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="surface rounded-2xl p-5">
        <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2"><I.AI className="text-amber-400" /> موتور تشخیص هوشمند</h3>
        <p className="text-sm text-ink-300 leading-7">
          هنگام بارگذاری هر فایل، موتور هوش مصنوعی بسپارفوم غرب به‌صورت خودکار:
        </p>
        <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
          {[
            'ساختار و فیلدهای فایل را شناسایی می‌کند',
            'پیشنهاد ماژول مقصد مناسب (تجهیزات/دستور کار/...)',
            'ستون‌های فایل را به فیلدهای سیستم مَپ می‌کند',
            'اعتبارسنجی داده‌ها قبل از واردسازی',
            'فایل اصلی را با نسخه‌بندی حفظ می‌کند',
            'پشتیبانی از Excel, CSV, PDF, Word, تصویر',
          ].map((s, i) => (
            <li key={i} className="surface-soft rounded-lg p-2.5 flex items-start gap-2"><I.Check className="text-emerald-400 shrink-0 mt-0.5" size={14} /><span>{s}</span></li>
          ))}
        </ul>
      </div>

      <ImportWizard file={pendingFile} onClose={() => setPendingFile(null)} onComplete={handleComplete} />
      <EquipmentImportWizard file={equipmentFile} onClose={() => setEquipmentFile(null)} />
      <SmartEquipmentImport file={smartFile} onClose={() => setSmartFile(null)} />
    </div>
  );
}

// ============== Audit ==============
export function AuditPage() {
  const { audit } = useApp();
  const [search, setSearch] = useState('');
  const filtered = audit.filter(a => !search || a.action.includes(search) || a.user.includes(search) || a.module.includes(search));

  return (
    <div className="space-y-4">
      <div className="surface rounded-2xl p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
          <input className="input-dark pr-8 py-2 text-sm" placeholder="جستجو در لاگ‌ها..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1"
          onClick={() => downloadCSV(audit as unknown as Record<string, unknown>[], 'audit.csv')}>
          <I.Download size={13} /> خروجی
        </button>
      </div>

      <div className="surface rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-500/5 text-amber-300 text-xs">
            <tr>
              <th className="px-3 py-3 text-right">زمان</th>
              <th className="px-3 py-3 text-right">کاربر</th>
              <th className="px-3 py-3 text-right">عمل</th>
              <th className="px-3 py-3 text-right">ماژول</th>
              <th className="px-3 py-3 text-right">هدف</th>
              <th className="px-3 py-3 text-right">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-500/10 max-h-[600px]">
            {filtered.slice(0, 200).map(a => (
              <tr key={a.id} className="hover:bg-amber-500/5">
                <td className="px-3 py-2.5 text-xs text-ink-400">{formatJalali(a.at, true)}</td>
                <td className="px-3 py-2.5 font-bold">{a.user}</td>
                <td className="px-3 py-2.5 text-amber-200">{a.action}</td>
                <td className="px-3 py-2.5 text-xs"><span className="pill bg-amber-500/10 text-amber-200">{a.module}</span></td>
                <td className="px-3 py-2.5 text-xs font-mono text-ink-300">{a.target ?? '—'}</td>
                <td className="px-3 py-2.5 text-xs text-ink-400 font-mono">{a.ip ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="surface rounded-2xl p-5">
        <h4 className="font-bold text-gold-gradient mb-3">آمار فعالیت ۲۴ ساعت اخیر</h4>
        <BarChart data={Array.from({ length: 12 }, (_, i) => ({ label: faNum(i * 2 + 'h'), value: Math.round(5 + Math.random() * 30) }))} />
      </div>
    </div>
  );
}

// ============== Settings ==============
export function SettingsPage() {
  const { currentUser, theme, setTheme, company, updateCompany, changePassword, exportFullBackup, importFullBackup, resetAllData } = useApp();
  const toast = useToast();
  const [editingCompany, setEditingCompany] = useState(company);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const isAdmin = currentUser?.role === 'admin';

  const saveCompany = () => {
    updateCompany(editingCompany);
    toast.push('اطلاعات شرکت ذخیره شد', 'success');
  };

  const doChangePassword = async () => {
    if (!currentUser) return;
    const auth = await import('../lib/auth');
    const v = auth.validatePassword(newPwd);
    if (!v.ok) { toast.push(v.message!, 'error'); return; }
    if (newPwd !== newPwd2) { toast.push('تکرار رمز عبور مطابقت ندارد', 'error'); return; }
    const verify = await auth.verifyPassword(oldPwd, currentUser.passwordHash);
    if (!verify) { toast.push('رمز عبور فعلی نادرست است', 'error'); return; }
    await changePassword(currentUser.id, newPwd);
    toast.push('رمز عبور با موفقیت تغییر یافت', 'success');
    setPwdOpen(false);
    setOldPwd(''); setNewPwd(''); setNewPwd2('');
  };

  const downloadBackup = () => {
    const data = exportFullBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baspar_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.push('پشتیبان دانلود شد', 'success');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importFullBackup(reader.result as string);
      if (ok) toast.push('داده‌ها با موفقیت بازیابی شد', 'success');
      else toast.push('فایل پشتیبان نامعتبر است', 'error');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Company Profile */}
      <div className="surface rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-gold-gradient flex items-center gap-2">
            <I.Factory size={16} /> پروفایل شرکت (اطلاعات بومی شما)
          </h3>
          {isAdmin && <button onClick={saveCompany} className="btn-gold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1"><I.Check size={12} /> ذخیره تغییرات</button>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CF label="نام شرکت (فارسی)" value={editingCompany.name} onChange={v => setEditingCompany({ ...editingCompany, name: v })} disabled={!isAdmin} />
          <CF label="نام انگلیسی" value={editingCompany.nameEn} onChange={v => setEditingCompany({ ...editingCompany, nameEn: v })} disabled={!isAdmin} />
          <CF label="صنعت" value={editingCompany.industry} onChange={v => setEditingCompany({ ...editingCompany, industry: v })} disabled={!isAdmin} />
          <CF label="مدیرعامل" value={editingCompany.ceo} onChange={v => setEditingCompany({ ...editingCompany, ceo: v })} disabled={!isAdmin} />
          <CF label="سال تأسیس" value={editingCompany.established} onChange={v => setEditingCompany({ ...editingCompany, established: v })} disabled={!isAdmin} />
          <CF label="تعداد کارکنان" value={String(editingCompany.employeeCount)} onChange={v => setEditingCompany({ ...editingCompany, employeeCount: +v || 0 })} disabled={!isAdmin} />
          <CF label="تلفن" value={editingCompany.phone} onChange={v => setEditingCompany({ ...editingCompany, phone: v })} disabled={!isAdmin} />
          <CF label="ایمیل" value={editingCompany.email} onChange={v => setEditingCompany({ ...editingCompany, email: v })} disabled={!isAdmin} />
          <CF label="وب‌سایت" value={editingCompany.website} onChange={v => setEditingCompany({ ...editingCompany, website: v })} disabled={!isAdmin} />
          <CF label="آدرس کامل" value={editingCompany.address} onChange={v => setEditingCompany({ ...editingCompany, address: v })} disabled={!isAdmin} full />
          <CF label="کارخانه‌ها (با کاما جدا کنید)" value={editingCompany.factories.join('، ')} onChange={v => setEditingCompany({ ...editingCompany, factories: v.split(/[،,]/).map(s => s.trim()).filter(Boolean) })} disabled={!isAdmin} full />
          <CF label="معرفی / توضیحات" value={editingCompany.description} onChange={v => setEditingCompany({ ...editingCompany, description: v })} disabled={!isAdmin} full textarea />
        </div>
        {!isAdmin && <p className="text-xs text-amber-300/70 mt-3">🔒 ویرایش اطلاعات شرکت فقط در دسترس مدیر سیستم است.</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="surface rounded-2xl p-5">
          <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2"><I.Cog size={16} /> تنظیمات نمایش</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>تم</span>
              <div className="flex rounded-lg overflow-hidden border border-amber-500/25">
                <button onClick={() => setTheme('dark')} className={`px-3 py-1.5 text-xs ${theme === 'dark' ? 'btn-gold' : 'text-amber-300'}`}><I.Moon size={12} className="inline ml-1" /> تیره</button>
                <button onClick={() => setTheme('light')} className={`px-3 py-1.5 text-xs ${theme === 'light' ? 'btn-gold' : 'text-amber-300'}`}><I.Sun size={12} className="inline ml-1" /> روشن</button>
              </div>
            </div>
            <div className="flex items-center justify-between"><span>زبان</span><span className="text-amber-300 font-bold">فارسی (RTL)</span></div>
            <div className="flex items-center justify-between"><span>تقویم</span><span className="text-amber-300 font-bold">شمسی (جلالی)</span></div>
            <div className="flex items-center justify-between"><span>فونت</span><span className="text-amber-300 font-bold">Vazirmatn + Cinzel</span></div>
          </div>
        </div>

        <div className="surface rounded-2xl p-5">
          <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2"><I.Shield size={16} /> حساب کاربری</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 flex items-center justify-center font-bold text-ink-900">{currentUser?.name.charAt(0)}</div>
              <div>
                <div className="font-bold">{currentUser?.name}</div>
                <div className="text-xs text-ink-400">{currentUser?.email}</div>
              </div>
            </div>
            <div className="flex items-center justify-between"><span>نقش</span><span className="pill bg-amber-500/15 text-amber-200">{currentUser?.role}</span></div>
            <div className="flex items-center justify-between"><span>دپارتمان</span><span>{currentUser?.department}</span></div>
            <button onClick={() => setPwdOpen(true)} className="btn-ghost-gold px-3 py-1.5 rounded-lg text-xs w-full mt-2 flex items-center justify-center gap-1">
              <I.Shield size={12} /> تغییر رمز عبور
            </button>
          </div>
        </div>

        <div className="surface rounded-2xl p-5">
          <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2"><I.AI size={16} /> هوش مصنوعی</h3>
          <div className="space-y-2 text-sm">
            {[
              { l: 'تحلیل خودکار تجهیزات', on: true },
              { l: 'پیش‌بینی خرابی', on: true },
              { l: 'تبدیل صوت به متن', on: true },
              { l: 'پیشنهاد PM هوشمند', on: true },
              { l: 'تحلیل ریشه خرابی', on: true },
              { l: 'گزارش اجرایی روزانه', on: true },
            ].map(s => (
              <div key={s.l} className="flex items-center justify-between surface-soft rounded-lg p-2">
                <span>{s.l}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={s.on} className="sr-only peer" />
                  <div className="w-9 h-5 bg-ink-700 peer-checked:bg-amber-500 rounded-full peer transition relative after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition peer-checked:after:translate-x-[-16px]" />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="surface rounded-2xl p-5">
          <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2"><I.Download size={16} /> پشتیبان‌گیری و بازیابی</h3>
          <p className="text-sm text-ink-300 mb-3">داده‌های سیستم به‌صورت محلی در مرورگر ذخیره می‌شوند. به‌صورت منظم پشتیبان تهیه کنید.</p>
          <div className="space-y-2">
            <button className="btn-gold px-3 py-2 rounded-lg text-xs w-full flex items-center justify-center gap-1" onClick={downloadBackup}>
              <I.Download size={12} /> دانلود پشتیبان کامل (JSON)
            </button>
            <label className="btn-ghost-gold px-3 py-2 rounded-lg text-xs w-full flex items-center justify-center gap-1 cursor-pointer">
              <I.Upload size={12} /> بازیابی از فایل پشتیبان
              <input type="file" accept=".json" className="hidden" onChange={e => e.target.files && handleImport(e.target.files[0])} />
            </label>
            {isAdmin && (
              <button className="px-3 py-2 rounded-lg text-xs w-full border border-rose-400/30 text-rose-300 hover:bg-rose-500/10"
                onClick={() => { if (confirm('تمام داده‌ها (شامل کاربران، تجهیزات، دستور کارها) حذف می‌شوند و سیستم به حالت اولیه برمی‌گردد. مطمئنید؟')) resetAllData(); }}>
                <I.Trash size={12} className="inline ml-1" /> بازنشانی کامل سیستم (احتیاط!)
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal open={pwdOpen} onClose={() => setPwdOpen(false)} title="تغییر رمز عبور" size="sm"
        footer={<>
          <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setPwdOpen(false)}>انصراف</button>
          <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={doChangePassword}>تغییر رمز</button>
        </>}>
        <div className="space-y-3 text-sm">
          <CF label="رمز عبور فعلی" value={oldPwd} onChange={setOldPwd} password />
          <CF label="رمز عبور جدید (حداقل ۶ کاراکتر)" value={newPwd} onChange={setNewPwd} password />
          <CF label="تکرار رمز عبور جدید" value={newPwd2} onChange={setNewPwd2} password />
        </div>
      </Modal>

      <div className="surface rounded-2xl p-5">
        <h3 className="font-bold text-gold-gradient mb-3">درباره پلتفرم</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="surface-soft rounded-lg p-3"><div className="text-[11px] text-ink-400">نسخه</div><div className="font-display text-lg text-gold-gradient">v۲.۰</div></div>
          <div className="surface-soft rounded-lg p-3"><div className="text-[11px] text-ink-400">معماری</div><div className="font-bold">React + TS + Tailwind</div></div>
          <div className="surface-soft rounded-lg p-3"><div className="text-[11px] text-ink-400">قابلیت PWA</div><div className="font-bold text-emerald-300">✓ فعال</div></div>
          <div className="surface-soft rounded-lg p-3"><div className="text-[11px] text-ink-400">پشتیبانی RTL</div><div className="font-bold text-emerald-300">✓ کامل</div></div>
        </div>
      </div>
    </div>
  );
}
