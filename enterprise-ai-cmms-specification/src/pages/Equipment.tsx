import { useState, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { faNum, uid, downloadCSV } from '../lib/utils';
import { Modal, ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { Donut } from '../components/Charts';
import { AIInsightCard } from '../components/AIInsightCard';
import { ImportWizard } from '../components/ImportWizard';
import { EquipmentImportWizard } from '../components/EquipmentImportWizard';
import { SmartEquipmentImport } from '../components/SmartEquipmentImport';
import { EquipmentPMSchedule } from '../components/EquipmentPMSchedule';
import { EquipmentHistory } from '../components/EquipmentHistory';
import { analyzeEquipment } from '../lib/ai';
import type { Equipment } from '../lib/types';

export function EquipmentPage() {
  const { equipment, addEquipment, updateEquipment, removeEquipment, workOrders } = useApp();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(equipment.filter(e => e.parentId === null).map(e => e.id)));
  const [selected, setSelected] = useState<Equipment | null>(equipment[0] ?? null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Equipment | null>(null);
  const [confirmDel, setConfirmDel] = useState<Equipment | null>(null);
  const [search, setSearch] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [eqImportFile, setEqImportFile] = useState<File | null>(null);
  const [smartFile, setSmartFile] = useState<File | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditName, setInlineEditName] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const toast = useToast();

  const childrenOf = (pid: string | null) => equipment.filter(e => e.parentId === pid)
    .filter(e => !search || e.name.includes(search) || e.code.includes(search));

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const openAdd = (parentId: string | null) => {
    setEditTarget({
      id: uid('eq'), parentId, code: '', name: '', category: 'تجهیز', department: 'تولید',
      location: 'سالن اصلی', manufacturer: '', model: '', serial: '', year: new Date().getFullYear(),
      purchaseDate: new Date().toISOString().slice(0, 10), purchaseCost: 0, status: 'active',
      criticality: 'medium', healthScore: 90, rulDays: 720,
    });
    setEditOpen(true);
  };

  const openEdit = (eq: Equipment) => { setEditTarget(eq); setEditOpen(true); };

  const save = () => {
    if (!editTarget) return;
    if (!editTarget.code || !editTarget.name) { toast.push('کد و نام الزامی است', 'error'); return; }
    if (equipment.some(e => e.id === editTarget.id)) {
      updateEquipment(editTarget.id, editTarget);
      toast.push('تجهیز به‌روزرسانی شد');
    } else {
      addEquipment(editTarget);
      toast.push('تجهیز جدید اضافه شد');
    }
    setEditOpen(false);
    setSelected(editTarget);
  };

  const aiInsights = useMemo(() => selected ? analyzeEquipment(selected, workOrders) : [], [selected, workOrders]);

  const commitInlineEdit = (eqId: string) => {
    if (inlineEditName.trim()) {
      updateEquipment(eqId, { name: inlineEditName.trim() });
      toast.push('نام تجهیز به‌روزرسانی شد', 'success');
    }
    setInlineEditId(null);
    setInlineEditName('');
  };

  const handleDrop = (targetId: string | null) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null); setDropTargetId(null); return;
    }
    // Prevent dropping a parent into its own child
    const isDescendant = (parentId: string, childId: string): boolean => {
      const child = equipment.find(e => e.id === childId);
      if (!child || !child.parentId) return false;
      if (child.parentId === parentId) return true;
      return isDescendant(parentId, child.parentId);
    };
    if (targetId && isDescendant(draggedId, targetId)) {
      toast.push('نمی‌توان والد را در زیرمجموعه خودش قرار داد', 'error');
      setDraggedId(null); setDropTargetId(null); return;
    }
    updateEquipment(draggedId, { parentId: targetId });
    const dragged = equipment.find(e => e.id === draggedId);
    const target = targetId ? equipment.find(e => e.id === targetId) : null;
    toast.push(`«${dragged?.name}» منتقل شد به ${target ? `«${target.name}»` : 'ریشه'}`, 'success');
    if (targetId) {
      setExpanded(prev => new Set([...prev, targetId]));
    }
    setDraggedId(null); setDropTargetId(null);
  };

  const renderNode = (eq: Equipment, depth = 0) => {
    const kids = childrenOf(eq.id);
    const isExp = expanded.has(eq.id);
    const isSel = selected?.id === eq.id;
    const isCategory = ['کارخانه', 'دپارتمان', 'خط تولید'].includes(eq.category);
    const isEditing = inlineEditId === eq.id;
    const isDragging = draggedId === eq.id;
    const isDropTarget = dropTargetId === eq.id;

    return (
      <div key={eq.id}>
        <div
          draggable={!isEditing}
          onDragStart={(e) => { setDraggedId(eq.id); e.dataTransfer.effectAllowed = 'move'; }}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (draggedId !== eq.id) setDropTargetId(eq.id); }}
          onDragLeave={() => setDropTargetId(null)}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleDrop(eq.id); }}
          onDragEnd={() => { setDraggedId(null); setDropTargetId(null); }}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition group ${
            isSel ? 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/50' :
              isDropTarget ? 'bg-emerald-500/15 ring-1 ring-emerald-400/50' :
                isDragging ? 'opacity-40' :
                  'hover:bg-amber-500/5 text-ink-200'
          } ${!isEditing ? 'cursor-move' : ''}`}
          style={{ paddingRight: 8 + depth * 16 }}
          onClick={() => setSelected(eq)}
        >
          {kids.length > 0 ? (
            <button onClick={(e) => { e.stopPropagation(); toggle(eq.id); }} className="p-0.5 hover:bg-amber-500/10 rounded shrink-0">
              <I.ChevronDown size={14} className={`transition ${isExp ? '' : '-rotate-90'}`} />
            </button>
          ) : <span className="w-5 shrink-0" />}

          <span className={`text-sm shrink-0 ${isCategory ? 'text-amber-300' : 'text-ink-400'}`}>
            {isCategory ? <I.Folder size={14} /> : <I.Cpu size={14} />}
          </span>

          {isEditing ? (
            <input
              autoFocus
              type="text"
              value={inlineEditName}
              onChange={(e) => setInlineEditName(e.target.value)}
              onBlur={() => commitInlineEdit(eq.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitInlineEdit(eq.id);
                if (e.key === 'Escape') { setInlineEditId(null); setInlineEditName(''); }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 input-dark py-1 text-sm"
            />
          ) : (
            <span
              className="text-sm font-medium flex-1 truncate"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setInlineEditId(eq.id);
                setInlineEditName(eq.name);
              }}
              title="دوبار کلیک برای ویرایش نام"
            >
              {eq.name}
            </span>
          )}

          <span className="text-[10px] text-ink-400 font-mono shrink-0">{eq.code}</span>
          <span className={`w-2 h-2 rounded-full shrink-0 ${eq.healthScore >= 80 ? 'bg-emerald-400' : eq.healthScore >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`} />

          {!isEditing && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0">
              <button onClick={(e) => { e.stopPropagation(); setInlineEditId(eq.id); setInlineEditName(eq.name); }}
                className="p-1 hover:bg-amber-500/10 rounded text-amber-300" title="ویرایش سریع نام">
                <I.Edit size={11} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); openAdd(eq.id); }}
                className="p-1 hover:bg-amber-500/10 rounded text-amber-300" title="افزودن زیرمجموعه">
                <I.Plus size={12} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); openEdit(eq); }}
                className="p-1 hover:bg-amber-500/10 rounded text-amber-300" title="ویرایش کامل">
                <I.Cog size={11} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setConfirmDel(eq); }}
                className="p-1 hover:bg-rose-500/10 rounded text-rose-300" title="حذف">
                <I.Trash size={11} />
              </button>
            </div>
          )}
        </div>
        {isExp && kids.map(k => renderNode(k, depth + 1))}
      </div>
    );
  };

  const exportCSV = () => {
    downloadCSV(equipment.map(e => ({
      کد: e.code, نام: e.name, دسته: e.category, دپارتمان: e.department,
      محل_نصب: e.location, سازنده: e.manufacturer, مدل: e.model, سریال: e.serial,
      سال_ساخت: e.year, وضعیت: e.status, بحرانیت: e.criticality,
      سلامت: e.healthScore, 'عمر باقیمانده (روز)': e.rulDays,
      'شماره شناسنامه': e.customFields?.['شماره شناسنامه'] ?? '',
      'کد PM': e.customFields?.['کد PM'] ?? '',
    })), `equipment_full_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.push(`${equipment.length} تجهیز در CSV دانلود شد`, 'success');
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const data = equipment.map(e => ({
        کد: e.code, نام: e.name, دسته: e.category, دپارتمان: e.department,
        محل_نصب: e.location, سازنده: e.manufacturer, مدل: e.model, سریال: e.serial,
        سال_ساخت: e.year, وضعیت: e.status, بحرانیت: e.criticality,
        سلامت: e.healthScore, 'عمر باقیمانده (روز)': e.rulDays,
        'شماره شناسنامه': e.customFields?.['شماره شناسنامه'] ?? '',
        'کد PM': e.customFields?.['کد PM'] ?? '',
        'دوره کالیبراسیون': e.customFields?.['دوره کالیبراسیون'] ?? '',
        'نوع کالیبراسیون': e.customFields?.['نوع کالیبراسیون'] ?? '',
        'سمت مجاز به کار': e.customFields?.['سمت مجاز به کار'] ?? '',
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'تجهیزات');
      XLSX.writeFile(wb, `equipment_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.push(`${equipment.length} تجهیز در Excel دانلود شد`, 'success');
    } catch {
      toast.push('خطا در ساخت Excel — از CSV استفاده کنید', 'error');
    }
  };

  const printList = () => {
    const html = `
      <html dir="rtl"><head><title>لیست کامل تجهیزات</title>
        <style>
          @page { size: A4 landscape; margin: 1cm; }
          body { font-family: Vazirmatn, Tahoma, sans-serif; padding: 16px; color: #111; }
          h1 { text-align: center; color: #b45309; margin-bottom: 4px; }
          .meta { text-align: center; color: #666; font-size: 11px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th { background: #faf3e0; color: #7a4a00; font-weight: bold; padding: 6px; border: 1px solid #ccc; }
          td { padding: 5px 6px; border: 1px solid #ddd; }
          tr:nth-child(even) { background: #fafafa; }
        </style>
      </head><body>
        <h1>📋 لیست کامل تجهیزات کارخانه</h1>
        <div class="meta">گروه صنعتی سلن — مجموع: ${equipment.length} تجهیز — تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</div>
        <table>
          <thead><tr>
            <th>#</th><th>کد</th><th>نام تجهیز</th><th>دسته</th><th>محل نصب</th>
            <th>سازنده</th><th>مدل</th><th>سریال</th><th>سال</th><th>سلامت</th>
            <th>شماره شناسنامه</th><th>کد PM</th>
          </tr></thead>
          <tbody>
            ${equipment.map((e, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${e.code}</td>
                <td><strong>${e.name}</strong></td>
                <td>${e.category}</td>
                <td>${e.location}</td>
                <td>${e.manufacturer}</td>
                <td>${e.model}</td>
                <td>${e.serial}</td>
                <td>${e.year}</td>
                <td>${e.healthScore}/100</td>
                <td>${e.customFields?.['شماره شناسنامه'] ?? '-'}</td>
                <td>${e.customFields?.['کد PM'] ?? '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body></html>`;
    const w = window.open('', '_blank', 'width=1100,height=800');
    if (!w) { toast.push('پاپ-آپ مسدود شده — مرورگر را چک کنید', 'error'); return; }
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  // List-mode filter (used in full list)
  const listFiltered = useMemo(() =>
    equipment
      .filter(e => !['کارخانه', 'دپارتمان', 'گروه صنعتی', 'سایت'].includes(e.category)) // hide group nodes
      .filter(e => !search || e.name.includes(search) || e.code.includes(search) || e.serial.includes(search) || (e.customFields?.['شماره شناسنامه'] ?? '').includes(search))
  , [equipment, search]);

  // ============ LIST MODE — Full-width professional table ============
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="surface rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
              <input className="input-dark pr-8 py-2 text-sm" placeholder="جستجو در نام، کد، سریال، شماره شناسنامه..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-1 rounded-lg overflow-hidden border border-amber-500/25 p-1">
              <button onClick={() => setViewMode('tree')}
                className="px-3 py-1 rounded text-xs flex items-center gap-1 text-amber-300 hover:bg-amber-500/10">
                <I.Tree size={11} /> نمایش درختی
              </button>
              <button className="px-3 py-1 rounded text-xs flex items-center gap-1 btn-gold">
                <I.Folder size={11} /> لیست کامل ({faNum(listFiltered.length)})
              </button>
            </div>
            <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" onClick={exportCSV} title="خروجی CSV">
              <I.Download size={13} /> CSV
            </button>
            <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" onClick={exportToExcel}>
              <I.Doc size={13} /> Excel
            </button>
            <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" onClick={printList}>
              <I.Print size={13} /> چاپ
            </button>
            <button className="btn-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" onClick={() => openAdd(null)}>
              <I.Plus size={13} /> تجهیز جدید
            </button>
          </div>
          <div className="mt-2 text-[11px] text-ink-400">
            نمایش <span className="text-amber-300 font-bold">{faNum(listFiltered.length)}</span> از <span className="text-amber-300">{faNum(equipment.length)}</span> تجهیز
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="surface rounded-xl p-3.5">
            <div className="text-[11px] text-ink-300">مجموع تجهیزات</div>
            <div className="font-display text-2xl text-gold-gradient mt-1">{faNum(equipment.length)}</div>
          </div>
          <div className="surface rounded-xl p-3.5">
            <div className="text-[11px] text-ink-300">بحرانی</div>
            <div className="font-display text-2xl text-rose-300 mt-1">{faNum(equipment.filter(e => e.criticality === 'critical').length)}</div>
          </div>
          <div className="surface rounded-xl p-3.5">
            <div className="text-[11px] text-ink-300">سلامت متوسط</div>
            <div className="font-display text-2xl text-emerald-300 mt-1">{faNum((equipment.reduce((s, e) => s + e.healthScore, 0) / Math.max(equipment.length, 1)).toFixed(0))}/۱۰۰</div>
          </div>
          <div className="surface rounded-xl p-3.5">
            <div className="text-[11px] text-ink-300">نیاز به تعمیر</div>
            <div className="font-display text-2xl text-amber-300 mt-1">{faNum(equipment.filter(e => e.status === 'maintenance').length)}</div>
          </div>
        </div>

        {/* Full equipment table */}
        <div className="surface rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-500/5 text-amber-300 text-xs sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-right">#</th>
                  <th className="px-3 py-3 text-right">کد</th>
                  <th className="px-3 py-3 text-right">نام تجهیز</th>
                  <th className="px-3 py-3 text-right">دسته</th>
                  <th className="px-3 py-3 text-right">محل نصب</th>
                  <th className="px-3 py-3 text-right">سازنده / مدل</th>
                  <th className="px-3 py-3 text-right">سریال</th>
                  <th className="px-3 py-3 text-right">شناسنامه</th>
                  <th className="px-3 py-3 text-right">سلامت</th>
                  <th className="px-3 py-3 text-right">وضعیت</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {listFiltered.length === 0 && (
                  <tr><td colSpan={11} className="text-center py-12 text-sm text-ink-400">
                    تجهیزی با این جستجو یافت نشد
                  </td></tr>
                )}
                {listFiltered.map((eq, i) => (
                  <tr key={eq.id} className="hover:bg-amber-500/5 transition cursor-pointer"
                    onClick={() => { setSelected(eq); setViewMode('tree'); }}>
                    <td className="px-3 py-2.5 text-xs text-ink-400 font-mono">{faNum(i + 1)}</td>
                    <td className="px-3 py-2.5 font-mono text-amber-300 text-xs">{eq.code}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-sm">{eq.name}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs">{eq.category}</td>
                    <td className="px-3 py-2.5 text-xs">{eq.location}</td>
                    <td className="px-3 py-2.5 text-xs">
                      <div>{eq.manufacturer}</div>
                      <div className="text-[10px] text-ink-400">{eq.model}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-mono text-ink-300">{eq.serial}</td>
                    <td className="px-3 py-2.5 text-xs font-mono text-amber-300/80">
                      {eq.customFields?.['شماره شناسنامه'] ?? '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${eq.healthScore >= 80 ? 'bg-emerald-400' : eq.healthScore >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`} />
                        <span className="font-bold text-xs">{faNum(eq.healthScore)}/۱۰۰</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <span className={`pill ${
                        eq.status === 'active' ? 'bg-emerald-500/15 text-emerald-200' :
                        eq.status === 'maintenance' ? 'bg-amber-500/15 text-amber-200' :
                        eq.status === 'inactive' ? 'bg-ink-500/15 text-ink-200' :
                        'bg-rose-500/15 text-rose-200'
                      }`}>
                        {eq.status === 'active' ? 'فعال' : eq.status === 'maintenance' ? 'در تعمیر' : eq.status === 'inactive' ? 'غیرفعال' : 'اسقاط'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-left">
                      <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setSelected(eq); setViewMode('tree'); }} title="مشاهده جزئیات" className="p-1.5 rounded hover:bg-amber-500/10 text-amber-300"><I.Eye size={13} /></button>
                        <button onClick={() => openEdit(eq)} title="ویرایش" className="p-1.5 rounded hover:bg-amber-500/10 text-amber-300"><I.Edit size={13} /></button>
                        <button onClick={() => setConfirmDel(eq)} title="حذف" className="p-1.5 rounded hover:bg-rose-500/10 text-rose-300"><I.Trash size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <Modal open={editOpen} onClose={() => setEditOpen(false)}
          title={equipment.some(e => e.id === editTarget?.id) ? 'ویرایش تجهیز' : 'افزودن تجهیز'}
          footer={<>
            <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setEditOpen(false)}>انصراف</button>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={save}>ذخیره</button>
          </>}>
          {editTarget && <EquipmentForm value={editTarget} onChange={setEditTarget} />}
        </Modal>

        <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)}
          title="حذف تجهیز"
          message={`آیا از حذف «${confirmDel?.name}» و تمام زیرمجموعه‌های آن اطمینان دارید؟`}
          onConfirm={() => { if (confirmDel) { removeEquipment(confirmDel.id); setSelected(null); toast.push('تجهیز حذف شد', 'info'); } }} />

        <ImportWizard file={importFile} onClose={() => setImportFile(null)} />
        <EquipmentImportWizard file={eqImportFile} onClose={() => setEqImportFile(null)} />
        <SmartEquipmentImport file={smartFile} onClose={() => setSmartFile(null)} />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-4">
      {/* Tree */}
      <div className="lg:col-span-4 surface rounded-2xl p-4 max-h-[calc(100vh-180px)] flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
            <input className="input-dark pr-8 py-2 text-sm" placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-gold px-2.5 py-2 rounded-lg" onClick={() => openAdd(null)} title="افزودن گره ریشه"><I.Plus size={14} /></button>
          <label className="btn-gold px-2.5 py-2 rounded-lg cursor-pointer flex items-center gap-1" title="🤖 شناسنامه هوشمند — AI خودش فیلدها را تشخیص می‌دهد (برای فایل‌های شناسنامه با ساختار آزاد)">
            <I.AI size={14} />
            <span className="hidden md:inline text-xs">شناسنامه هوشمند</span>
            <input type="file" accept=".xlsx,.xls" className="hidden"
              onChange={e => { if (e.target.files?.[0]) { setSmartFile(e.target.files[0]); e.target.value = ''; } }} />
          </label>
          <label className="btn-ghost-gold px-2.5 py-2 rounded-lg cursor-pointer flex items-center gap-1" title="ویزارد جدول‌محور (هر ردیف = یک تجهیز)">
            <I.Tree size={14} />
            <span className="hidden md:inline text-xs">ویزارد جدول</span>
            <input type="file" accept=".xlsx,.xls,.csv,.ods" className="hidden"
              onChange={e => { if (e.target.files?.[0]) { setEqImportFile(e.target.files[0]); e.target.value = ''; } }} />
          </label>
          <label className="btn-ghost-gold px-2.5 py-2 rounded-lg cursor-pointer" title="واردسازی عمومی (یک سطح ساده‌تر)">
            <I.Folder size={14} />
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={e => { if (e.target.files?.[0]) { setImportFile(e.target.files[0]); e.target.value = ''; } }} />
          </label>
          <button className="btn-ghost-gold px-2.5 py-2 rounded-lg" onClick={exportCSV} title="خروجی CSV"><I.Download size={14} /></button>
          <button className="btn-ghost-gold px-2.5 py-2 rounded-lg" onClick={exportToExcel} title="خروجی Excel"><I.Doc size={14} /></button>
          <button className="btn-ghost-gold px-2.5 py-2 rounded-lg" onClick={printList} title="چاپ / PDF"><I.Print size={14} /></button>
        </div>

        {/* View mode toggle */}
        <div className="flex gap-1 rounded-lg overflow-hidden border border-amber-500/25 p-1 mb-2">
          <button onClick={() => setViewMode('tree')}
            className={`flex-1 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 ${viewMode === 'tree' ? 'btn-gold' : 'text-amber-300 hover:bg-amber-500/10'}`}>
            <I.Tree size={11} /> درختی
          </button>
          <button onClick={() => setViewMode('list')}
            className="flex-1 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 text-amber-300 hover:bg-amber-500/10">
            <I.Folder size={11} /> لیست کامل ({faNum(equipment.length)})
          </button>
        </div>
        <div className="text-[10px] text-amber-300/70 mb-2 px-1 flex items-center gap-1.5 surface-soft rounded-lg p-1.5">
          <I.Spark size={11} />
          <span>💡 برای ساخت درخت: <strong>درگ کنید</strong> برای جابجایی • <strong>دوبار کلیک</strong> روی نام برای ویرایش سریع</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-0.5"
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); handleDrop(null); }}>
          {childrenOf(null).map(eq => renderNode(eq))}
          {draggedId && (
            <div className="border-2 border-dashed border-emerald-400/40 rounded-lg p-3 mt-2 text-center text-xs text-emerald-300">
              ↓ رها کنید تا به گره ریشه منتقل شود ↓
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-amber-500/10 text-[11px] text-ink-400 flex justify-between">
          <span>مجموع تجهیزات: <span className="text-amber-300 font-bold">{faNum(equipment.length)}</span></span>
          <span>تجهیز بحرانی: <span className="text-rose-300 font-bold">{faNum(equipment.filter(e => e.criticality === 'critical').length)}</span></span>
        </div>
      </div>

      {/* Detail */}
      <div className="lg:col-span-8 space-y-4">
        {selected ? (
          <>
            <div className="surface rounded-2xl p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-300/80">
                    <span className="font-mono">{selected.code}</span>
                    <span>•</span>
                    <span>{selected.category}</span>
                    <span>•</span>
                    <span>{selected.department}</span>
                  </div>
                  <h2 className="font-bold text-xl mt-1 text-gold-gradient">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`pill ${selected.status === 'active' ? 'bg-emerald-500/15 text-emerald-200' :
                      selected.status === 'maintenance' ? 'bg-amber-500/15 text-amber-200' : 'bg-rose-500/15 text-rose-200'}`}>
                      {selected.status === 'active' ? 'فعال' : selected.status === 'maintenance' ? 'در تعمیر' : selected.status === 'inactive' ? 'غیرفعال' : 'اسقاط'}
                    </span>
                    <span className={`pill ${selected.criticality === 'critical' ? 'bg-rose-500/15 text-rose-200' : 'bg-sky-500/15 text-sky-200'}`}>
                      بحرانیت: {selected.criticality === 'critical' ? 'بحرانی' : selected.criticality === 'high' ? 'بالا' : selected.criticality === 'medium' ? 'متوسط' : 'پایین'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost-gold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1" onClick={() => openEdit(selected)}><I.Edit size={13} /> ویرایش</button>
                  <button className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-rose-400/30 text-rose-300 hover:bg-rose-500/10" onClick={() => setConfirmDel(selected)}><I.Trash size={13} /> حذف</button>
                </div>
              </div>

              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Field label="سازنده" value={selected.manufacturer || '—'} />
                <Field label="مدل" value={selected.model || '—'} />
                <Field label="شماره سریال" value={selected.serial || '—'} />
                <Field label="سال ساخت" value={faNum(selected.year)} />
                <Field label="موقعیت" value={selected.location} />
                <Field label="هزینه خرید" value={selected.purchaseCost ? faNum(selected.purchaseCost) + ' ﷼' : '—'} />
              </div>

              <div className="mt-5 grid sm:grid-cols-3 gap-3 items-center">
                <div className="surface-soft rounded-xl p-4 flex flex-col items-center">
                  <Donut value={selected.healthScore} label="سلامت" size={120} color={selected.healthScore >= 80 ? '#34d399' : selected.healthScore >= 60 ? '#fbbf24' : '#fb7185'} />
                </div>
                <div className="surface-soft rounded-xl p-4 text-center">
                  <div className="text-xs text-ink-300">عمر مفید باقی‌مانده</div>
                  <div className="font-display text-3xl text-gold-gradient mt-2">{faNum(selected.rulDays)}</div>
                  <div className="text-xs text-amber-300/80 mt-1">روز (پیش‌بینی هوش مصنوعی)</div>
                </div>
                <div className="surface-soft rounded-xl p-4 text-center">
                  <div className="text-xs text-ink-300">دستور کار مرتبط</div>
                  <div className="font-display text-3xl text-gold-gradient mt-2">{faNum(workOrders.filter(w => w.equipmentId === selected.id).length)}</div>
                  <div className="text-xs text-amber-300/80 mt-1">مجموع تاریخی</div>
                </div>
              </div>

              {/* Extended technical specs */}
              {(selected.capacity || selected.power || selected.voltage || selected.weight) && (
                <div className="mt-5">
                  <h4 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
                    <I.Cog size={12} /> مشخصات فنی
                  </h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {selected.capacity && <SpecCard label="ظرفیت" value={selected.capacity} />}
                    {selected.power && <SpecCard label="توان" value={selected.power} />}
                    {selected.voltage && <SpecCard label="ولتاژ" value={selected.voltage} />}
                    {selected.weight && <SpecCard label="وزن" value={selected.weight} />}
                  </div>
                </div>
              )}

              {/* Custom dynamic fields (extracted from Excel datasheets) */}
              {selected.customFields && Object.keys(selected.customFields).length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
                    <I.Spark size={12} /> فیلدهای تخصصی (از شناسنامه استخراج‌شده)
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {Object.entries(selected.customFields).map(([label, value]) => (
                      <div key={label} className="surface-soft rounded-lg p-2.5 border border-amber-500/15">
                        <div className="text-[10px] text-amber-300/80 font-bold">{label}</div>
                        <div className="text-sm text-ink-100 mt-0.5">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selected.notes && (
                <div className="mt-4 surface-soft rounded-xl p-3">
                  <h4 className="text-xs text-amber-300 font-bold mb-1.5">📝 یادداشت‌ها</h4>
                  <p className="text-sm text-ink-100 leading-7 whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}

              {/* Source file info */}
              {selected.sourceFile && (
                <div className="mt-3 surface-soft rounded-lg p-2 flex items-center gap-2 text-xs">
                  <I.Folder size={12} className="text-amber-400" />
                  <span className="text-ink-300">منبع داده‌ها:</span>
                  <span className="text-amber-200 font-bold">{selected.sourceFile}</span>
                </div>
              )}

              {/* Documents */}
              {selected.documents && selected.documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
                    <I.Doc size={12} /> مدارک و فایل‌های پیوست ({faNum(selected.documents.length)})
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {selected.documents.map(doc => (
                      <a key={doc.id} href={doc.url} download={doc.name}
                        className="surface-soft rounded-lg p-2.5 flex items-center gap-2 hover:bg-amber-500/10 transition">
                        <div className="p-1.5 rounded bg-amber-500/15 text-amber-300"><I.Doc size={14} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate">{doc.name}</div>
                          <div className="text-[10px] text-ink-400">
                            {doc.type} • {faNum((doc.size / 1024).toFixed(0))} KB
                          </div>
                        </div>
                        <I.Download size={12} className="text-amber-300/60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PM Schedule — auto-generated */}
            <EquipmentPMSchedule equipment={selected} />

            {/* Maintenance history — all WO since 1405/01/01 */}
            <EquipmentHistory equipment={selected} />

            <div>
              <h3 className="font-bold text-base mb-3 flex items-center gap-2"><I.AI className="text-amber-400" /> <span className="text-gold-gradient">تحلیل هوش مصنوعی این تجهیز</span></h3>
              <div className="grid md:grid-cols-2 gap-3">
                {aiInsights.map(i => <AIInsightCard key={i.id} insight={i} />)}
              </div>
            </div>
          </>
        ) : (
          <div className="surface rounded-2xl p-10 text-center text-ink-400">یک تجهیز را از درخت انتخاب کنید</div>
        )}
      </div>

      {/* Modals */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}
        title={equipment.some(e => e.id === editTarget?.id) ? 'ویرایش تجهیز' : 'افزودن تجهیز'}
        footer={<>
          <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setEditOpen(false)}>انصراف</button>
          <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={save}>ذخیره</button>
        </>}>
        {editTarget && <EquipmentForm value={editTarget} onChange={setEditTarget} />}
      </Modal>

      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)}
        title="حذف تجهیز"
        message={`آیا از حذف «${confirmDel?.name}» و تمام زیرمجموعه‌های آن اطمینان دارید؟`}
        onConfirm={() => { if (confirmDel) { removeEquipment(confirmDel.id); setSelected(null); toast.push('تجهیز حذف شد', 'info'); } }} />

      <ImportWizard file={importFile} onClose={() => setImportFile(null)} />
      <EquipmentImportWizard file={eqImportFile} onClose={() => setEqImportFile(null)} />
      <SmartEquipmentImport file={smartFile} onClose={() => setSmartFile(null)} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-ink-400">{label}</div>
      <div className="text-sm text-ink-100 mt-0.5">{value}</div>
    </div>
  );
}

function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft rounded-lg p-2.5 border border-amber-500/15">
      <div className="text-[10px] text-amber-300/80">{label}</div>
      <div className="font-display text-base text-gold-gradient mt-0.5">{value}</div>
    </div>
  );
}

function EquipmentForm({ value, onChange }: { value: Equipment; onChange: (v: Equipment) => void }) {
  const u = (patch: Partial<Equipment>) => onChange({ ...value, ...patch });
  return (
    <div className="grid sm:grid-cols-2 gap-3 text-sm">
      <L label="کد تجهیز *"><input className="input-dark" value={value.code} onChange={e => u({ code: e.target.value })} /></L>
      <L label="نام تجهیز *"><input className="input-dark" value={value.name} onChange={e => u({ name: e.target.value })} /></L>
      <L label="دسته"><input className="input-dark" value={value.category} onChange={e => u({ category: e.target.value })} /></L>
      <L label="دپارتمان"><input className="input-dark" value={value.department} onChange={e => u({ department: e.target.value })} /></L>
      <L label="موقعیت"><input className="input-dark" value={value.location} onChange={e => u({ location: e.target.value })} /></L>
      <L label="سازنده"><input className="input-dark" value={value.manufacturer} onChange={e => u({ manufacturer: e.target.value })} /></L>
      <L label="مدل"><input className="input-dark" value={value.model} onChange={e => u({ model: e.target.value })} /></L>
      <L label="شماره سریال"><input className="input-dark" value={value.serial} onChange={e => u({ serial: e.target.value })} /></L>
      <L label="سال ساخت"><input type="number" className="input-dark" value={value.year} onChange={e => u({ year: +e.target.value })} /></L>
      <L label="هزینه خرید (ریال)"><input type="number" className="input-dark" value={value.purchaseCost} onChange={e => u({ purchaseCost: +e.target.value })} /></L>
      <L label="وضعیت">
        <select className="input-dark" value={value.status} onChange={e => u({ status: e.target.value as Equipment['status'] })}>
          <option value="active">فعال</option><option value="maintenance">در تعمیر</option><option value="inactive">غیرفعال</option><option value="scrapped">اسقاط</option>
        </select>
      </L>
      <L label="سطح بحرانیت">
        <select className="input-dark" value={value.criticality} onChange={e => u({ criticality: e.target.value as Equipment['criticality'] })}>
          <option value="critical">بحرانی</option><option value="high">بالا</option><option value="medium">متوسط</option><option value="low">پایین</option>
        </select>
      </L>
      <L label="امتیاز سلامت (۰-۱۰۰)"><input type="number" min={0} max={100} className="input-dark" value={value.healthScore} onChange={e => u({ healthScore: +e.target.value })} /></L>
      <L label="عمر مفید باقی‌مانده (روز)"><input type="number" className="input-dark" value={value.rulDays} onChange={e => u({ rulDays: +e.target.value })} /></L>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[11px] text-ink-300 mb-1 block">{label}</span>{children}</label>;
}
