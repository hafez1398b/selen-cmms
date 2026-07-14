import { useState, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { faNum, uid, downloadCSV } from '../lib/utils';
import { Modal, ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { BarChart } from '../components/Charts';
import { AIInsightCard } from '../components/AIInsightCard';
import { ImportWizard } from '../components/ImportWizard';
import { analyzeInventory } from '../lib/ai';
import type { SparePart } from '../lib/types';

export function InventoryPage() {
  const { parts, addPart, updatePart, removePart, suppliers } = useApp();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<SparePart | null>(null);
  const [del, setDel] = useState<SparePart | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const toast = useToast();

  const filtered = useMemo(() => parts.filter(p =>
    !search || p.name.includes(search) || p.code.includes(search) || p.category.includes(search)
  ), [parts, search]);

  const insights = useMemo(() => analyzeInventory(parts), [parts]);

  const openNew = () => setEditing({
    id: uid('p'), code: '', name: '', category: 'متفرقه', unit: 'عدد', unitCost: 0,
    stock: 0, min: 5, max: 50, warehouse: 'انبار مرکزی', bin: '', supplierId: suppliers[0]?.id,
    consumptionForecast30: 0, consumptionForecast90: 0,
  });

  const save = () => {
    if (!editing) return;
    if (!editing.code || !editing.name) { toast.push('کد و نام الزامی است', 'error'); return; }
    if (parts.some(p => p.id === editing.id)) updatePart(editing.id, editing);
    else addPart(editing);
    toast.push('ذخیره شد');
    setEditing(null);
  };

  const totalValue = parts.reduce((s, p) => s + p.stock * p.unitCost, 0);
  const lowCount = parts.filter(p => p.stock < p.min).length;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-4 gap-3">
        <KPI label="مجموع اقلام" value={faNum(parts.length)} />
        <KPI label="ارزش انبار" value={faNum(totalValue)} suffix=" ﷼" />
        <KPI label="کمبود موجودی" value={faNum(lowCount)} bad />
        <KPI label="پیش‌بینی ۳۰ روز" value={faNum(parts.reduce((s, p) => s + p.consumptionForecast30, 0))} />
      </div>

      <div className="surface rounded-2xl p-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
          <input className="input-dark pr-8 py-2 text-sm" placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1"
          onClick={() => { downloadCSV(parts as unknown as Record<string, unknown>[], 'inventory.csv'); toast.push('خروجی دانلود شد'); }}>
          <I.Download size={13} /> خروجی
        </button>
        <label className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer" title="واردسازی از Excel/CSV">
          <I.Upload size={13} /> واردسازی فایل
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={e => { if (e.target.files?.[0]) { setImportFile(e.target.files[0]); e.target.value = ''; } }} />
        </label>
        <button className="btn-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" onClick={openNew}><I.Plus size={13} /> قطعه جدید</button>
      </div>

      <div className="surface rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-500/5 text-amber-300 text-xs">
              <tr>
                <th className="px-3 py-3 text-right">کد</th>
                <th className="px-3 py-3 text-right">نام</th>
                <th className="px-3 py-3 text-right">دسته</th>
                <th className="px-3 py-3 text-right">انبار / محل</th>
                <th className="px-3 py-3 text-right">موجودی</th>
                <th className="px-3 py-3 text-right">حداقل / حداکثر</th>
                <th className="px-3 py-3 text-right">قیمت واحد</th>
                <th className="px-3 py-3 text-right">پیش‌بینی ۳۰ روز</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {filtered.map(p => {
                const low = p.stock < p.min;
                return (
                  <tr key={p.id} className="hover:bg-amber-500/5">
                    <td className="px-3 py-2.5 font-mono text-amber-300 text-xs">{p.code}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-ink-100">{p.name}</div>
                      <div className="text-[10px] text-ink-400">{p.unit}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs">{p.category}</td>
                    <td className="px-3 py-2.5 text-xs">{p.warehouse} <span className="text-amber-300/70">/ {p.bin}</span></td>
                    <td className={`px-3 py-2.5 font-bold ${low ? 'text-rose-300' : 'text-emerald-300'}`}>{faNum(p.stock)} {low && '⚠'}</td>
                    <td className="px-3 py-2.5 text-xs">{faNum(p.min)} / {faNum(p.max)}</td>
                    <td className="px-3 py-2.5 text-xs">{faNum(p.unitCost)} ﷼</td>
                    <td className="px-3 py-2.5 text-xs">{faNum(p.consumptionForecast30)}</td>
                    <td className="px-3 py-2.5 text-left">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-amber-500/10 text-amber-300" onClick={() => setEditing(p)}><I.Edit size={13} /></button>
                        <button className="p-1.5 rounded hover:bg-rose-500/10 text-rose-300" onClick={() => setDel(p)}><I.Trash size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="surface rounded-2xl p-5">
          <h3 className="font-bold text-base mb-3 text-gold-gradient">پرمصرف‌ترین قطعات (پیش‌بینی ۹۰ روز)</h3>
          <BarChart data={[...parts].sort((a, b) => b.consumptionForecast90 - a.consumptionForecast90).slice(0, 6).map(p => ({ label: p.code.split('-')[0], value: p.consumptionForecast90 }))} />
        </div>
        <div className="surface rounded-2xl p-5">
          <h3 className="font-bold text-base mb-3 text-gold-gradient">قطعات بحرانی (زیر حداقل)</h3>
          <div className="space-y-2">
            {parts.filter(p => p.stock < p.min).map(p => (
              <div key={p.id} className="surface-soft rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-[11px] text-ink-400 font-mono">{p.code}</div>
                </div>
                <div className="text-left">
                  <div className="text-rose-300 font-bold">{faNum(p.stock)} / {faNum(p.min)}</div>
                  <div className="text-[10px] text-ink-400">موجودی / حداقل</div>
                </div>
              </div>
            ))}
            {parts.filter(p => p.stock < p.min).length === 0 && <div className="text-center py-6 text-sm text-emerald-300">✓ همه قطعات بالاتر از حداقل موجودی هستند</div>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-base mb-3 flex items-center gap-2"><I.AI className="text-amber-400" /> <span className="text-gold-gradient">تحلیل هوش مصنوعی انبار</span></h3>
        <div className="grid md:grid-cols-3 gap-3">{insights.map(i => <AIInsightCard key={i.id} insight={i} />)}</div>
      </div>

      {editing && (
        <Modal open={true} onClose={() => setEditing(null)} title={parts.some(p => p.id === editing.id) ? 'ویرایش قطعه' : 'افزودن قطعه'}
          footer={<>
            <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setEditing(null)}>انصراف</button>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={save}>ذخیره</button>
          </>}>
          <PartForm value={editing} onChange={setEditing} suppliers={suppliers} />
        </Modal>
      )}
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="حذف قطعه" message={`«${del?.name}» حذف شود؟`}
        onConfirm={() => { if (del) { removePart(del.id); toast.push('قطعه حذف شد', 'info'); } }} />

      <ImportWizard file={importFile} onClose={() => setImportFile(null)} />
    </div>
  );
}

function KPI({ label, value, suffix, bad }: { label: string; value: string; suffix?: string; bad?: boolean }) {
  return (
    <div className="surface rounded-xl p-4">
      <div className="text-[11px] text-ink-300">{label}</div>
      <div className={`font-display text-2xl mt-1 ${bad ? 'text-rose-300' : 'text-gold-gradient'}`}>
        {value}<span className="text-xs text-amber-300/80">{suffix}</span>
      </div>
    </div>
  );
}

function PartForm({ value, onChange, suppliers }: { value: SparePart; onChange: (v: SparePart) => void; suppliers: { id: string; name: string }[] }) {
  const u = (p: Partial<SparePart>) => onChange({ ...value, ...p });
  return (
    <div className="grid sm:grid-cols-2 gap-3 text-sm">
      <L label="کد *"><input className="input-dark" value={value.code} onChange={e => u({ code: e.target.value })} /></L>
      <L label="نام *"><input className="input-dark" value={value.name} onChange={e => u({ name: e.target.value })} /></L>
      <L label="دسته"><input className="input-dark" value={value.category} onChange={e => u({ category: e.target.value })} /></L>
      <L label="واحد"><input className="input-dark" value={value.unit} onChange={e => u({ unit: e.target.value })} /></L>
      <L label="موجودی"><input type="number" className="input-dark" value={value.stock} onChange={e => u({ stock: +e.target.value })} /></L>
      <L label="قیمت واحد (ریال)"><input type="number" className="input-dark" value={value.unitCost} onChange={e => u({ unitCost: +e.target.value })} /></L>
      <L label="حداقل موجودی"><input type="number" className="input-dark" value={value.min} onChange={e => u({ min: +e.target.value })} /></L>
      <L label="حداکثر موجودی"><input type="number" className="input-dark" value={value.max} onChange={e => u({ max: +e.target.value })} /></L>
      <L label="انبار"><input className="input-dark" value={value.warehouse} onChange={e => u({ warehouse: e.target.value })} /></L>
      <L label="بین/محل"><input className="input-dark" value={value.bin} onChange={e => u({ bin: e.target.value })} /></L>
      <L label="تأمین‌کننده">
        <select className="input-dark" value={value.supplierId ?? ''} onChange={e => u({ supplierId: e.target.value || undefined })}>
          <option value="">—</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </L>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[11px] text-ink-300 mb-1 block">{label}</span>{children}</label>;
}
