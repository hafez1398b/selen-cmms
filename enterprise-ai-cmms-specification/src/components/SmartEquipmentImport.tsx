import { useState, useEffect } from 'react';
import { useApp } from '../lib/store';
import { I } from './Icon';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { faNum, uid } from '../lib/utils';
import { EquipmentTreePicker } from './EquipmentTreePicker';
import { smartParseExcel, buildEquipmentForms, type EquipmentForm, type SmartParseResult } from '../lib/smartExcelParser';
import type { Equipment, EquipmentDocument } from '../lib/types';

interface Props {
  file: File | null;
  onClose: () => void;
  onComplete?: () => void;
}

type Step = 'parse' | 'review' | 'tree' | 'import' | 'done';

/** Standard system fields with Persian labels */
const SYS_FIELDS: { key: string; label: string }[] = [
  { key: 'name', label: 'نام تجهیز' },
  { key: 'code', label: 'کد تجهیز' },
  { key: 'serial', label: 'شماره سریال' },
  { key: 'manufacturer', label: 'سازنده' },
  { key: 'model', label: 'مدل' },
  { key: 'category', label: 'دسته/نوع' },
  { key: 'department', label: 'دپارتمان' },
  { key: 'location', label: 'محل نصب' },
  { key: 'year', label: 'سال ساخت' },
  { key: 'purchaseDate', label: 'تاریخ خرید/نصب' },
  { key: 'purchaseCost', label: 'هزینه/قیمت' },
  { key: 'capacity', label: 'ظرفیت' },
  { key: 'power', label: 'توان' },
  { key: 'voltage', label: 'ولتاژ' },
  { key: 'current', label: 'جریان' },
  { key: 'frequency', label: 'فرکانس' },
  { key: 'pressure', label: 'فشار' },
  { key: 'temperature', label: 'دما' },
  { key: 'speed', label: 'سرعت' },
  { key: 'weight', label: 'وزن' },
  { key: 'dimensions', label: 'ابعاد' },
  { key: 'standard', label: 'استاندارد' },
  { key: 'supplier', label: 'تأمین‌کننده' },
  { key: 'warrantyEnd', label: 'پایان گارانتی' },
  { key: 'description', label: 'توضیحات' },
];

export function SmartEquipmentImport({ file, onClose, onComplete }: Props) {
  const app = useApp();
  const toast = useToast();
  const [step, setStep] = useState<Step>('parse');
  const [parsed, setParsed] = useState<SmartParseResult | null>(null);
  const [forms, setForms] = useState<EquipmentForm[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [parentId, setParentId] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const [createdEq, setCreatedEq] = useState<Equipment[]>([]);

  useEffect(() => {
    if (!file) return;
    setStep('parse');
    setParsed(null);
    setForms([]);
    setActiveIdx(0);

    smartParseExcel(file).then(result => {
      if (result.equipment.length === 0) {
        toast.push('داده‌ای در فایل یافت نشد', 'error');
        return;
      }
      setParsed(result);
      let builtForms = buildEquipmentForms(result);

      // Apply learned corrections from previous imports
      const learnedRenames = app.mappingTemplates
        .filter(t => t.target === 'equipment')
        .flatMap(t => Object.entries(t.mapping).filter(([, v]) => v).map(([sys, label]) => ({ label: label as string, sys })));

      if (learnedRenames.length > 0) {
        builtForms = builtForms.map(form => {
          const newSystemFields = { ...form.systemFields };
          const newCustom: { label: string; value: string }[] = [];
          for (const cf of form.customFields) {
            const learned = learnedRenames.find(l => l.label.toLowerCase().trim() === cf.label.toLowerCase().trim());
            if (learned && !newSystemFields[learned.sys]) {
              newSystemFields[learned.sys] = cf.value;
            } else {
              newCustom.push(cf);
            }
          }
          return { ...form, systemFields: newSystemFields, customFields: newCustom };
        });
      }

      setForms(builtForms);
      setStep('review');
    }).catch((err) => {
      console.error(err);
      toast.push('خطا در تحلیل فایل', 'error');
    });
  }, [file]);

  if (!file) return null;

  const activeForm = forms[activeIdx];

  const updateField = (formIdx: number, key: string, value: string) => {
    setForms(prev => prev.map((f, i) => i === formIdx ? { ...f, systemFields: { ...f.systemFields, [key]: value } } : f));
  };

  const updateCustomField = (formIdx: number, cfIdx: number, label: string, value: string) => {
    setForms(prev => prev.map((f, i) => {
      if (i !== formIdx) return f;
      const customFields = [...f.customFields];
      customFields[cfIdx] = { label, value };
      return { ...f, customFields };
    }));
  };

  const removeCustomField = (formIdx: number, cfIdx: number) => {
    setForms(prev => prev.map((f, i) => {
      if (i !== formIdx) return f;
      return { ...f, customFields: f.customFields.filter((_, j) => j !== cfIdx) };
    }));
  };

  const addCustomField = (formIdx: number) => {
    setForms(prev => prev.map((f, i) => {
      if (i !== formIdx) return f;
      return { ...f, customFields: [...f.customFields, { label: 'فیلد جدید', value: '' }] };
    }));
  };

  /** Move a custom field to a system field */
  const promoteToSystem = (formIdx: number, cfIdx: number, sysKey: string) => {
    setForms(prev => prev.map((f, i) => {
      if (i !== formIdx) return f;
      const cf = f.customFields[cfIdx];
      if (!cf) return f;

      // Save learning — remember this label maps to this system key
      const learnedTpl = {
        id: uid('tpl'),
        name: `یادگیری: ${cf.label} → ${sysKey}`,
        target: 'equipment' as const,
        fingerprint: `learn_${cf.label.toLowerCase().trim()}`,
        headers: [cf.label],
        mapping: { [sysKey]: cf.label },
        usageCount: 1,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };
      app.saveMappingTemplate(learnedTpl);

      return {
        ...f,
        systemFields: { ...f.systemFields, [sysKey]: cf.value },
        customFields: f.customFields.filter((_, j) => j !== cfIdx),
      };
    }));
    toast.push('فیلد به سامانه منتقل شد و سیستم یاد گرفت', 'success');
  };

  const updateFormName = (formIdx: number, name: string) => {
    setForms(prev => prev.map((f, i) => i === formIdx ? { ...f, name } : f));
  };

  const finalImport = () => {
    setStep('import');

    // Read file as data URL for attachment
    const reader = new FileReader();
    reader.onload = () => {
      const fileDoc: EquipmentDocument = {
        id: uid('doc'),
        name: file.name,
        type: 'datasheet',
        url: reader.result as string,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: app.currentUser?.name ?? 'سیستم',
      };

      setTimeout(() => {
        const created: Equipment[] = [];

        forms.forEach((form, idx) => {
          const sf = form.systemFields;
          const code = sf.code || `${file.name.replace(/\.[^.]+$/, '').slice(0, 8)}-${idx + 1}`;

          // Convert custom fields to record
          const customFieldsRecord: Record<string, string> = {};
          for (const cf of form.customFields) {
            if (cf.label && cf.value) customFieldsRecord[cf.label] = cf.value;
          }

          // Convert tables to notes
          let notesText = sf.description || '';
          if (form.tables.length > 0) {
            notesText += (notesText ? '\n\n' : '') + '📊 جداول پیوست شده در فایل اصلی:\n';
            form.tables.forEach((t, ti) => {
              notesText += `\n  جدول ${faNum(ti + 1)}: ${t.headers.join(' | ')} (${faNum(t.rows.length)} ردیف)\n`;
            });
          }

          // Parse year
          const yearStr = (sf.year || '').replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
          const year = parseInt(yearStr) || new Date().getFullYear();

          const eq: Equipment = {
            id: uid('eq'),
            parentId,
            code,
            name: form.name || sf.name || `تجهیز ${idx + 1}`,
            category: sf.category || 'تجهیز',
            department: sf.department || (parentId ? app.equipment.find(e => e.id === parentId)?.department ?? 'تولید' : 'تولید'),
            location: sf.location || 'سالن اصلی',
            manufacturer: sf.manufacturer || '-',
            model: sf.model || '-',
            serial: sf.serial || '-',
            year,
            purchaseDate: sf.purchaseDate || new Date().toISOString().slice(0, 10),
            purchaseCost: parseFloat(sf.purchaseCost?.replace(/[,٬]/g, '') || '0') || 0,
            status: 'active',
            criticality: 'medium',
            healthScore: 90,
            rulDays: 720,
            capacity: sf.capacity,
            power: sf.power,
            voltage: sf.voltage,
            weight: sf.weight,
            notes: notesText || undefined,
            customFields: Object.keys(customFieldsRecord).length > 0 ? customFieldsRecord : undefined,
            documents: [fileDoc],
            sourceFile: file.name,
          };
          app.addEquipment(eq);
          created.push(eq);
        });

        // Archive file
        app.addExcel({
          id: uid('x'),
          name: file.name,
          size: file.size,
          version: 1,
          uploadedBy: app.currentUser?.name ?? 'کاربر',
          uploadedAt: new Date().toISOString(),
          sheets: parsed?.equipment.map(e => e.sheetName) ?? [],
          checksum: Math.random().toString(36).slice(2, 18),
        });

        app.logAction(`واردسازی هوشمند ${faNum(created.length)} شناسنامه از ${file.name}`, 'تجهیزات', file.name);
        setImportedCount(created.length);
        setCreatedEq(created);
        setStep('done');
      }, 600);
    };
    reader.readAsDataURL(file);
  };

  const detectionStats = forms.reduce(
    (acc, f) => {
      acc.system += Object.keys(f.systemFields).filter(k => f.systemFields[k]).length;
      acc.custom += f.customFields.length;
      acc.tables += f.tables.length;
      return acc;
    },
    { system: 0, custom: 0, tables: 0 }
  );

  return (
    <Modal open={!!file} onClose={onClose}
      title="🤖 واردسازی هوشمند شناسنامه تجهیزات"
      size="xl"
      footer={renderFooter()}
    >
      <div className="space-y-4">
        <Stepper step={step} />

        {step === 'parse' && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin"><I.Cpu size={48} className="text-amber-400" /></div>
            <p className="text-sm text-amber-300 mt-4">در حال تحلیل هوشمند فایل...</p>
            <p className="text-[11px] text-ink-400 mt-1">شناسایی ساختار، Merged Cells، جداول و فیلدها</p>
          </div>
        )}

        {step === 'review' && parsed && activeForm && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              <Stat label="تجهیز شناسایی‌شده" value={faNum(forms.length)} icon="Cpu" />
              <Stat label="فیلدهای سیستمی" value={faNum(detectionStats.system)} icon="Check" />
              <Stat label="فیلدهای سفارشی" value={faNum(detectionStats.custom)} icon="Spark" />
              <Stat label="جداول" value={faNum(detectionStats.tables)} icon="Doc" />
            </div>

            <div className="surface ring-gold rounded-xl p-3 flex items-start gap-2">
              <I.AI className="text-amber-400 shrink-0 mt-0.5" size={16} />
              <div className="text-xs text-amber-200 leading-6">
                <strong>{faNum(forms.length)} شناسنامه تجهیز</strong> از فایل استخراج شد.
                فیلدهای استاندارد به‌صورت خودکار شناسایی شده‌اند.
                فیلدهای ناشناخته در بخش «فیلدهای سفارشی» قرار گرفته‌اند که می‌توانید آن‌ها را ویرایش یا به سیستم اضافه کنید.
              </div>
            </div>

            {/* Equipment tabs */}
            {forms.length > 1 && (
              <div className="flex gap-1 flex-wrap surface-soft p-1.5 rounded-lg max-h-24 overflow-y-auto">
                {forms.map((f, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)}
                    className={`px-3 py-1.5 rounded text-xs flex items-center gap-1.5 ${i === activeIdx ? 'btn-gold' : 'text-amber-200 hover:bg-amber-500/10'}`}>
                    <span>📋 {f.name.slice(0, 25)}</span>
                    <span className="text-[9px] opacity-70">({faNum(Object.keys(f.systemFields).filter(k => f.systemFields[k]).length + f.customFields.length)} فیلد)</span>
                  </button>
                ))}
              </div>
            )}

            {/* Active equipment form */}
            <div className="surface rounded-xl p-4">
              <div className="mb-3">
                <label className="text-[11px] text-amber-300 mb-1 block">نام شناسنامه تجهیز:</label>
                <input className="input-dark text-base font-bold" value={activeForm.name}
                  onChange={e => updateFormName(activeIdx, e.target.value)} />
                <div className="text-[10px] text-ink-400 mt-1">📑 منبع: برگه «{activeForm.sourceSheet}»</div>
              </div>

              {/* System fields */}
              <h4 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
                <I.Check size={12} /> فیلدهای سامانه (شناسایی‌شده توسط AI)
              </h4>
              <div className="grid sm:grid-cols-2 gap-2 mb-4">
                {SYS_FIELDS.map(sf => (
                  <div key={sf.key} className="surface-soft rounded-lg p-2">
                    <label className="text-[10px] text-ink-400 mb-1 block flex items-center justify-between">
                      <span>{sf.label}</span>
                      <span className="font-mono text-[9px] text-amber-300/60">{sf.key}</span>
                    </label>
                    <input className="input-dark py-1.5 text-xs"
                      value={activeForm.systemFields[sf.key] ?? ''}
                      onChange={e => updateField(activeIdx, sf.key, e.target.value)}
                      placeholder="-" />
                  </div>
                ))}
              </div>

              {/* Custom (Dynamic) fields */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <I.Spark size={12} /> فیلدهای سفارشی (Dynamic) — استخراج‌شده از فایل
                </h4>
                <button onClick={() => addCustomField(activeIdx)}
                  className="btn-ghost-gold px-2 py-1 rounded text-[11px] flex items-center gap-1">
                  <I.Plus size={11} /> فیلد جدید
                </button>
              </div>

              {activeForm.customFields.length === 0 ? (
                <div className="surface-soft rounded-lg p-4 text-center text-[11px] text-ink-400">
                  هیچ فیلد سفارشی شناسایی نشد — همه فیلدها به‌صورت استاندارد مَپ شدند
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {activeForm.customFields.map((cf, ci) => (
                    <div key={ci} className="surface-soft rounded-lg p-2 flex items-center gap-2">
                      <input className="input-dark py-1 text-xs w-40 shrink-0 font-bold text-amber-200"
                        value={cf.label}
                        onChange={e => updateCustomField(activeIdx, ci, e.target.value, cf.value)}
                        placeholder="نام فیلد" />
                      <span className="text-amber-300/40 shrink-0">:</span>
                      <input className="input-dark py-1 text-xs flex-1"
                        value={cf.value}
                        onChange={e => updateCustomField(activeIdx, ci, cf.label, e.target.value)}
                        placeholder="مقدار" />
                      {/* Promote to system field */}
                      <select className="input-dark py-1 text-[10px] w-24 shrink-0"
                        value=""
                        onChange={e => e.target.value && promoteToSystem(activeIdx, ci, e.target.value)}>
                        <option value="">↑ تبدیل به...</option>
                        {SYS_FIELDS.filter(s => !activeForm.systemFields[s.key]).map(s => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                      <button onClick={() => removeCustomField(activeIdx, ci)}
                        className="p-1 rounded hover:bg-rose-500/10 text-rose-300 shrink-0">
                        <I.Trash size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tables found */}
              {activeForm.tables.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
                    <I.Doc size={12} /> جداول شناسایی‌شده ({faNum(activeForm.tables.length)})
                  </h4>
                  <div className="space-y-2">
                    {activeForm.tables.map((t, ti) => (
                      <details key={ti} className="surface-soft rounded-lg p-2">
                        <summary className="text-xs cursor-pointer text-amber-200 font-bold">
                          📋 جدول {faNum(ti + 1)} — {faNum(t.rows.length)} ردیف، {faNum(t.headers.length)} ستون
                        </summary>
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full text-[11px]">
                            <thead className="bg-amber-500/10 text-amber-300">
                              <tr>
                                {t.headers.map((h, i) => <th key={i} className="px-2 py-1 text-right">{h}</th>)}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-500/10">
                              {t.rows.slice(0, 10).map((row, ri) => (
                                <tr key={ri}>
                                  {row.map((cell, ci) => <td key={ci} className="px-2 py-1 text-ink-200">{cell}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {t.rows.length > 10 && (
                            <p className="text-[10px] text-ink-400 text-center mt-1">
                              + {faNum(t.rows.length - 10)} ردیف دیگر (در یادداشت‌های تجهیز ذخیره می‌شود)
                            </p>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'tree' && (
          <div className="space-y-4">
            <div className="surface-soft rounded-xl p-3">
              <h4 className="text-sm font-bold text-gold-gradient mb-1 flex items-center gap-1.5">
                <I.Tree size={14} /> انتخاب محل قرارگیری در درختچه تجهیزات
              </h4>
              <p className="text-xs text-ink-300">
                <strong>{faNum(forms.length)} شناسنامه تجهیز</strong> در این محل ذخیره می‌شوند. گره والد را انتخاب کنید یا گره جدید بسازید.
              </p>
            </div>

            <EquipmentTreePicker selectedId={parentId} onSelect={setParentId} />
          </div>
        )}

        {step === 'import' && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin"><I.Upload size={48} className="text-amber-400" /></div>
            <p className="text-sm text-amber-300 mt-4">در حال ساخت شناسنامه تجهیزات...</p>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-6">
            <div className="inline-flex w-20 h-20 rounded-full bg-emerald-500/15 items-center justify-center mb-4">
              <I.Check className="text-emerald-400" size={48} />
            </div>
            <h4 className="font-display text-2xl text-gold-gradient mb-2">واردسازی موفق!</h4>
            <p className="text-sm text-ink-200">
              <span className="font-display text-3xl text-amber-300">{faNum(importedCount)}</span> شناسنامه تجهیز با موفقیت ساخته شد
              {parentId && <> در «{app.equipment.find(e => e.id === parentId)?.name}»</>}.
            </p>

            {createdEq.length > 0 && (
              <div className="surface-soft rounded-xl p-3 mt-4 text-right max-h-40 overflow-y-auto">
                <ul className="text-[11px] space-y-0.5">
                  {createdEq.slice(0, 15).map(e => (
                    <li key={e.id} className="flex items-center gap-2">
                      <I.Cpu size={10} className="text-amber-300" />
                      <span className="font-mono text-amber-400">{e.code}</span>
                      <span>—</span>
                      <span className="font-bold">{e.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 text-xs space-y-1 text-emerald-300">
              <div>✓ فایل اصلی به‌عنوان مدرک هر تجهیز پیوست شد</div>
              <div>✓ فایل در «انبار اکسل» با نسخه‌بندی ذخیره شد</div>
              <div>✓ سیستم اصلاحات شما را یاد گرفت — فایل‌های مشابه آینده خودکار پر می‌شوند</div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );

  function renderFooter() {
    if (step === 'review') {
      return (
        <>
          <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={onClose}>انصراف</button>
          <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep('tree')}>
            ← انتخاب محل
          </button>
        </>
      );
    }
    if (step === 'tree') {
      return (
        <>
          <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep('review')}>← قبلی</button>
          <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={finalImport}>
            <I.Check size={14} className="inline ml-1" /> ثبت {faNum(forms.length)} شناسنامه
          </button>
        </>
      );
    }
    if (step === 'done') {
      return (
        <button className="btn-gold px-4 py-2 rounded-lg text-sm"
          onClick={() => { onClose(); onComplete?.(); toast.push(`${faNum(importedCount)} شناسنامه اضافه شد`, 'success'); }}>
          پایان
        </button>
      );
    }
    return null;
  }
}

function Stepper({ step }: { step: Step }) {
  const steps: { k: Step; label: string }[] = [
    { k: 'parse', label: 'تحلیل AI' },
    { k: 'review', label: 'بازبینی فیلدها' },
    { k: 'tree', label: 'انتخاب محل' },
    { k: 'done', label: 'پایان' },
  ];
  const order = ['parse', 'review', 'tree', 'import', 'done'];
  const currentIdx = order.indexOf(step);
  return (
    <div className="flex items-center justify-between gap-1 mb-2">
      {steps.map((s, i) => {
        const sIdx = order.indexOf(s.k);
        const done = sIdx < currentIdx;
        const active = sIdx === currentIdx || (s.k === 'done' && step === 'import');
        return (
          <div key={s.k} className="flex items-center flex-1">
            <div className={`flex flex-col items-center gap-0.5 ${active ? '' : 'opacity-60'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-emerald-500 text-white' : active ? 'btn-gold' : 'bg-ink-800 text-ink-400 border border-amber-500/20'}`}>
                {done ? <I.Check size={11} /> : faNum(i + 1)}
              </div>
              <span className={`text-[9px] whitespace-nowrap ${active ? 'text-amber-300 font-bold' : 'text-ink-400'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px mx-1 ${done ? 'bg-emerald-500' : 'bg-amber-500/20'}`} />}
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: keyof typeof I }) {
  const Icon = I[icon];
  return (
    <div className="surface rounded-xl p-3 flex items-center gap-2">
      <div className="p-2 rounded-lg bg-amber-500/15 text-amber-300"><Icon size={14} /></div>
      <div>
        <div className="text-[10px] text-ink-400">{label}</div>
        <div className="font-display text-base text-gold-gradient">{value}</div>
      </div>
    </div>
  );
}
