import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from './Icon';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { faNum, uid } from '../lib/utils';
import {
  parseFile, parseExcelSheet, autoMapFields, suggestTarget, validateRows,
  IMPORT_TARGETS, type ImportTarget, type ParsedFile,
} from '../lib/importWizard';
import type { Equipment, WorkOrder, PMPlan, SparePart, User, Role, Supplier } from '../lib/types';

interface Props {
  file: File | null;
  onClose: () => void;
  onComplete?: () => void;
  /** Pre-select target (skip "choose target" step) */
  presetTarget?: ImportTarget;
}

type Step = 'analyzing' | 'choose_target' | 'map_fields' | 'preview' | 'importing' | 'done';
type Mode = 'smart' | 'manual';

const FIELD_LABELS: Record<string, string> = {
  code: 'کد', name: 'نام', email: 'ایمیل', phone: 'تلفن', department: 'دپارتمان',
  category: 'دسته', location: 'موقعیت', manufacturer: 'سازنده', model: 'مدل',
  serial: 'سریال', year: 'سال', status: 'وضعیت', priority: 'اولویت',
  criticality: 'بحرانیت', healthScore: 'سلامت', title: 'عنوان', description: 'توضیحات',
  type: 'نوع', unit: 'واحد', unitCost: 'قیمت واحد', stock: 'موجودی',
  min: 'حداقل موجودی', max: 'حداکثر موجودی', warehouse: 'انبار', bin: 'محل',
  role: 'نقش', jobTitle: 'سمت', skills: 'مهارت‌ها', contact: 'طرف حساب',
  rating: 'امتیاز', leadDays: 'لیدتایم', frequency: 'تواتر', taskType: 'نوع کار',
  nextDue: 'سررسید', compliance: 'انطباق', plannedStart: 'شروع برنامه',
  plannedEnd: 'پایان برنامه', estimatedCost: 'هزینه برآورد',
};

export function ImportWizard({ file, onClose, onComplete, presetTarget }: Props) {
  const app = useApp();
  const toast = useToast();
  const [step, setStep] = useState<Step>('analyzing');
  const [mode, setMode] = useState<Mode>('smart');
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [target, setTarget] = useState<ImportTarget | null>(presetTarget ?? null);
  const [mapping, setMapping] = useState<Record<string, string | null>>({});
  const [importedCount, setImportedCount] = useState(0);

  // Reset when file changes
  useEffect(() => {
    if (!file) return;
    setStep('analyzing');
    setParsed(null);
    setTarget(presetTarget ?? null);
    setMapping({});
    setActiveSheet(null);
    setMode('smart');
    (async () => {
      const result = await parseFile(file);
      setParsed(result);
      if (result.sheets && result.sheets.length > 0) {
        // Find which sheet was used (best one)
        setActiveSheet(result.preview?.replace('برگه فعال: ', '') ?? result.sheets[0]);
      }
      // Auto-archive non-tabular files
      if (result.rows.length === 0 && ['pdf', 'docx', 'image', 'text', 'unknown'].includes(result.type)) {
        setTarget('archive');
        setStep('choose_target');
      } else if (presetTarget && presetTarget !== 'archive') {
        // Pre-selected target → skip to mapping
        setMapping(autoMapFields(result.headers, presetTarget));
        setStep('map_fields');
      } else {
        setStep('choose_target');
      }
    })();
  }, [file, presetTarget]);

  // Change sheet handler
  const switchSheet = async (sheetName: string) => {
    if (!file || !parsed) return;
    setActiveSheet(sheetName);
    try {
      const { headers, rows } = await parseExcelSheet(file, sheetName);
      setParsed({ ...parsed, headers, rows, preview: `برگه فعال: ${sheetName}` });
      if (target && target !== 'archive') {
        setMapping(autoMapFields(headers, target));
      }
      toast.push(`برگه «${sheetName}» با ${faNum(rows.length)} ردیف بارگذاری شد`, 'info');
    } catch {
      toast.push('خطا در خواندن برگه', 'error');
    }
  };

  const suggestions = useMemo(() => {
    if (!parsed?.headers || parsed.headers.length === 0) return [];
    return suggestTarget(parsed.headers);
  }, [parsed]);

  const targetInfo = IMPORT_TARGETS.find(t => t.key === target);

  // When target chosen, auto-map immediately
  useEffect(() => {
    if (target && parsed?.headers && parsed.headers.length > 0 && target !== 'archive') {
      setMapping(autoMapFields(parsed.headers, target));
    }
  }, [target, parsed?.headers]);

  const validation = useMemo(() => {
    if (!parsed || !target || target === 'archive') return null;
    return validateRows(parsed.rows, mapping, target);
  }, [parsed, target, mapping]);

  // SMART MODE — auto-proceed after target chosen
  const chooseAndProceed = (newTarget: ImportTarget) => {
    setTarget(newTarget);
    if (newTarget === 'archive') {
      setStep('preview');
      return;
    }
    if (mode === 'smart' && parsed?.headers) {
      // Auto-map and jump to preview
      const m = autoMapFields(parsed.headers, newTarget);
      setMapping(m);
      // Check if at least one field is mapped
      if (Object.values(m).some(v => v)) {
        setTimeout(() => setStep('preview'), 300);
      } else {
        setStep('map_fields');
      }
    } else {
      setStep('map_fields');
    }
  };

  if (!file) return null;

  const archiveFile = () => {
    if (!parsed) return;
    const checksum = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    app.addExcel({
      id: uid('x'), name: file.name, size: file.size, version: 1,
      uploadedBy: app.currentUser?.name ?? 'کاربر',
      uploadedAt: new Date().toISOString(),
      sheets: parsed.sheets ?? ['داده‌ها'],
      checksum,
    });
  };

  const doImport = () => {
    if (!parsed || !target) return;
    setStep('importing');

    setTimeout(() => {
      archiveFile();

      if (target === 'archive') {
        setImportedCount(0);
        setStep('done');
        return;
      }

      let count = 0;
      parsed.rows.forEach(row => {
        // Skip fully-empty rows
        const hasAnyData = Object.values(row).some(v => v && v.trim().length > 0);
        if (!hasAnyData) return;

        const get = (field: string): string => {
          const col = mapping[field];
          return col ? (row[col] ?? '').trim() : '';
        };
        const getNum = (field: string, def = 0): number => {
          const v = get(field);
          if (!v) return def;
          const en = v.replace(/[٬,]/g, '').replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
          const n = parseFloat(en);
          return isNaN(n) ? def : n;
        };

        try {
          if (target === 'equipment') {
            const code = get('code') || `AUTO-${app.equipment.length + count + 1}`;
            const name = get('name') || code;
            const e: Equipment = {
              id: uid('eq'), parentId: null, code, name,
              category: get('category') || 'تجهیز',
              department: get('department') || 'تولید',
              location: get('location') || 'سالن اصلی',
              manufacturer: get('manufacturer') || '-',
              model: get('model') || '-',
              serial: get('serial') || '-',
              year: getNum('year', new Date().getFullYear()),
              purchaseDate: new Date().toISOString().slice(0, 10),
              purchaseCost: 0, status: 'active',
              criticality: (get('criticality') as Equipment['criticality']) || 'medium',
              healthScore: getNum('healthScore', 85),
              rulDays: 720,
            };
            app.addEquipment(e); count++;
          } else if (target === 'workorders') {
            const w: WorkOrder = {
              id: uid('wo'),
              number: `WO-${new Date().getFullYear()}-${String(app.workOrders.length + count + 100).padStart(4, '0')}`,
              title: get('title') || `دستور کار وارد‌شده ${count + 1}`,
              description: get('description') || '-',
              type: (get('type') as WorkOrder['type']) || 'corrective',
              priority: (get('priority') as WorkOrder['priority']) || 'medium',
              status: (get('status') as WorkOrder['status']) || 'draft',
              department: get('department') || 'تولید',
              requestedBy: app.currentUser?.id ?? '',
              assignedTo: [],
              plannedStart: get('plannedStart') || new Date().toISOString(),
              plannedEnd: get('plannedEnd') || new Date(Date.now() + 86400000).toISOString(),
              estimatedCost: getNum('estimatedCost'),
              actualCost: 0, laborHours: 0, partsUsed: [],
              attachmentsBefore: [], attachmentsAfter: [],
              voiceNotes: [], textNotes: [],
              createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            };
            app.addWO(w); count++;
          } else if (target === 'pm') {
            const pm: PMPlan = {
              id: uid('pm'),
              name: get('name') || `برنامه PM وارد‌شده ${count + 1}`,
              equipmentId: app.equipment[0]?.id ?? '',
              frequency: (get('frequency') as PMPlan['frequency']) || 'monthly',
              taskType: (get('taskType') as PMPlan['taskType']) || 'inspection',
              checklist: [{ item: 'بازرسی عمومی', done: false }],
              assignedTo: app.users.find(u => u.role === 'technician')?.id ?? '',
              nextDue: get('nextDue') || new Date(Date.now() + 7 * 86400000).toISOString(),
              compliance: getNum('compliance', 100),
              active: true,
            };
            app.addPM(pm); count++;
          } else if (target === 'inventory') {
            const code = get('code') || `PART-${app.parts.length + count + 1}`;
            const name = get('name') || code;
            const p: SparePart = {
              id: uid('p'), code, name,
              category: get('category') || 'متفرقه',
              unit: get('unit') || 'عدد',
              unitCost: getNum('unitCost'),
              stock: getNum('stock'),
              min: getNum('min', 5),
              max: getNum('max', 50),
              warehouse: get('warehouse') || 'انبار مرکزی',
              bin: get('bin') || '-',
              consumptionForecast30: 0, consumptionForecast90: 0,
            };
            app.addPart(p); count++;
          } else if (target === 'personnel') {
            const idx = app.users.length + count + 1;
            const u: User = {
              id: uid('u'),
              name: get('name') || `کاربر ${idx}`,
              email: get('email') || `user${idx}@basparfoam.ir`,
              role: (get('role') as Role) || 'technician',
              department: get('department') || 'تولید',
              jobTitle: get('jobTitle') || 'کاربر',
              phone: get('phone') || '',
              skills: get('skills').split(/[،,]/).map(s => s.trim()).filter(Boolean),
              certifications: [], performance: 80, active: true,
              joinedAt: new Date().toISOString().slice(0, 10),
              passwordHash: '', mustChangePassword: true, loginProvider: 'password',
            };
            app.addUser(u, 'Baspar@1234'); count++;
          } else if (target === 'suppliers') {
            const s: Supplier = {
              id: uid('sup'),
              name: get('name') || `تأمین‌کننده ${app.suppliers.length + count + 1}`,
              contact: get('contact'),
              phone: get('phone'),
              email: get('email'),
              rating: getNum('rating', 4.5),
              leadDays: getNum('leadDays', 7),
            };
            app.addSupplier(s); count++;
          }
        } catch { /* skip */ }
      });

      setImportedCount(count);
      setStep('done');
      app.logAction(`واردسازی ${faNum(count)} رکورد`, 'انبار اکسل', `${file.name} → ${targetInfo?.label}`);
    }, 500);
  };

  const mappedCount = Object.values(mapping).filter(v => v).length;

  return (
    <Modal open={!!file} onClose={onClose} title={`واردسازی هوشمند — ${file.name}`} size="xl"
      footer={
        <>
          {step === 'choose_target' && target && target !== 'archive' && (
            <>
              <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={onClose}>انصراف</button>
              <button className="btn-gold px-4 py-2 rounded-lg text-sm"
                onClick={() => { setStep('map_fields'); }}>
                ادامه به مَپ ستون‌ها →
              </button>
            </>
          )}
          {step === 'choose_target' && target === 'archive' && (
            <>
              <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={onClose}>انصراف</button>
              <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep('preview')}>
                ادامه →
              </button>
            </>
          )}
          {step === 'map_fields' && (
            <>
              <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep('choose_target')}>← قبلی</button>
              <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1"
                onClick={() => parsed?.headers && target && setMapping(autoMapFields(parsed.headers, target))}>
                <I.Cpu size={12} /> مَپ مجدد خودکار
              </button>
              <button className="btn-gold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                disabled={mappedCount === 0}
                onClick={() => setStep('preview')}>
                پیش‌نمایش ({faNum(mappedCount)} مَپ) ←
              </button>
            </>
          )}
          {step === 'preview' && (
            <>
              <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep(target === 'archive' ? 'choose_target' : 'map_fields')}>← قبلی</button>
              <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={doImport}>
                {target === 'archive' ? '📁 ذخیره در بایگانی' : `✓ واردسازی ${faNum(validation?.validRows ?? 0)} رکورد`}
              </button>
            </>
          )}
          {step === 'done' && (
            <button className="btn-gold px-4 py-2 rounded-lg text-sm"
              onClick={() => { onClose(); onComplete?.(); toast.push(target === 'archive' ? 'فایل بایگانی شد' : `${faNum(importedCount)} رکورد وارد شد`, 'success'); }}>
              پایان
            </button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <Stepper step={step} />

        {step === 'analyzing' && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin"><I.Cpu size={48} className="text-amber-400" /></div>
            <p className="text-sm text-amber-300 mt-4">در حال تحلیل فایل و شناسایی ساختار...</p>
          </div>
        )}

        {/* Step: Choose Target */}
        {step === 'choose_target' && parsed && (
          <div className="space-y-4">
            {/* Mode toggle */}
            <div className="surface ring-gold rounded-xl p-3">
              <div className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
                <I.Spark size={12} /> روش واردسازی
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setMode('smart')}
                  className={`rounded-lg p-3 text-right border transition ${
                    mode === 'smart'
                      ? 'btn-gold border-amber-400'
                      : 'border-amber-500/25 hover:bg-amber-500/5 text-amber-200'
                  }`}>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <I.Cpu size={14} /> 🤖 هوشمند (سریع)
                  </div>
                  <div className={`text-[10px] mt-1 ${mode === 'smart' ? 'text-ink-900' : 'text-ink-400'}`}>
                    AI خودکار مَپ می‌کند و مستقیماً به پیش‌نمایش می‌رود
                  </div>
                </button>
                <button onClick={() => setMode('manual')}
                  className={`rounded-lg p-3 text-right border transition ${
                    mode === 'manual'
                      ? 'btn-gold border-amber-400'
                      : 'border-amber-500/25 hover:bg-amber-500/5 text-amber-200'
                  }`}>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <I.Edit size={14} /> 🎛 دستی (دقیق)
                  </div>
                  <div className={`text-[10px] mt-1 ${mode === 'manual' ? 'text-ink-900' : 'text-ink-400'}`}>
                    خودتان هر ستون را به فیلد متصل می‌کنید (کنترل کامل)
                  </div>
                </button>
              </div>
            </div>

            {/* File summary */}
            <div className="surface-soft rounded-xl p-4">
              <h4 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1.5">
                <I.Doc size={12} /> اطلاعات فایل تحلیل‌شده
              </h4>
              <div className="grid sm:grid-cols-4 gap-2 text-xs">
                <Info label="نوع" value={
                  { csv: 'CSV', excel: 'Excel', pdf: 'PDF', docx: 'Word', text: 'متنی', image: 'تصویر', unknown: 'نامشخص' }[parsed.type]
                } />
                <Info label="حجم" value={`${faNum((file.size / 1024).toFixed(0))} KB`} />
                <Info label="ردیف" value={faNum(parsed.rows.length)} />
                <Info label="ستون" value={faNum(parsed.headers?.length ?? 0)} />
              </div>

              {/* Sheet picker */}
              {parsed.sheets && parsed.sheets.length > 1 && (
                <div className="mt-3">
                  <div className="text-[11px] text-amber-300 mb-1">📑 برگه فعال — برای تغییر کلیک کنید:</div>
                  <div className="flex flex-wrap gap-1">
                    {parsed.sheets.map(s => (
                      <button key={s} onClick={() => switchSheet(s)}
                        className={`text-[10px] px-2.5 py-1 rounded transition ${
                          activeSheet === s
                            ? 'btn-gold'
                            : 'bg-amber-500/10 text-amber-200 border border-amber-500/20 hover:bg-amber-500/20'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {parsed.headers && parsed.headers.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] text-ink-300 mb-1">ستون‌های شناسایی‌شده:</div>
                  <div className="flex flex-wrap gap-1">
                    {parsed.headers.slice(0, 20).map((h, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-200 border border-amber-500/20">{h}</span>
                    ))}
                    {parsed.headers.length > 20 && <span className="text-[10px] text-ink-400">+ {faNum(parsed.headers.length - 20)} ستون</span>}
                  </div>
                </div>
              )}
            </div>

            {/* AI Suggestions */}
            {suggestions.length > 0 && parsed.headers.length > 0 && (
              <div className="surface ring-gold rounded-xl p-4">
                <h4 className="text-xs text-gold-gradient font-bold mb-2 flex items-center gap-1.5">
                  <I.AI size={12} /> پیشنهاد هوش مصنوعی — کلیک کنید تا {mode === 'smart' ? 'به‌صورت خودکار وارد شود' : 'انتخاب شود'}
                </h4>
                <div className="space-y-2">
                  {suggestions.slice(0, 3).map(s => {
                    const info = IMPORT_TARGETS.find(t => t.key === s.target)!;
                    const Icon = I[info.icon as keyof typeof I];
                    return (
                      <button key={s.target} onClick={() => chooseAndProceed(s.target)}
                        className={`w-full text-right surface-soft rounded-lg p-3 flex items-center gap-3 transition hover:bg-amber-500/15 hover:scale-[1.01] ${target === s.target ? 'ring-2 ring-amber-400 bg-amber-500/10' : ''}`}>
                        <Icon className="text-amber-300 shrink-0" size={22} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm flex items-center gap-1.5">
                            {info.label}
                            {mode === 'smart' && <span className="text-[9px] text-emerald-300 font-normal">→ ورود خودکار</span>}
                          </div>
                          <div className="text-[10px] text-ink-400 mt-0.5">{s.reason}</div>
                        </div>
                        <div className="text-left shrink-0">
                          <div className="font-display text-lg text-gold-gradient">{faNum(s.confidence)}٪</div>
                          <div className="text-[9px] text-ink-400">اطمینان</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All targets — manual selection */}
            <div>
              <h4 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1.5">
                <I.Folder size={12} /> یا انتخاب دستی ماژول مقصد
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {IMPORT_TARGETS.map(t => {
                  const Icon = I[t.icon as keyof typeof I];
                  const sel = target === t.key;
                  const isArchive = t.key === 'archive';
                  return (
                    <button key={t.key} onClick={() => chooseAndProceed(t.key)}
                      className={`surface-soft rounded-xl p-3 text-right transition hover:bg-amber-500/10 ${
                        sel ? 'ring-2 ring-amber-400 bg-amber-500/10' : ''
                      } ${isArchive ? 'border border-ink-700' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={isArchive ? 'text-ink-400' : 'text-amber-300'} size={16} />
                        <span className="font-bold text-sm">{t.label}</span>
                        {sel && <I.Check className="text-emerald-400 mr-auto" size={14} />}
                      </div>
                      <p className="text-[10px] text-ink-400 leading-5">{t.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step: Map Fields */}
        {step === 'map_fields' && parsed && targetInfo && target !== 'archive' && (
          <div className="space-y-4">
            <div className="surface-soft rounded-xl p-3 flex items-start gap-2">
              <I.Cpu className="text-amber-400 shrink-0 mt-0.5" size={14} />
              <div className="text-xs text-amber-200 flex-1 leading-6">
                هر فیلد سیستم را به ستون فایل خود متصل کنید. فیلدهای <span className="text-rose-300 font-bold">* الزامی</span> اگر مَپ نشوند، با مقدار پیش‌فرض پر می‌شوند.
                💡 با «مَپ مجدد خودکار» AI را دوباره اجرا کنید.
              </div>
            </div>

            {parsed.headers.length === 0 ? (
              <div className="surface-soft rounded-xl p-6 text-center">
                <I.Alert size={32} className="text-rose-400 mx-auto mb-2" />
                <p className="text-sm text-rose-300 font-bold">ستونی در فایل شناسایی نشد!</p>
                <p className="text-xs text-ink-300 mt-2">
                  ممکن است فایل خالی باشد یا فرمت آن قابل خواندن نباشد.<br />
                  لطفاً مطمئن شوید سطر اول فایل شامل نام ستون‌هاست.
                </p>
                {parsed.sheets && parsed.sheets.length > 1 && (
                  <div className="mt-3">
                    <p className="text-[11px] text-amber-300 mb-2">سعی کنید برگه دیگری انتخاب کنید:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {parsed.sheets.map(s => (
                        <button key={s} onClick={() => switchSheet(s)}
                          className="text-[10px] px-2.5 py-1 rounded btn-ghost-gold">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <SumCard label="فیلدهای سیستم" value={faNum(targetInfo.requiredFields.length + targetInfo.optionalFields.length)} color="amber" />
                  <SumCard label="مَپ‌شده" value={faNum(mappedCount)} color="emerald" />
                  <SumCard label="ستون‌های فایل" value={faNum(parsed.headers.length)} color="sky" />
                </div>

                <div className="space-y-2 max-h-[40vh] overflow-y-auto pl-1">
                  {targetInfo.requiredFields.map(field => (
                    <FieldMapping key={field} field={field} mapping={mapping[field]} headers={parsed.headers}
                      required rows={parsed.rows}
                      onChange={v => setMapping(m => ({ ...m, [field]: v }))} />
                  ))}
                  {targetInfo.optionalFields.map(field => (
                    <FieldMapping key={field} field={field} mapping={mapping[field]} headers={parsed.headers}
                      rows={parsed.rows}
                      onChange={v => setMapping(m => ({ ...m, [field]: v }))} />
                  ))}
                </div>

                {validation && (
                  <div className={`rounded-xl p-3 ${validation.validRows > 0 ? 'bg-emerald-500/10 border border-emerald-400/30' : 'bg-rose-500/10 border border-rose-400/30'}`}>
                    <div className="flex items-center gap-2 text-sm">
                      {validation.validRows > 0
                        ? <I.Check className="text-emerald-400" size={16} />
                        : <I.Alert className="text-rose-400" size={16} />}
                      <span className="font-bold">{faNum(validation.validRows)}</span> رکورد آماده واردسازی
                      {validation.invalidRows > 0 && <span className="text-amber-300">— {faNum(validation.invalidRows)} ردیف خالی نادیده گرفته می‌شود</span>}
                    </div>
                    {validation.warnings.length > 0 && (
                      <ul className="mt-2 space-y-0.5 text-[11px] text-amber-200/80 max-h-24 overflow-y-auto">
                        {validation.warnings.slice(0, 4).map((w, i) => (
                          <li key={i}>⚠ {w.message}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && parsed && targetInfo && (
          <div className="space-y-4">
            {target === 'archive' ? (
              <div className="surface-soft rounded-xl p-6 text-center">
                <I.Folder size={48} className="text-amber-400 mx-auto mb-3" />
                <h4 className="font-bold text-base text-gold-gradient">بایگانی فایل</h4>
                <p className="text-sm text-ink-300 mt-2 leading-7">
                  فایل «{file.name}» در انبار اکسل ذخیره می‌شود.<br />
                  هیچ داده‌ای به ماژول‌های سیستم وارد نمی‌شود.
                </p>
              </div>
            ) : (
              <>
                <div className="surface ring-gold rounded-xl p-3">
                  <h4 className="text-xs text-gold-gradient font-bold mb-2 flex items-center gap-1.5">
                    <I.Check size={12} /> آماده برای واردسازی
                  </h4>
                  <div className="grid sm:grid-cols-3 gap-2 text-xs">
                    <Info label="ماژول مقصد" value={targetInfo.label} />
                    <Info label="رکوردهای معتبر" value={faNum(validation?.validRows ?? 0)} />
                    <Info label="فیلدهای مَپ‌شده" value={`${faNum(mappedCount)} / ${faNum(targetInfo.requiredFields.length + targetInfo.optionalFields.length)}`} />
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-amber-300 font-bold mb-2">پیش‌نمایش ۵ ردیف اول:</h4>
                  <div className="surface-soft rounded-xl overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-amber-500/10 text-amber-300">
                        <tr>
                          {Object.entries(mapping).filter(([, v]) => v).slice(0, 6).map(([k]) => (
                            <th key={k} className="px-2 py-2 text-right whitespace-nowrap">
                              {FIELD_LABELS[k] ?? k}
                              <div className="text-[9px] text-ink-400 font-normal">{mapping[k]}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/10">
                        {parsed.rows.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {Object.entries(mapping).filter(([, v]) => v).slice(0, 6).map(([k, col]) => (
                              <td key={k} className="px-2 py-1.5 text-ink-200 max-w-[150px] truncate">{col ? row[col] : '-'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsed.rows.length > 5 && (
                    <p className="text-[10px] text-ink-400 text-center mt-1">+ {faNum(parsed.rows.length - 5)} ردیف دیگر</p>
                  )}
                </div>

                <div className="surface ring-gold rounded-xl p-3">
                  <p className="text-xs text-amber-200 flex items-start gap-1.5">
                    <I.Check size={11} className="text-emerald-400 mt-0.5 shrink-0" />
                    فایل اصلی نیز در «انبار فایل‌های اکسل» با نسخه‌بندی ذخیره خواهد شد و قابل بازیابی است.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {step === 'importing' && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin"><I.Upload size={48} className="text-amber-400" /></div>
            <p className="text-sm text-amber-300 mt-4">در حال واردسازی داده‌ها...</p>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-8">
            <div className="inline-flex w-20 h-20 rounded-full bg-emerald-500/15 items-center justify-center mb-4">
              <I.Check className="text-emerald-400" size={48} />
            </div>
            <h4 className="font-display text-2xl text-gold-gradient mb-2">عملیات با موفقیت انجام شد</h4>
            <p className="text-sm text-ink-200">
              {target === 'archive'
                ? `فایل «${file.name}» در بایگانی ذخیره شد.`
                : <><span className="font-display text-3xl text-amber-300">{faNum(importedCount)}</span> رکورد جدید به ماژول «{targetInfo?.label}» اضافه شد.</>
              }
            </p>
            <p className="text-xs text-emerald-300 mt-3">✓ فایل اصلی در انبار اکسل ذخیره شد</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { label: string }[] = [
    { label: 'تحلیل' },
    { label: 'انتخاب ماژول' },
    { label: 'مَپ ستون‌ها' },
    { label: 'پیش‌نمایش' },
    { label: 'پایان' },
  ];
  const currentIdx = step === 'analyzing' ? 0 :
    step === 'choose_target' ? 1 :
      step === 'map_fields' ? 2 :
        step === 'preview' ? 3 :
          step === 'importing' || step === 'done' ? 4 : 0;

  return (
    <div className="flex items-center justify-between gap-1 mb-2">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex flex-col items-center gap-1 ${active ? '' : 'opacity-60'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                done ? 'bg-emerald-500 text-white' :
                  active ? 'btn-gold' :
                    'bg-ink-800 text-ink-400 border border-amber-500/20'
              }`}>
                {done ? <I.Check size={12} /> : faNum(i + 1)}
              </div>
              <span className={`text-[9px] whitespace-nowrap ${active ? 'text-amber-300 font-bold' : 'text-ink-400'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${done ? 'bg-emerald-500' : 'bg-amber-500/20'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldMapping({ field, mapping, headers, required, rows, onChange }: {
  field: string; mapping: string | null; headers: string[]; required?: boolean;
  rows?: Record<string, string>[];
  onChange: (v: string | null) => void;
}) {
  // Sample values from selected column
  const samples = mapping && rows
    ? rows.slice(0, 5).map(r => r[mapping]).filter(v => v && v.trim()).slice(0, 2).join(' ، ')
    : null;

  return (
    <div className={`surface-soft rounded-lg p-2.5 flex items-center gap-3 transition ${
      mapping ? 'border-r-2 border-r-emerald-400/60' : required ? 'border-r-2 border-r-rose-400/40' : ''
    }`}>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold flex items-center gap-1 flex-wrap">
          {FIELD_LABELS[field] ?? field}
          <span className="text-[10px] text-ink-400 font-mono">({field})</span>
          {required && <span className="text-rose-300 text-[10px]">* الزامی</span>}
        </div>
        {samples && <div className="text-[10px] text-emerald-300/80 mt-0.5 truncate" title={samples}>نمونه: {samples}</div>}
      </div>
      <I.Chevron size={12} className="text-amber-300/50 rotate-180 shrink-0" />
      <select className="input-dark py-1.5 text-xs w-44 shrink-0" value={mapping ?? ''}
        onChange={e => onChange(e.target.value || null)}>
        <option value="">— انتخاب کنید —</option>
        {headers.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      {mapping
        ? <I.Check className="text-emerald-400 shrink-0" size={14} />
        : <span className="w-3.5 h-3.5 rounded-full border border-ink-600 shrink-0" />}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[10px] text-ink-400">{label}</div>
      <div className="font-bold text-sm text-amber-200 mt-0.5">{value}</div>
    </div>
  );
}

function SumCard({ label, value, color }: { label: string; value: string; color: 'amber' | 'emerald' | 'sky' }) {
  const cls = { amber: 'text-amber-300', emerald: 'text-emerald-300', sky: 'text-sky-300' }[color];
  return (
    <div className="surface-soft rounded-lg p-2 text-center">
      <div className="text-ink-400">{label}</div>
      <div className={`font-display text-base mt-0.5 ${cls}`}>{value}</div>
    </div>
  );
}
