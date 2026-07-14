import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from './Icon';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { faNum, uid } from '../lib/utils';
import { EquipmentTreePicker } from './EquipmentTreePicker';
import * as XLSX from 'xlsx';
import type { Equipment, EquipmentDocument, MappingTemplate } from '../lib/types';

interface Props {
  file: File | null;
  onClose: () => void;
  onComplete?: () => void;
}

type Step = 'parse' | 'tree' | 'analyze' | 'mapping' | 'edit_data' | 'validate' | 'import' | 'done';

interface SheetData {
  name: string;
  headers: string[];
  rows: Record<string, string>[];
  mapping: Record<string, string | null>;
  /** True if user confirmed (or chose to apply default) */
  confirmed: boolean;
  /** Detected fingerprint for template matching */
  fingerprint: string;
}

// All equipment fields (system fields)
const EQ_FIELDS: { key: string; label: string; required?: boolean; type: 'text' | 'number' | 'date' | 'enum'; options?: string[] }[] = [
  { key: 'code', label: 'کد تجهیز', required: true, type: 'text' },
  { key: 'name', label: 'نام تجهیز', required: true, type: 'text' },
  { key: 'category', label: 'دسته/نوع', type: 'text' },
  { key: 'department', label: 'دپارتمان', type: 'text' },
  { key: 'location', label: 'محل نصب', type: 'text' },
  { key: 'manufacturer', label: 'سازنده', type: 'text' },
  { key: 'model', label: 'مدل', type: 'text' },
  { key: 'serial', label: 'شماره سریال', type: 'text' },
  { key: 'year', label: 'سال ساخت', type: 'number' },
  { key: 'purchaseDate', label: 'تاریخ خرید/نصب', type: 'date' },
  { key: 'purchaseCost', label: 'هزینه خرید', type: 'number' },
  { key: 'capacity', label: 'ظرفیت', type: 'text' },
  { key: 'power', label: 'توان', type: 'text' },
  { key: 'voltage', label: 'ولتاژ', type: 'text' },
  { key: 'weight', label: 'وزن', type: 'text' },
  { key: 'status', label: 'وضعیت', type: 'enum', options: ['active', 'maintenance', 'inactive', 'scrapped'] },
  { key: 'criticality', label: 'بحرانیت', type: 'enum', options: ['critical', 'high', 'medium', 'low'] },
  { key: 'healthScore', label: 'امتیاز سلامت', type: 'number' },
  { key: 'notes', label: 'یادداشت‌ها', type: 'text' },
];

// Synonyms for AI mapping
const SYNONYMS: Record<string, string[]> = {
  code: ['code', 'id', 'no', 'no.', 'number', 'sku', 'asset code', 'tag', 'کد', 'شناسه', 'شماره', 'تگ'],
  name: ['name', 'title', 'asset name', 'equipment', 'item', 'description', 'نام', 'عنوان', 'تجهیز'],
  category: ['category', 'type', 'group', 'class', 'kind', 'دسته', 'نوع', 'گروه'],
  department: ['department', 'dept', 'section', 'unit', 'دپارتمان', 'بخش', 'واحد'],
  location: ['location', 'place', 'area', 'site', 'محل', 'مکان', 'موقعیت', 'محل نصب'],
  manufacturer: ['manufacturer', 'brand', 'maker', 'vendor', 'سازنده', 'تولیدکننده', 'برند'],
  model: ['model', 'مدل'],
  serial: ['serial', 'sn', 'serial number', 'سریال', 'شماره سریال'],
  year: ['year', 'manufactured', 'built', 'سال', 'سال ساخت'],
  purchaseDate: ['date', 'installation date', 'install', 'purchased', 'تاریخ', 'تاریخ نصب', 'تاریخ خرید'],
  purchaseCost: ['cost', 'price', 'value', 'هزینه', 'قیمت', 'بها'],
  capacity: ['capacity', 'ظرفیت'],
  power: ['power', 'kw', 'hp', 'توان', 'قدرت'],
  voltage: ['voltage', 'v', 'volts', 'ولتاژ', 'ولت'],
  weight: ['weight', 'kg', 'وزن', 'kilogram'],
  status: ['status', 'state', 'وضعیت', 'حالت'],
  criticality: ['criticality', 'critical', 'بحرانیت', 'حساسیت', 'اهمیت'],
  healthScore: ['health', 'condition', 'سلامت', 'وضعیت سلامت'],
  notes: ['notes', 'note', 'remarks', 'comment', 'یادداشت', 'توضیحات'],
};

function norm(s: string): string {
  if (!s) return '';
  return s.toLowerCase().trim()
    .replace(/[\s_\-\.\/\\،,;:()«»\[\]"'`*#]+/g, '')
    .replace(/[يی]/g, 'ی').replace(/[كک]/g, 'ک').replace(/ة/g, 'ه');
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  if (a.includes(b) || b.includes(a)) return 0.9;
  const setA = new Set(a); const setB = new Set(b);
  let common = 0;
  for (const c of setA) if (setB.has(c)) common++;
  return common / Math.max(setA.size, setB.size);
}

function autoMap(headers: string[], existingTemplate?: Record<string, string | null>): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  const used = new Set<string>();
  const normH = headers.map(h => ({ raw: h, n: norm(h) }));

  // If template exists, use it first
  if (existingTemplate) {
    for (const [field, col] of Object.entries(existingTemplate)) {
      if (col && headers.includes(col)) {
        result[field] = col;
        used.add(col);
      }
    }
  }

  for (const f of EQ_FIELDS) {
    if (result[f.key]) continue;
    const syns = (SYNONYMS[f.key] ?? [f.key]).map(norm);
    // Pass 1: exact
    let matched: string | null = null;
    for (const { raw, n } of normH) {
      if (used.has(raw)) continue;
      if (syns.includes(n)) { matched = raw; break; }
    }
    // Pass 2: substring
    if (!matched) {
      for (const { raw, n } of normH) {
        if (used.has(raw)) continue;
        for (const syn of syns) {
          if (syn.length < 2) continue;
          if (n.includes(syn) || syn.includes(n)) { matched = raw; break; }
        }
        if (matched) break;
      }
    }
    // Pass 3: fuzzy
    if (!matched) {
      let best = 0;
      for (const { raw, n } of normH) {
        if (used.has(raw)) continue;
        for (const syn of syns) {
          const s = similarity(n, syn);
          if (s > best && s >= 0.7) { best = s; matched = raw; }
        }
      }
    }
    result[f.key] = matched;
    if (matched) used.add(matched);
  }
  return result;
}

function fingerprintHeaders(headers: string[]): string {
  return headers.slice().sort().map(h => norm(h)).join('|');
}

function parseExcel(file: File): Promise<{ sheets: SheetData[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        const sheets: SheetData[] = [];

        for (const name of wb.SheetNames) {
          const ws = wb.Sheets[name];
          if (!ws) continue;
          const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', blankrows: false, raw: false });
          if (aoa.length === 0) continue;

          let headerIdx = 0;
          for (let i = 0; i < Math.min(aoa.length, 10); i++) {
            const row = aoa[i];
            if (Array.isArray(row) && row.filter(c => c !== '' && c != null).length >= 2) {
              headerIdx = i; break;
            }
          }

          const headerRow = (aoa[headerIdx] as unknown[]).map((c, i) => {
            const s = (c == null ? '' : String(c)).trim();
            return s || `ستون_${i + 1}`;
          });

          const seen: Record<string, number> = {};
          const uniqueHeaders = headerRow.map(h => {
            if (seen[h] == null) { seen[h] = 0; return h; }
            seen[h]++; return `${h}_${seen[h]}`;
          });

          const rows: Record<string, string>[] = [];
          for (let i = headerIdx + 1; i < aoa.length; i++) {
            const row = aoa[i];
            if (!Array.isArray(row)) continue;
            const obj: Record<string, string> = {};
            let hasData = false;
            uniqueHeaders.forEach((h, j) => {
              const v = row[j];
              const sv = v == null ? '' : (v instanceof Date ? v.toISOString().slice(0, 10) : String(v)).trim();
              obj[h] = sv;
              if (sv) hasData = true;
            });
            if (hasData) rows.push(obj);
          }

          sheets.push({
            name,
            headers: uniqueHeaders,
            rows: rows.slice(0, 2000),
            mapping: {},
            confirmed: false,
            fingerprint: fingerprintHeaders(uniqueHeaders),
          });
        }

        resolve({ sheets });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function EquipmentImportWizard({ file, onClose, onComplete }: Props) {
  const app = useApp();
  const toast = useToast();
  const [step, setStep] = useState<Step>('parse');
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [parentId, setParentId] = useState<string | null>(null);
  const [askApplyAll, setAskApplyAll] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [createdEquipment, setCreatedEquipment] = useState<Equipment[]>([]);
  const [defaultValues, setDefaultValues] = useState<Record<string, string>>({});
  const [editedRows, setEditedRows] = useState<Record<string, string>[] | null>(null);

  // Parse file on mount
  useEffect(() => {
    if (!file) return;
    setStep('parse');
    setSheets([]);
    setActiveSheetIdx(0);
    setEditedRows(null);

    parseExcel(file).then(({ sheets }) => {
      if (sheets.length === 0) {
        toast.push('فایل خالی است یا قابل خواندن نیست', 'error');
        return;
      }
      // Apply auto-mapping + check for existing templates
      const sheetsWithMapping = sheets.map(s => {
        const tpl = app.mappingTemplates.find(t =>
          t.target === 'equipment' && t.fingerprint === s.fingerprint
        );
        return { ...s, mapping: autoMap(s.headers, tpl?.mapping) };
      });
      setSheets(sheetsWithMapping);
      setStep('tree');
    }).catch(() => {
      toast.push('خطا در پارس فایل Excel', 'error');
    });
  }, [file]);

  const activeSheet = sheets[activeSheetIdx];
  const visibleRows = editedRows ?? activeSheet?.rows ?? [];

  // Validation results
  const validation = useMemo(() => {
    if (!activeSheet) return null;
    const errors: { row: number; field: string; message: string }[] = [];
    const warnings: { row: number; message: string }[] = [];
    const seenSerials = new Set<string>();

    visibleRows.forEach((row, idx) => {
      const get = (f: string) => {
        const col = activeSheet.mapping[f];
        return col ? (row[col] ?? '').trim() : (defaultValues[f] ?? '');
      };
      // Required fields
      EQ_FIELDS.filter(f => f.required).forEach(f => {
        const v = get(f.key);
        if (!v) warnings.push({ row: idx + 1, message: `${f.label} خالی است — مقدار خودکار استفاده می‌شود` });
      });
      // Duplicate serial check
      const serial = get('serial');
      if (serial && serial !== '-') {
        if (seenSerials.has(serial)) {
          errors.push({ row: idx + 1, field: 'serial', message: `شماره سریال تکراری: ${serial}` });
        }
        seenSerials.add(serial);
      }
      // Date format
      const date = get('purchaseDate');
      if (date && !/^\d{4}-\d{2}-\d{2}/.test(date) && !/^\d{4}\/\d{1,2}\/\d{1,2}/.test(date)) {
        warnings.push({ row: idx + 1, message: `فرمت تاریخ نامعتبر: ${date}` });
      }
      // Year as number
      const year = get('year');
      if (year && isNaN(parseInt(year))) {
        warnings.push({ row: idx + 1, message: `سال ساخت غیر عددی: ${year}` });
      }
    });

    const quality = Math.max(0, 100 - errors.length * 10 - warnings.length * 2);
    return { errors: errors.slice(0, 30), warnings: warnings.slice(0, 30), quality };
  }, [activeSheet, visibleRows, defaultValues]);

  if (!file) return null;

  // Action: confirm current sheet mapping and ask about others
  const confirmSheetMapping = () => {
    setSheets(prev => prev.map((s, i) => i === activeSheetIdx ? { ...s, confirmed: true } : s));
    const otherUnconfirmed = sheets.filter((s, i) => i !== activeSheetIdx && !s.confirmed);
    if (otherUnconfirmed.length > 0) {
      setAskApplyAll(true);
    } else {
      setStep('edit_data');
    }
  };

  const applyMappingToAll = (apply: boolean) => {
    if (apply && activeSheet) {
      const currentMapping = activeSheet.mapping;
      setSheets(prev => prev.map(s => {
        if (s.confirmed) return s;
        // Only apply fields where the column exists in this sheet
        const newMapping: Record<string, string | null> = {};
        for (const [field, col] of Object.entries(currentMapping)) {
          if (col && s.headers.includes(col)) {
            newMapping[field] = col;
          } else {
            // Try to auto-map for this sheet
            const auto = autoMap(s.headers);
            newMapping[field] = auto[field] ?? null;
          }
        }
        return { ...s, mapping: newMapping, confirmed: true };
      }));
      toast.push(`Mapping به ${faNum(sheets.length - 1)} برگه دیگر اعمال شد`, 'success');
    }
    setAskApplyAll(false);
    setStep('edit_data');
  };

  const updateMapping = (field: string, col: string | null) => {
    setSheets(prev => prev.map((s, i) => i === activeSheetIdx ? { ...s, mapping: { ...s.mapping, [field]: col } } : s));
  };

  const finalImport = () => {
    setStep('import');

    const fileData: EquipmentDocument = {
      id: uid('doc'),
      name: file.name,
      type: 'datasheet',
      url: '',
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: app.currentUser?.name ?? 'سیستم',
    };

    // Read file as data URL for attachment
    const reader = new FileReader();
    reader.onload = () => {
      fileData.url = reader.result as string;
      doActualImport(fileData);
    };
    reader.onerror = () => doActualImport(fileData);
    reader.readAsDataURL(file);
  };

  const doActualImport = (fileDoc: EquipmentDocument) => {
    setTimeout(() => {
      let total = 0;
      const created: Equipment[] = [];

      sheets.forEach((sheet, sheetIdx) => {
        const rows = (sheetIdx === activeSheetIdx && editedRows) ? editedRows : sheet.rows;

        // If sheet has only 1-2 rows, treat the WHOLE sheet as one equipment with this name
        // Otherwise treat each row as an equipment
        const isSingleEquipment = rows.length <= 2 && sheet.name.length > 0;

        if (isSingleEquipment) {
          // Aggregate all rows into one equipment with the sheet name
          const merged: Record<string, string> = {};
          rows.forEach(r => Object.entries(r).forEach(([k, v]) => { if (v && !merged[k]) merged[k] = v; }));

          const get = (f: string) => {
            const col = sheet.mapping[f];
            const v = col ? (merged[col] ?? '').trim() : '';
            return v || defaultValues[f] || '';
          };
          const getNum = (f: string, def = 0) => {
            const v = get(f);
            if (!v) return def;
            const en = v.replace(/[٬,]/g, '').replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
            const n = parseFloat(en);
            return isNaN(n) ? def : n;
          };

          const eq: Equipment = {
            id: uid('eq'), parentId,
            code: get('code') || `${sheet.name.slice(0, 8)}-${total + 1}`,
            name: get('name') || sheet.name,
            category: get('category') || sheet.name,
            department: get('department') || (parentId ? app.equipment.find(e => e.id === parentId)?.department ?? 'تولید' : 'تولید'),
            location: get('location') || 'سالن اصلی',
            manufacturer: get('manufacturer') || '-',
            model: get('model') || '-',
            serial: get('serial') || '-',
            year: getNum('year', new Date().getFullYear()),
            purchaseDate: get('purchaseDate') || new Date().toISOString().slice(0, 10),
            purchaseCost: getNum('purchaseCost'),
            status: (get('status') as Equipment['status']) || 'active',
            criticality: (get('criticality') as Equipment['criticality']) || 'medium',
            healthScore: getNum('healthScore', 85),
            rulDays: 720,
            capacity: get('capacity') || undefined,
            power: get('power') || undefined,
            voltage: get('voltage') || undefined,
            weight: get('weight') || undefined,
            notes: get('notes') || undefined,
            documents: [fileDoc],
            sourceFile: file.name,
          };
          app.addEquipment(eq);
          created.push(eq);
          total++;
        } else {
          // Each row is an equipment
          rows.forEach((row, rowIdx) => {
            const hasAny = Object.values(row).some(v => v && v.trim());
            if (!hasAny) return;

            const get = (f: string) => {
              const col = sheet.mapping[f];
              const v = col ? (row[col] ?? '').trim() : '';
              return v || defaultValues[f] || '';
            };
            const getNum = (f: string, def = 0) => {
              const v = get(f);
              if (!v) return def;
              const en = v.replace(/[٬,]/g, '').replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
              const n = parseFloat(en);
              return isNaN(n) ? def : n;
            };

            const eq: Equipment = {
              id: uid('eq'), parentId,
              code: get('code') || `${sheet.name.slice(0, 5)}-${rowIdx + 1}`,
              name: get('name') || `${sheet.name} - ردیف ${rowIdx + 1}`,
              category: get('category') || sheet.name,
              department: get('department') || (parentId ? app.equipment.find(e => e.id === parentId)?.department ?? 'تولید' : 'تولید'),
              location: get('location') || 'سالن اصلی',
              manufacturer: get('manufacturer') || '-',
              model: get('model') || '-',
              serial: get('serial') || '-',
              year: getNum('year', new Date().getFullYear()),
              purchaseDate: get('purchaseDate') || new Date().toISOString().slice(0, 10),
              purchaseCost: getNum('purchaseCost'),
              status: (get('status') as Equipment['status']) || 'active',
              criticality: (get('criticality') as Equipment['criticality']) || 'medium',
              healthScore: getNum('healthScore', 85),
              rulDays: 720,
              capacity: get('capacity') || undefined,
              power: get('power') || undefined,
              voltage: get('voltage') || undefined,
              weight: get('weight') || undefined,
              notes: get('notes') || undefined,
              documents: [fileDoc],
              sourceFile: file.name,
            };
            app.addEquipment(eq);
            created.push(eq);
            total++;
          });
        }

        // Save mapping template for future use (AI learning)
        const tpl: MappingTemplate = {
          id: uid('tpl'),
          name: `الگوی ${sheet.name}`,
          target: 'equipment',
          fingerprint: sheet.fingerprint,
          headers: sheet.headers,
          mapping: sheet.mapping,
          usageCount: 1,
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date().toISOString(),
        };
        app.saveMappingTemplate(tpl);
      });

      // Archive the file in excel repo
      app.addExcel({
        id: uid('x'), name: file.name, size: file.size, version: 1,
        uploadedBy: app.currentUser?.name ?? 'کاربر',
        uploadedAt: new Date().toISOString(),
        sheets: sheets.map(s => s.name),
        checksum: Math.random().toString(36).slice(2, 18),
      });

      app.logAction(`واردسازی ${faNum(total)} تجهیز از Excel`, 'تجهیزات', file.name);
      setImportedCount(total);
      setCreatedEquipment(created);
      setStep('done');
    }, 800);
  };

  return (
    <Modal open={!!file} onClose={onClose}
      title={`📥 واردسازی هوشمند تجهیزات از Excel`}
      size="xl"
      footer={renderFooter()}
    >
      <div className="space-y-4">
        <Stepper step={step} />

        {step === 'parse' && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin"><I.Cpu size={48} className="text-amber-400" /></div>
            <p className="text-sm text-amber-300 mt-4">در حال خواندن و تحلیل فایل Excel...</p>
          </div>
        )}

        {/* STEP: Tree picker */}
        {step === 'tree' && (
          <div className="space-y-4">
            <div className="surface-soft rounded-xl p-3">
              <h4 className="text-sm font-bold text-gold-gradient mb-1 flex items-center gap-1.5">
                <I.Tree size={14} /> مرحله ۱ از ۷ — انتخاب محل قرارگیری در درختچه
              </h4>
              <p className="text-xs text-ink-300 leading-6">
                تجهیزات این فایل کجا قرار بگیرند؟ گره والد را انتخاب کنید یا گره جدید بسازید.
              </p>
            </div>

            <div className="surface-soft rounded-xl p-3">
              <h5 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1.5">
                <I.Doc size={12} /> 📊 برگه‌های شناسایی‌شده در فایل
              </h5>
              <div className="space-y-1.5">
                {sheets.map((s, i) => (
                  <div key={i} className="surface rounded-lg p-2 flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-amber-500/15 text-amber-300 flex items-center justify-center text-xs font-bold">{faNum(i + 1)}</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{s.name}</div>
                      <div className="text-[10px] text-ink-400">{faNum(s.rows.length)} ردیف • {faNum(s.headers.length)} ستون</div>
                    </div>
                    {app.mappingTemplates.some(t => t.fingerprint === s.fingerprint) && (
                      <span className="pill bg-emerald-500/15 text-emerald-200 text-[10px]">
                        <I.Spark size={10} /> الگو موجود
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-ink-400 mt-2">
                💡 هر برگه به‌صورت یک تجهیز مستقل (یا یک گروه از تجهیزات) واردسازی می‌شود.
              </p>
            </div>

            <EquipmentTreePicker selectedId={parentId} onSelect={setParentId} />
          </div>
        )}

        {/* STEP: Analyze (auto-mapping) */}
        {step === 'analyze' && activeSheet && (
          <div className="space-y-4">
            <div className="surface-soft rounded-xl p-3">
              <h4 className="text-sm font-bold text-gold-gradient mb-1 flex items-center gap-1.5">
                <I.AI size={14} /> مرحله ۳ از ۷ — تحلیل هوشمند
              </h4>
              <p className="text-xs text-ink-300">AI ساختار فایل را تحلیل کرد و ستون‌ها را شناسایی نمود.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-2">
              <StatCard label="برگه‌ها" value={faNum(sheets.length)} icon="Folder" />
              <StatCard label="مجموع ردیف‌ها" value={faNum(sheets.reduce((s, sh) => s + sh.rows.length, 0))} icon="Doc" />
              <StatCard label="الگوهای ذخیره‌شده" value={faNum(app.mappingTemplates.filter(t => t.target === 'equipment').length)} icon="Spark" />
            </div>

            <div className="surface ring-gold rounded-xl p-4">
              <h5 className="font-bold text-gold-gradient mb-2 flex items-center gap-2">
                <I.Cpu size={14} /> 🤖 هوش مصنوعی این موارد را تشخیص داد:
              </h5>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {sheets.map((s, i) => {
                  const mapped = Object.values(s.mapping).filter(v => v).length;
                  const conf = Math.round((mapped / EQ_FIELDS.length) * 100);
                  return (
                    <div key={i} className="surface-soft rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{s.name}</span>
                        <span className={`pill ${conf > 60 ? 'bg-emerald-500/15 text-emerald-200' : conf > 30 ? 'bg-amber-500/15 text-amber-200' : 'bg-rose-500/15 text-rose-200'}`}>
                          {faNum(conf)}٪ اطمینان
                        </span>
                      </div>
                      <div className="text-[10px] text-ink-400">
                        {faNum(mapped)} از {faNum(EQ_FIELDS.length)} فیلد شناسایی شد
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP: Mapping */}
        {step === 'mapping' && activeSheet && (
          <div className="space-y-3">
            <div className="surface-soft rounded-xl p-3">
              <h4 className="text-sm font-bold text-gold-gradient mb-1 flex items-center gap-1.5">
                <I.Edit size={14} /> مرحله ۴ از ۷ — تطبیق فیلدها (Mapping)
              </h4>
              <p className="text-xs text-ink-300">ستون‌های Excel را به فیلدهای سامانه متصل کنید. AI به‌صورت خودکار پیشنهاد داده.</p>
            </div>

            {/* Sheet tabs */}
            {sheets.length > 1 && (
              <div className="flex gap-1 flex-wrap surface-soft p-1.5 rounded-lg">
                {sheets.map((s, i) => (
                  <button key={i} onClick={() => setActiveSheetIdx(i)}
                    className={`px-3 py-1.5 rounded text-xs flex items-center gap-1.5 ${i === activeSheetIdx ? 'btn-gold' : 'text-amber-200 hover:bg-amber-500/10'}`}>
                    <span>📑 {s.name}</span>
                    {s.confirmed && <I.Check size={10} className="text-emerald-300" />}
                  </button>
                ))}
              </div>
            )}

            <div className="surface-soft rounded-xl p-3">
              <div className="text-xs text-amber-300 mb-1">
                برگه فعال: <span className="font-bold">{activeSheet.name}</span> ({faNum(activeSheet.rows.length)} ردیف)
              </div>
              <div className="text-[10px] text-ink-400">
                ستون‌های موجود: {activeSheet.headers.slice(0, 8).join('، ')}
                {activeSheet.headers.length > 8 && ` + ${faNum(activeSheet.headers.length - 8)} ستون دیگر`}
              </div>
            </div>

            <div className="max-h-[40vh] overflow-y-auto space-y-1.5 pl-1">
              {EQ_FIELDS.map(field => {
                const col = activeSheet.mapping[field.key];
                const samples = col ? activeSheet.rows.slice(0, 3).map(r => r[col]).filter(Boolean).slice(0, 2).join(' ، ') : null;
                return (
                  <div key={field.key} className={`surface-soft rounded-lg p-2 flex items-center gap-3 ${
                    col ? 'border-r-2 border-r-emerald-400/60' : field.required ? 'border-r-2 border-r-rose-400/40' : ''
                  }`}>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center gap-1">
                        {field.label}
                        <span className="text-[10px] text-ink-400 font-mono">({field.key})</span>
                        {field.required && <span className="text-rose-300 text-[10px]">*</span>}
                      </div>
                      {samples && <div className="text-[10px] text-emerald-300/80 mt-0.5 truncate" title={samples}>نمونه: {samples}</div>}
                    </div>
                    <I.Chevron size={12} className="text-amber-300/50 rotate-180 shrink-0" />
                    <select className="input-dark py-1.5 text-xs w-44 shrink-0" value={col ?? ''}
                      onChange={e => updateMapping(field.key, e.target.value || null)}>
                      <option value="">— انتخاب کنید —</option>
                      {activeSheet.headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    {col
                      ? <I.Check className="text-emerald-400 shrink-0" size={14} />
                      : <span className="w-3.5 h-3.5 rounded-full border border-ink-600 shrink-0" />}
                  </div>
                );
              })}
            </div>

            <div className="surface ring-gold rounded-xl p-3 flex items-start gap-2">
              <I.Spark className="text-amber-400 shrink-0 mt-0.5" size={14} />
              <div className="text-xs text-amber-200">
                <strong>یادگیری هوش مصنوعی:</strong> پس از تأیید این Mapping، الگو ذخیره می‌شود تا فایل‌های مشابه در آینده خودکار پر شوند.
              </div>
            </div>
          </div>
        )}

        {/* STEP: Edit Data */}
        {step === 'edit_data' && activeSheet && (
          <div className="space-y-3">
            <div className="surface-soft rounded-xl p-3">
              <h4 className="text-sm font-bold text-gold-gradient mb-1 flex items-center gap-1.5">
                <I.Edit size={14} /> مرحله ۵ از ۷ — ویرایش و مقادیر پیش‌فرض
              </h4>
              <p className="text-xs text-ink-300">می‌توانید مقادیر پیش‌فرض تعیین کنید که برای فیلدهای خالی استفاده شوند.</p>
            </div>

            <div className="surface-soft rounded-xl p-3">
              <h5 className="text-xs text-amber-300 font-bold mb-2">⚙ مقادیر پیش‌فرض (در صورت خالی بودن سلول):</h5>
              <div className="grid sm:grid-cols-2 gap-2">
                {['department', 'location', 'manufacturer', 'category', 'criticality'].map(f => {
                  const fieldInfo = EQ_FIELDS.find(x => x.key === f)!;
                  return (
                    <div key={f}>
                      <label className="text-[10px] text-ink-400 mb-0.5 block">{fieldInfo.label}</label>
                      {fieldInfo.type === 'enum' ? (
                        <select className="input-dark py-1.5 text-xs"
                          value={defaultValues[f] ?? ''}
                          onChange={e => setDefaultValues(p => ({ ...p, [f]: e.target.value }))}>
                          <option value="">— خودکار —</option>
                          {fieldInfo.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input className="input-dark py-1.5 text-xs"
                          placeholder="مقدار پیش‌فرض..."
                          value={defaultValues[f] ?? ''}
                          onChange={e => setDefaultValues(p => ({ ...p, [f]: e.target.value }))} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="surface-soft rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs text-amber-300 font-bold">📋 پیش‌نمایش داده‌ها ({faNum(visibleRows.length)} ردیف)</h5>
                <span className="text-[10px] text-ink-400">قابل ویرایش — روی هر سلول کلیک کنید</span>
              </div>
              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full text-[11px]">
                  <thead className="bg-amber-500/10 text-amber-300 sticky top-0">
                    <tr>
                      <th className="px-2 py-1.5">#</th>
                      {Object.entries(activeSheet.mapping).filter(([, v]) => v).slice(0, 6).map(([k, col]) => (
                        <th key={k} className="px-2 py-1.5 text-right">
                          {EQ_FIELDS.find(f => f.key === k)?.label ?? k}
                          <div className="text-[9px] text-ink-400 font-normal">{col}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10">
                    {visibleRows.slice(0, 20).map((row, i) => (
                      <tr key={i}>
                        <td className="px-2 py-1 text-ink-400">{faNum(i + 1)}</td>
                        {Object.entries(activeSheet.mapping).filter(([, v]) => v).slice(0, 6).map(([k, col]) => (
                          <td key={k} className="px-2 py-1">
                            <input
                              className="bg-transparent text-ink-100 hover:bg-amber-500/10 focus:bg-amber-500/15 focus:outline-none rounded px-1 py-0.5 w-full text-[11px]"
                              value={col ? (row[col] ?? '') : ''}
                              onChange={e => {
                                if (!col) return;
                                const newRows = visibleRows.map((r, ri) => ri === i ? { ...r, [col]: e.target.value } : r);
                                setEditedRows(newRows);
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visibleRows.length > 20 && (
                <p className="text-[10px] text-ink-400 text-center mt-1">+ {faNum(visibleRows.length - 20)} ردیف دیگر (فقط ۲۰ تای اول قابل ویرایش است)</p>
              )}
            </div>
          </div>
        )}

        {/* STEP: Validate */}
        {step === 'validate' && validation && (
          <div className="space-y-3">
            <div className="surface-soft rounded-xl p-3">
              <h4 className="text-sm font-bold text-gold-gradient mb-1 flex items-center gap-1.5">
                <I.Shield size={14} /> مرحله ۶ از ۷ — اعتبارسنجی داده‌ها
              </h4>
              <p className="text-xs text-ink-300">بررسی شماره سریال تکراری، فیلد خالی، فرمت تاریخ و...</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-2">
              <div className="surface rounded-xl p-3 text-center">
                <div className="font-display text-2xl text-emerald-300">{faNum(visibleRows.length - validation.errors.length)}</div>
                <div className="text-[10px] text-ink-300 mt-1">رکورد سالم</div>
              </div>
              <div className="surface rounded-xl p-3 text-center">
                <div className="font-display text-2xl text-amber-300">{faNum(validation.warnings.length)}</div>
                <div className="text-[10px] text-ink-300 mt-1">هشدار</div>
              </div>
              <div className="surface rounded-xl p-3 text-center">
                <div className="font-display text-2xl text-rose-300">{faNum(validation.errors.length)}</div>
                <div className="text-[10px] text-ink-300 mt-1">خطا</div>
              </div>
            </div>

            <div className="surface ring-gold rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-amber-300 font-bold">🎯 امتیاز کیفیت داده‌ها (توسط AI)</span>
                <span className="font-display text-2xl text-gold-gradient">{faNum(validation.quality)}/۱۰۰</span>
              </div>
              <div className="h-2 surface-soft rounded-full overflow-hidden">
                <div className={`h-full ${validation.quality > 80 ? 'bg-emerald-500' : validation.quality > 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${validation.quality}%` }} />
              </div>
            </div>

            {validation.errors.length > 0 && (
              <div className="surface-soft rounded-xl p-3">
                <h5 className="text-xs text-rose-300 font-bold mb-2 flex items-center gap-1">
                  <I.Alert size={12} /> خطاها ({faNum(validation.errors.length)} مورد)
                </h5>
                <ul className="space-y-1 text-[11px] max-h-32 overflow-y-auto">
                  {validation.errors.map((e, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-rose-200">
                      <span>•</span>
                      <span>ردیف {faNum(e.row)} — {e.field}: {e.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div className="surface-soft rounded-xl p-3">
                <h5 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
                  <I.Alert size={12} /> هشدارها ({faNum(validation.warnings.length)} مورد)
                </h5>
                <ul className="space-y-1 text-[11px] max-h-32 overflow-y-auto">
                  {validation.warnings.slice(0, 10).map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-amber-200/90">
                      <span>•</span>
                      <span>ردیف {faNum(w.row)}: {w.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validation.errors.length === 0 && validation.warnings.length === 0 && (
              <div className="surface ring-gold rounded-xl p-6 text-center">
                <I.Check size={48} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-emerald-300 font-bold">داده‌ها بدون خطا هستند! آماده واردسازی</p>
              </div>
            )}
          </div>
        )}

        {step === 'import' && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin"><I.Upload size={48} className="text-amber-400" /></div>
            <p className="text-sm text-amber-300 mt-4">در حال ساخت شناسنامه تجهیزات و ذخیره فایل...</p>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-6">
            <div className="inline-flex w-20 h-20 rounded-full bg-emerald-500/15 items-center justify-center mb-4">
              <I.Check className="text-emerald-400" size={48} />
            </div>
            <h4 className="font-display text-2xl text-gold-gradient mb-2">واردسازی موفق!</h4>
            <p className="text-sm text-ink-200">
              <span className="font-display text-3xl text-amber-300">{faNum(importedCount)}</span> شناسنامه تجهیز ساخته شد
              {parentId && <> در «{app.equipment.find(e => e.id === parentId)?.name}»</>}.
            </p>

            {createdEquipment.length > 0 && (
              <div className="surface-soft rounded-xl p-3 mt-4 text-right max-h-40 overflow-y-auto">
                <h5 className="text-xs text-amber-300 font-bold mb-2">✓ تجهیزات ساخته‌شده:</h5>
                <ul className="text-[11px] space-y-0.5">
                  {createdEquipment.slice(0, 15).map(e => (
                    <li key={e.id} className="flex items-center gap-2">
                      <I.Cpu size={10} className="text-amber-300" />
                      <span className="font-mono text-amber-400">{e.code}</span>
                      <span>—</span>
                      <span>{e.name}</span>
                    </li>
                  ))}
                  {createdEquipment.length > 15 && <li className="text-ink-400 text-center mt-1">+ {faNum(createdEquipment.length - 15)} مورد دیگر</li>}
                </ul>
              </div>
            )}

            <div className="mt-3 text-xs text-emerald-300 space-y-0.5">
              <div>✓ فایل اصلی به‌عنوان مستندات هر تجهیز پیوست شد</div>
              <div>✓ فایل در «انبار اکسل» با نسخه‌بندی ذخیره شد</div>
              <div>✓ الگوی Mapping برای فایل‌های مشابه آینده ذخیره شد (AI Learning)</div>
            </div>
          </div>
        )}
      </div>

      {/* Ask "apply mapping to all" prompt */}
      {askApplyAll && (
        <Modal open={true} onClose={() => applyMappingToAll(false)} title="اعمال Mapping به سایر برگه‌ها؟" size="sm"
          footer={
            <>
              <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => applyMappingToAll(false)}>خیر، جداگانه</button>
              <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={() => applyMappingToAll(true)}>بله، همه</button>
            </>
          }>
          <div className="text-sm text-ink-100 leading-7">
            آیا می‌خواهید همین Mapping برای <strong className="text-amber-300">{faNum(sheets.filter(s => !s.confirmed).length)}</strong> برگه دیگر نیز اعمال شود؟
            <br /><br />
            <span className="text-xs text-amber-300">💡 در صورت تأیید، فقط برگه‌هایی که ستون‌های متفاوت دارند نیاز به ویرایش جداگانه خواهند داشت.</span>
          </div>
        </Modal>
      )}
    </Modal>
  );

  function renderFooter() {
    if (step === 'tree') {
      return (
        <>
          <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={onClose}>انصراف</button>
          <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep('analyze')}>
            ادامه ← {parentId ? `(در «${app.equipment.find(e => e.id === parentId)?.name}»)` : '(در ریشه)'}
          </button>
        </>
      );
    }
    if (step === 'analyze') {
      return (
        <>
          <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep('tree')}>← قبلی</button>
          <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep('mapping')}>تأیید Mapping ←</button>
        </>
      );
    }
    if (step === 'mapping') {
      return (
        <>
          <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep('analyze')}>← قبلی</button>
          <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs"
            onClick={() => setSheets(prev => prev.map((s, i) => i === activeSheetIdx ? { ...s, mapping: autoMap(s.headers) } : s))}>
            <I.Cpu size={12} className="inline ml-1" /> AI مجدد
          </button>
          <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={confirmSheetMapping}>تأیید این برگه ←</button>
        </>
      );
    }
    if (step === 'edit_data') {
      return (
        <>
          <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep('mapping')}>← قبلی</button>
          <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep('validate')}>اعتبارسنجی ←</button>
        </>
      );
    }
    if (step === 'validate') {
      return (
        <>
          <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setStep('edit_data')}>← قبلی</button>
          <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={finalImport}>
            <I.Check size={14} className="inline ml-1" /> ثبت نهایی
          </button>
        </>
      );
    }
    if (step === 'done') {
      return (
        <button className="btn-gold px-4 py-2 rounded-lg text-sm"
          onClick={() => { onClose(); onComplete?.(); toast.push(`${faNum(importedCount)} تجهیز اضافه شد`, 'success'); }}>
          پایان
        </button>
      );
    }
    return null;
  }
}

function Stepper({ step }: { step: Step }) {
  const steps: { k: Step; label: string }[] = [
    { k: 'parse', label: 'پارس' },
    { k: 'tree', label: 'انتخاب درختچه' },
    { k: 'analyze', label: 'تحلیل AI' },
    { k: 'mapping', label: 'تطبیق' },
    { k: 'edit_data', label: 'ویرایش' },
    { k: 'validate', label: 'اعتبارسنجی' },
    { k: 'done', label: 'پایان' },
  ];
  const order = ['parse', 'tree', 'analyze', 'mapping', 'edit_data', 'validate', 'import', 'done'];
  const currentIdx = order.indexOf(step);

  return (
    <div className="flex items-center justify-between gap-1 mb-2 overflow-x-auto">
      {steps.map((s, i) => {
        const sIdx = order.indexOf(s.k);
        const done = sIdx < currentIdx;
        const active = sIdx === currentIdx || (s.k === 'done' && step === 'import');
        return (
          <div key={s.k} className="flex items-center flex-1 min-w-[60px]">
            <div className={`flex flex-col items-center gap-0.5 ${active ? '' : 'opacity-60'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                done ? 'bg-emerald-500 text-white' :
                  active ? 'btn-gold' :
                    'bg-ink-800 text-ink-400 border border-amber-500/20'
              }`}>
                {done ? <I.Check size={10} /> : faNum(i + 1)}
              </div>
              <span className={`text-[8px] whitespace-nowrap ${active ? 'text-amber-300 font-bold' : 'text-ink-400'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-0.5 ${done ? 'bg-emerald-500' : 'bg-amber-500/20'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: keyof typeof I }) {
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
