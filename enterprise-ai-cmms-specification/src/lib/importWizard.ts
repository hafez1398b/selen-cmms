// Intelligent file import wizard — parses Excel/CSV/PDF/text and maps to modules
import * as XLSX from 'xlsx';

export type ImportTarget = 'equipment' | 'workorders' | 'pm' | 'inventory' | 'personnel' | 'suppliers' | 'archive';

export interface ImportTargetInfo {
  key: ImportTarget;
  label: string;
  icon: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  example: Record<string, string>;
}

export const IMPORT_TARGETS: ImportTargetInfo[] = [
  {
    key: 'equipment', label: 'تجهیزات و دارایی‌ها', icon: 'Tree',
    description: 'افزودن یا به‌روزرسانی تجهیزات، ماشین‌آلات و قطعات',
    requiredFields: ['code', 'name'],
    optionalFields: ['category', 'department', 'location', 'manufacturer', 'model', 'serial', 'year', 'criticality', 'healthScore'],
    example: { 'کد': 'MIX-101', 'نام': 'میکسر اصلی', 'دپارتمان': 'تولید', 'سازنده': 'Hennecke' },
  },
  {
    key: 'workorders', label: 'دستور کارها', icon: 'Wrench',
    description: 'افزودن دستور کارهای جدید (اصلاحی، پیشگیرانه، اضطراری)',
    requiredFields: ['title'],
    optionalFields: ['description', 'type', 'priority', 'status', 'department', 'plannedStart', 'plannedEnd', 'estimatedCost'],
    example: { 'عنوان': 'تعمیر نشتی پمپ', 'نوع': 'corrective', 'اولویت': 'high' },
  },
  {
    key: 'pm', label: 'برنامه‌های PM', icon: 'Calendar',
    description: 'افزودن برنامه‌های نگهداری پیشگیرانه',
    requiredFields: ['name'],
    optionalFields: ['frequency', 'taskType', 'nextDue', 'compliance'],
    example: { 'نام': 'روان‌کاری ماهانه', 'تواتر': 'monthly', 'نوع': 'lubrication' },
  },
  {
    key: 'inventory', label: 'انبار و قطعات یدکی', icon: 'Box',
    description: 'افزودن قطعات یدکی، مواد و مصرفی‌ها',
    requiredFields: ['code', 'name'],
    optionalFields: ['category', 'unit', 'unitCost', 'stock', 'min', 'max', 'warehouse', 'bin'],
    example: { 'کد': 'BRG-6205', 'نام': 'بلبرینگ SKF', 'موجودی': '۲۴', 'حداقل': '۱۰' },
  },
  {
    key: 'personnel', label: 'پرسنل و کارکنان', icon: 'Users',
    description: 'افزودن کاربران، تکنسین‌ها و کارکنان',
    requiredFields: ['name', 'email'],
    optionalFields: ['role', 'department', 'jobTitle', 'phone', 'skills'],
    example: { 'نام': 'سعید موسوی', 'ایمیل': 'saeed@basparfoam.ir', 'نقش': 'technician' },
  },
  {
    key: 'suppliers', label: 'تأمین‌کنندگان', icon: 'Factory',
    description: 'افزودن تأمین‌کنندگان و فروشندگان',
    requiredFields: ['name'],
    optionalFields: ['contact', 'phone', 'email', 'rating', 'leadDays'],
    example: { 'نام': 'پارس صنعت', 'تلفن': '۰۸۳۳۳۳۳۴۴۵۵' },
  },
  {
    key: 'archive', label: 'بایگانی (بدون واردسازی)', icon: 'Folder',
    description: 'فقط فایل را ذخیره و نسخه‌بندی کن — بدون واردسازی داده',
    requiredFields: [],
    optionalFields: [],
    example: {},
  },
];

// ====== Parse File ======

export interface ParsedFile {
  type: 'csv' | 'excel' | 'pdf' | 'docx' | 'text' | 'image' | 'unknown';
  rows: Record<string, string>[];
  headers: string[];
  sheets?: string[];
  rawText?: string;
  preview?: string;
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = file.name.toLowerCase().split('.').pop() ?? '';

  // CSV
  if (ext === 'csv' || file.type === 'text/csv') {
    const text = await file.text();
    return parseCSV(text);
  }

  // Excel — real XLSX parsing
  if (['xlsx', 'xls', 'ods'].includes(ext)) {
    try {
      const arr = new Uint8Array(await file.arrayBuffer());
      const wb = XLSX.read(arr, { type: 'array', cellDates: true });
      const sheetNames = wb.SheetNames;
      // Use the first sheet that has data
      let bestSheet = sheetNames[0];
      let bestData: Record<string, string>[] = [];
      let bestHeaders: string[] = [];

      for (const name of sheetNames) {
        const ws = wb.Sheets[name];
        if (!ws) continue;
        // Parse as array-of-arrays first to detect header
        const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', blankrows: false, raw: false });
        if (aoa.length === 0) continue;

        // Find header row — first non-empty row with multiple cells
        let headerIdx = 0;
        for (let i = 0; i < Math.min(aoa.length, 10); i++) {
          const row = aoa[i];
          if (Array.isArray(row) && row.filter(c => c !== '' && c != null).length >= 2) {
            headerIdx = i;
            break;
          }
        }

        const headerRow = (aoa[headerIdx] as unknown[]).map((c, i) => {
          const s = (c == null ? '' : String(c)).trim();
          return s || `ستون_${i + 1}`;
        });

        // Make unique headers
        const seen: Record<string, number> = {};
        const uniqueHeaders = headerRow.map(h => {
          if (seen[h] == null) { seen[h] = 0; return h; }
          seen[h]++; return `${h}_${seen[h]}`;
        });

        const dataRows: Record<string, string>[] = [];
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
          if (hasData) dataRows.push(obj);
        }

        if (dataRows.length > bestData.length) {
          bestData = dataRows;
          bestHeaders = uniqueHeaders;
          bestSheet = name;
        }
      }

      return {
        type: 'excel',
        sheets: sheetNames,
        headers: bestHeaders,
        rows: bestData.slice(0, 5000),
        preview: `برگه فعال: ${bestSheet}`,
      };
    } catch (err) {
      console.error('Excel parse error:', err);
      return {
        type: 'excel', sheets: ['Sheet1'], rows: [], headers: [],
        rawText: 'خطا در پارس فایل Excel — لطفاً فایل را به CSV تبدیل کنید.',
      };
    }
  }

  // Text-like
  if (['txt', 'rtf'].includes(ext) || file.type.startsWith('text/')) {
    const text = await file.text();
    // Try detect tabular text
    if (text.includes('\t') || text.includes(',')) {
      const csv = parseCSV(text);
      if (csv.rows.length > 0) return { ...csv, type: 'text' };
    }
    return {
      type: 'text', rows: [], headers: [],
      rawText: text, preview: text.slice(0, 500),
    };
  }

  // PDF — limited (can't fully parse without library)
  if (ext === 'pdf') {
    return {
      type: 'pdf', rows: [], headers: [],
      rawText: 'فایل PDF: پارس کامل نیاز به ابزار تخصصی دارد. فایل بایگانی می‌شود.',
    };
  }

  // Word docs
  if (['doc', 'docx', 'odt'].includes(ext)) {
    return {
      type: 'docx', rows: [], headers: [],
      rawText: 'فایل Word شناسایی شد. برای واردسازی داده، لطفاً جدول‌ها را به Excel یا CSV تبدیل کنید.',
    };
  }

  // Images
  if (file.type.startsWith('image/')) {
    return {
      type: 'image', rows: [], headers: [],
      rawText: 'تصویر شناسایی شد. واردسازی داده از تصویر نیاز به OCR دارد و فایل بایگانی می‌شود.',
    };
  }

  return { type: 'unknown', rows: [], headers: [] };
}

function parseCSV(text: string): ParsedFile {
  // Strip BOM
  text = text.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { type: 'csv', rows: [], headers: [] };

  // Detect delimiter
  const firstLine = lines[0];
  const delim = firstLine.includes('\t') ? '\t' : firstLine.split(',').length >= firstLine.split(';').length ? ',' : ';';

  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; continue; }
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === delim && !inQ) { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur);
    return out.map(s => s.trim());
  };

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length && i < 2000; i++) {
    const cells = parseLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, j) => { row[h] = cells[j] ?? ''; });
    rows.push(row);
  }

  return { type: 'csv', headers, rows, sheets: ['داده‌ها'] };
}

// Parse a specific sheet from an Excel file (for sheet switcher)
export async function parseExcelSheet(file: File, sheetName: string): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const arr = new Uint8Array(await file.arrayBuffer());
  const wb = XLSX.read(arr, { type: 'array', cellDates: true });
  const ws = wb.Sheets[sheetName];
  if (!ws) return { headers: [], rows: [] };

  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', blankrows: false, raw: false });
  if (aoa.length === 0) return { headers: [], rows: [] };

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

  return { headers: uniqueHeaders, rows: rows.slice(0, 5000) };
}

// ====== Smart Field Mapping ======

// Persian/English synonyms for each common field
const FIELD_SYNONYMS: Record<string, string[]> = {
  code: ['کد', 'شناسه', 'شماره', 'code', 'id', 'number', 'no', 'sku', 'asset code', 'item code'],
  name: ['نام', 'عنوان', 'name', 'title', 'description', 'asset name', 'item name'],
  email: ['ایمیل', 'پست الکترونیکی', 'email', 'e-mail', 'mail'],
  phone: ['تلفن', 'موبایل', 'شماره تماس', 'phone', 'mobile', 'cell', 'tel'],
  department: ['دپارتمان', 'بخش', 'واحد', 'department', 'dept', 'unit', 'section'],
  category: ['دسته', 'گروه', 'نوع', 'category', 'type', 'class', 'group'],
  location: ['موقعیت', 'مکان', 'محل', 'location', 'place', 'area'],
  manufacturer: ['سازنده', 'برند', 'تولیدکننده', 'manufacturer', 'brand', 'maker', 'vendor'],
  model: ['مدل', 'model'],
  serial: ['سریال', 'شماره سریال', 'serial', 'sn', 'serial number'],
  year: ['سال', 'سال ساخت', 'year', 'manufactured', 'built'],
  status: ['وضعیت', 'status', 'state'],
  priority: ['اولویت', 'priority', 'urgency'],
  criticality: ['بحرانیت', 'حساسیت', 'criticality', 'critical'],
  healthScore: ['سلامت', 'امتیاز سلامت', 'health', 'health score', 'condition'],
  title: ['عنوان', 'موضوع', 'title', 'subject'],
  description: ['توضیحات', 'شرح', 'description', 'desc', 'note', 'notes', 'details'],
  type: ['نوع', 'type', 'kind'],
  unit: ['واحد', 'unit', 'uom'],
  unitCost: ['قیمت', 'قیمت واحد', 'بها', 'price', 'cost', 'unit cost', 'unit price'],
  stock: ['موجودی', 'تعداد', 'stock', 'quantity', 'qty', 'on hand'],
  min: ['حداقل', 'حداقل موجودی', 'min', 'minimum', 'reorder'],
  max: ['حداکثر', 'حداکثر موجودی', 'max', 'maximum'],
  warehouse: ['انبار', 'warehouse', 'wh'],
  bin: ['ردیف', 'بین', 'مکان', 'bin', 'rack', 'shelf'],
  role: ['نقش', 'role', 'permission'],
  jobTitle: ['سمت', 'عنوان شغلی', 'job', 'title', 'position'],
  skills: ['مهارت', 'مهارت‌ها', 'تخصص', 'skills', 'skill', 'expertise'],
  contact: ['طرف حساب', 'نماینده', 'contact', 'representative'],
  rating: ['امتیاز', 'rating', 'score'],
  leadDays: ['لیدتایم', 'زمان تأمین', 'lead', 'lead time', 'lead days'],
  frequency: ['تواتر', 'فرکانس', 'دوره', 'frequency', 'period'],
  taskType: ['نوع کار', 'task type', 'work type'],
  nextDue: ['سررسید', 'تاریخ بعدی', 'next due', 'next', 'due'],
  compliance: ['انطباق', 'compliance'],
  plannedStart: ['شروع برنامه', 'تاریخ شروع', 'planned start', 'start date', 'start'],
  plannedEnd: ['پایان برنامه', 'تاریخ پایان', 'planned end', 'end date', 'end', 'deadline'],
  estimatedCost: ['هزینه برآورد', 'هزینه', 'cost', 'estimated cost', 'budget'],
};

// Normalize text for fuzzy matching: lowercase, remove spaces/punctuation,
// replace Persian/Arabic variants of letters
function norm(s: string): string {
  if (!s) return '';
  return s.toLowerCase().trim()
    .replace(/[\s_\-\.\/\\،,;:()«»\[\]"'`*#]+/g, '')
    .replace(/[يی]/g, 'ی')
    .replace(/[كک]/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/إأآا/g, 'ا');
}

// Levenshtein-lite distance for fuzzy matching
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  if (a.includes(b) || b.includes(a)) return 0.85;
  // Char overlap ratio
  const setA = new Set(a);
  const setB = new Set(b);
  let common = 0;
  for (const c of setA) if (setB.has(c)) common++;
  return common / Math.max(setA.size, setB.size);
}

/**
 * Auto-detect field mapping based on column headers.
 * Strategy:
 *  1) Exact normalized match
 *  2) Substring match (header contains synonym OR vice-versa)
 *  3) Fuzzy similarity ≥ 0.7
 *  4) Positional fallback for the first N important fields
 */
export function autoMapFields(headers: string[], target: ImportTarget): Record<string, string | null> {
  const info = IMPORT_TARGETS.find(t => t.key === target);
  if (!info) return {};
  const allFields = [...info.requiredFields, ...info.optionalFields];
  const result: Record<string, string | null> = {};
  const usedHeaders = new Set<string>();
  const normHeaders = headers.map(h => ({ raw: h, n: norm(h) }));

  // Pass 1 — exact normalized match
  for (const field of allFields) {
    const synonyms = (FIELD_SYNONYMS[field] ?? [field]).map(norm);
    for (const { raw, n } of normHeaders) {
      if (usedHeaders.has(raw)) continue;
      if (synonyms.includes(n)) {
        result[field] = raw;
        usedHeaders.add(raw);
        break;
      }
    }
  }

  // Pass 2 — substring/contains
  for (const field of allFields) {
    if (result[field]) continue;
    const synonyms = (FIELD_SYNONYMS[field] ?? [field]).map(norm);
    for (const { raw, n } of normHeaders) {
      if (usedHeaders.has(raw)) continue;
      let found = false;
      for (const syn of synonyms) {
        if (syn.length < 2) continue;
        if (n.includes(syn) || syn.includes(n)) {
          result[field] = raw;
          usedHeaders.add(raw);
          found = true;
          break;
        }
      }
      if (found) break;
    }
  }

  // Pass 3 — fuzzy similarity
  for (const field of allFields) {
    if (result[field]) continue;
    const synonyms = (FIELD_SYNONYMS[field] ?? [field]).map(norm);
    let bestHeader: string | null = null;
    let bestScore = 0;
    for (const { raw, n } of normHeaders) {
      if (usedHeaders.has(raw)) continue;
      for (const syn of synonyms) {
        const score = similarity(n, syn);
        if (score > bestScore && score >= 0.7) {
          bestScore = score;
          bestHeader = raw;
        }
      }
    }
    if (bestHeader) {
      result[field] = bestHeader;
      usedHeaders.add(bestHeader);
    } else {
      result[field] = null;
    }
  }

  // Pass 4 — positional fallback for unmapped REQUIRED fields ONLY
  // If "code" is unmapped and first column exists, use it. Same for "name" with second column.
  const unmappedRequired = info.requiredFields.filter(f => !result[f]);
  if (unmappedRequired.length > 0) {
    const availableHeaders = headers.filter(h => !usedHeaders.has(h));
    unmappedRequired.forEach((field, idx) => {
      if (availableHeaders[idx]) {
        result[field] = availableHeaders[idx];
        usedHeaders.add(availableHeaders[idx]);
      }
    });
  }

  return result;
}

// ====== Suggest target based on headers (AI-like heuristics) ======
export function suggestTarget(headers: string[]): { target: ImportTarget; confidence: number; reason: string }[] {
  const suggestions: { target: ImportTarget; confidence: number; reason: string }[] = [];

  for (const info of IMPORT_TARGETS) {
    if (info.key === 'archive') continue;
    const mapping = autoMapFields(headers, info.key);
    const requiredMatched = info.requiredFields.filter(f => mapping[f]).length;
    const optionalMatched = info.optionalFields.filter(f => mapping[f]).length;
    const totalFields = info.requiredFields.length + info.optionalFields.length;
    const matched = requiredMatched + optionalMatched;

    // Confidence = required (weight 2) + optional (weight 1), normalized
    const score = (requiredMatched * 2 + optionalMatched) / (info.requiredFields.length * 2 + info.optionalFields.length);
    const confidence = Math.round(score * 100);

    if (matched > 0) {
      const reason = `${matched} از ${totalFields} فیلد منطبق (${requiredMatched}/${info.requiredFields.length} اجباری)`;
      suggestions.push({ target: info.key, confidence, reason });
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ====== Validate rows before import ======
export interface ValidationResult {
  validRows: number;
  invalidRows: number;
  errors: { row: number; message: string }[];
  warnings: { row: number; message: string }[];
}

export function validateRows(rows: Record<string, string>[], mapping: Record<string, string | null>, target: ImportTarget): ValidationResult {
  const info = IMPORT_TARGETS.find(t => t.key === target);
  if (!info) return { validRows: 0, invalidRows: rows.length, errors: [], warnings: [] };

  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];
  let valid = 0;

  // Check at least ONE field is mapped — if so, allow proceeding (auto-fill missing required)
  const anyMapped = Object.values(mapping).some(v => v);
  if (!anyMapped) {
    warnings.push({ row: 0, message: 'هیچ ستونی مَپ نشده — لطفاً حداقل یک ستون را به یک فیلد متصل کنید' });
    return { validRows: 0, invalidRows: rows.length, errors: [], warnings };
  }

  // Warn (not error) for unmapped required fields — they'll be auto-generated
  info.requiredFields.forEach(reqField => {
    if (!mapping[reqField]) {
      warnings.push({ row: 0, message: `فیلد «${reqField}» مَپ نشده — به‌صورت خودکار تولید می‌شود` });
    }
  });

  rows.forEach((row, idx) => {
    let rowOk = true;
    for (const reqField of info.requiredFields) {
      const sourceCol = mapping[reqField];
      if (!sourceCol) continue; // will be auto-generated
      const v = row[sourceCol];
      if (!v || v.trim().length === 0) {
        // Still allow — will use placeholder
        warnings.push({ row: idx + 1, message: `«${reqField}» در ردیف ${idx + 1} خالی است — مقدار پیش‌فرض استفاده می‌شود` });
      }
    }
    // Row is valid if it has ANY data at all
    const hasAnyData = Object.values(row).some(v => v && v.trim().length > 0);
    if (!hasAnyData) {
      errors.push({ row: idx + 1, message: 'ردیف کاملاً خالی است' });
      rowOk = false;
    }
    if (rowOk) valid++;
  });

  return { validRows: valid, invalidRows: rows.length - valid, errors: errors.slice(0, 20), warnings: warnings.slice(0, 10) };
}
