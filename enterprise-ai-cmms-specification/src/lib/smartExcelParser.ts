// Smart Excel parser — extracts data from ANY Excel structure
// Handles: tables, key-value pairs, merged cells, multi-section sheets, images
import * as XLSX from 'xlsx';

export type CellValue = string | number | boolean | Date | null;

export interface RawCell {
  row: number;
  col: number;
  value: CellValue;
  text: string;
  merged?: { rowSpan: number; colSpan: number };
}

export interface ExtractedField {
  /** Original label from Excel (e.g. "شماره سریال", "Model", "Manufacturer") */
  label: string;
  /** Normalized canonical key (e.g. "serial", "model", "manufacturer") */
  canonicalKey?: string;
  /** Standardized Persian display label */
  displayLabel?: string;
  /** Actual value extracted */
  value: string;
  /** Cell position where label was found */
  labelPos?: { row: number; col: number };
  /** Cell position where value was found */
  valuePos?: { row: number; col: number };
  /** Confidence score 0-100 */
  confidence: number;
  /** How was this detected: 'key_value_horizontal' | 'key_value_vertical' | 'table_column' | 'inferred' */
  source: 'kv_horizontal' | 'kv_vertical' | 'table_column' | 'merged_header' | 'inferred';
  /** Type detected */
  dataType?: 'text' | 'number' | 'date' | 'phone' | 'email';
}

export interface ExtractedTable {
  title?: string;
  headers: string[];
  rows: string[][];
  startRow: number;
  startCol: number;
}

export interface ExtractedEquipment {
  /** Suggested name (from sheet name, top title, or first key) */
  name: string;
  /** All detected fields */
  fields: ExtractedField[];
  /** Tables found inside the sheet */
  tables: ExtractedTable[];
  /** Original sheet name */
  sheetName: string;
  /** Top-level title detected from merged cells */
  detectedTitle?: string;
  /** Raw cell grid for visualization */
  rawGrid: RawCell[][];
  /** Total non-empty cells */
  cellCount: number;
}

export interface SmartParseResult {
  fileName: string;
  equipment: ExtractedEquipment[];
  /** Was the structure "datasheet" (key-value) or "table" (rows) ? */
  primaryType: 'datasheet' | 'table' | 'mixed';
}

// ====== Field knowledge base ======
// Each canonical key with its synonyms in Persian/English/Arabic
const FIELD_KB: { key: string; label: string; synonyms: string[]; dataType: ExtractedField['dataType'] }[] = [
  { key: 'name', label: 'نام تجهیز', synonyms: ['نام تجهیز', 'نام', 'عنوان', 'name', 'equipment name', 'equipment', 'asset name', 'asset', 'item', 'title', 'tag name', 'item name'], dataType: 'text' },
  { key: 'code', label: 'کد تجهیز', synonyms: ['کد تجهیز', 'کد', 'شناسه', 'شماره تجهیز', 'tag', 'tag number', 'tag no', 'code', 'id', 'asset code', 'asset id', 'equipment code', 'equipment id', 'item code'], dataType: 'text' },
  { key: 'serial', label: 'شماره سریال', synonyms: ['شماره سریال', 'سریال', 'serial', 'serial number', 'serial no', 's/n', 'sn', 'serial #'], dataType: 'text' },
  { key: 'manufacturer', label: 'سازنده', synonyms: ['سازنده', 'کارخانه سازنده', 'تولیدکننده', 'برند', 'manufacturer', 'maker', 'brand', 'vendor', 'oem', 'made by', 'mfr', 'مارک'], dataType: 'text' },
  { key: 'model', label: 'مدل', synonyms: ['مدل', 'شماره مدل', 'model', 'model number', 'model no', 'type'], dataType: 'text' },
  { key: 'category', label: 'دسته/نوع', synonyms: ['دسته', 'نوع', 'گروه', 'category', 'group', 'class', 'kind', 'classification', 'equipment type'], dataType: 'text' },
  { key: 'department', label: 'دپارتمان', synonyms: ['دپارتمان', 'بخش', 'واحد', 'قسمت', 'department', 'dept', 'section', 'unit', 'division'], dataType: 'text' },
  { key: 'location', label: 'محل نصب', synonyms: ['محل نصب', 'محل', 'موقعیت', 'مکان', 'سالن', 'location', 'installation location', 'site', 'place', 'area', 'plant', 'building', 'room', 'install location'], dataType: 'text' },
  { key: 'year', label: 'سال ساخت', synonyms: ['سال ساخت', 'سال', 'سال تولید', 'year', 'year of manufacture', 'manufacture year', 'mfg year', 'built year', 'production year'], dataType: 'number' },
  { key: 'purchaseDate', label: 'تاریخ خرید/نصب', synonyms: ['تاریخ خرید', 'تاریخ نصب', 'تاریخ راه اندازی', 'تاریخ', 'date', 'install date', 'installation date', 'purchase date', 'commissioning date', 'commission date', 'date installed'], dataType: 'date' },
  { key: 'purchaseCost', label: 'هزینه/قیمت', synonyms: ['هزینه خرید', 'هزینه', 'قیمت', 'بها', 'ارزش', 'cost', 'price', 'value', 'purchase cost', 'purchase price'], dataType: 'number' },
  { key: 'capacity', label: 'ظرفیت', synonyms: ['ظرفیت', 'capacity', 'rated capacity', 'cap', 'حجم'], dataType: 'text' },
  { key: 'power', label: 'توان', synonyms: ['توان', 'قدرت', 'power', 'rated power', 'kw', 'kwh', 'hp', 'horsepower', 'output power', 'power rating'], dataType: 'text' },
  { key: 'voltage', label: 'ولتاژ', synonyms: ['ولتاژ', 'ولت', 'voltage', 'volts', 'voltage rating', 'rated voltage', 'v'], dataType: 'text' },
  { key: 'current', label: 'جریان', synonyms: ['جریان', 'آمپر', 'current', 'amperage', 'amps', 'rated current', 'a'], dataType: 'text' },
  { key: 'frequency', label: 'فرکانس', synonyms: ['فرکانس', 'هرتز', 'frequency', 'hz', 'rated frequency'], dataType: 'text' },
  { key: 'pressure', label: 'فشار', synonyms: ['فشار', 'pressure', 'rated pressure', 'bar', 'psi', 'design pressure'], dataType: 'text' },
  { key: 'temperature', label: 'دما', synonyms: ['دما', 'دمای کار', 'temperature', 'operating temperature', 'temp'], dataType: 'text' },
  { key: 'speed', label: 'سرعت', synonyms: ['سرعت', 'دور', 'rpm', 'speed', 'rotation speed'], dataType: 'text' },
  { key: 'weight', label: 'وزن', synonyms: ['وزن', 'weight', 'mass', 'kg', 'wt'], dataType: 'text' },
  { key: 'dimensions', label: 'ابعاد', synonyms: ['ابعاد', 'اندازه', 'dimensions', 'size', 'dimension'], dataType: 'text' },
  { key: 'standard', label: 'استاندارد', synonyms: ['استاندارد', 'استانداردها', 'standard', 'standards', 'compliance', 'certification'], dataType: 'text' },
  { key: 'description', label: 'توضیحات', synonyms: ['توضیحات', 'شرح', 'توصیف', 'توضیح', 'description', 'desc', 'remarks', 'notes', 'comments'], dataType: 'text' },
  { key: 'status', label: 'وضعیت', synonyms: ['وضعیت', 'حالت', 'status', 'state', 'condition'], dataType: 'text' },
  { key: 'criticality', label: 'بحرانیت', synonyms: ['بحرانیت', 'حساسیت', 'اولویت', 'اهمیت', 'criticality', 'priority', 'importance'], dataType: 'text' },
  { key: 'supplier', label: 'تأمین‌کننده', synonyms: ['تأمین کننده', 'تامین کننده', 'فروشنده', 'supplier', 'vendor', 'seller'], dataType: 'text' },
  { key: 'warrantyEnd', label: 'پایان گارانتی', synonyms: ['گارانتی', 'پایان گارانتی', 'warranty', 'warranty end', 'warranty until', 'guarantee'], dataType: 'date' },
  { key: 'phone', label: 'تلفن', synonyms: ['تلفن', 'موبایل', 'phone', 'mobile', 'tel'], dataType: 'phone' },
  { key: 'email', label: 'ایمیل', synonyms: ['ایمیل', 'email', 'e-mail', 'mail'], dataType: 'email' },
];

function normLabel(s: string): string {
  if (!s) return '';
  return s.toLowerCase().trim()
    .replace(/[\s_\-\.\/\\،,;:()«»\[\]"'`*#?!]+/g, '')
    .replace(/[يی]/g, 'ی').replace(/[كک]/g, 'ک').replace(/ة/g, 'ه')
    .replace(/[إأآا]/g, 'ا');
}

/** Match a label text against the knowledge base. Returns canonical info + confidence. */
export function matchField(label: string): { key: string; displayLabel: string; dataType: ExtractedField['dataType']; confidence: number } | null {
  const n = normLabel(label);
  if (n.length < 1) return null;

  let best: { key: string; displayLabel: string; dataType: ExtractedField['dataType']; confidence: number } | null = null;

  for (const f of FIELD_KB) {
    for (const syn of f.synonyms) {
      const ns = normLabel(syn);
      let conf = 0;
      if (n === ns) conf = 100;
      else if (n.length >= 2 && ns.length >= 2 && (n.includes(ns) || ns.includes(n))) {
        conf = 85;
      } else {
        // char overlap
        const setA = new Set(n);
        const setB = new Set(ns);
        let common = 0;
        for (const c of setA) if (setB.has(c)) common++;
        const ratio = common / Math.max(setA.size, setB.size);
        if (ratio >= 0.7 && Math.abs(n.length - ns.length) < 4) conf = Math.round(60 + ratio * 30);
      }
      if (conf > 0 && (!best || conf > best.confidence)) {
        best = { key: f.key, displayLabel: f.label, dataType: f.dataType, confidence: conf };
      }
    }
  }
  return best;
}

function cellToText(v: CellValue): string {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'boolean') return v ? 'بله' : 'خیر';
  return String(v).trim();
}

/** Detect if a cell text "looks like" a label (ends with colon, short, has specific keywords) */
function looksLikeLabel(text: string): boolean {
  if (!text || text.length === 0) return false;
  if (text.length > 60) return false; // long → probably value
  // Heuristics: short text, may end with colon, contains label-y characters
  if (/[:：]$/.test(text)) return true;
  if (text.length < 30 && /^[\u0600-\u06FFa-zA-Z\s_\-./()]+$/.test(text)) return true;
  return false;
}

/** Strip trailing colon and whitespace from label */
function cleanLabel(text: string): string {
  return text.replace(/[:：]+\s*$/, '').trim();
}

/** Read XLSX file and return grid of cells per sheet, including merge info */
export async function readExcelGrid(file: File): Promise<{ sheets: { name: string; grid: RawCell[][]; rows: number; cols: number }[]; sheetNames: string[] }> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: 'array', cellDates: true, cellStyles: false });
  const result: { name: string; grid: RawCell[][]; rows: number; cols: number }[] = [];

  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    if (!ws || !ws['!ref']) {
      result.push({ name, grid: [], rows: 0, cols: 0 });
      continue;
    }
    const range = XLSX.utils.decode_range(ws['!ref']);
    const rows = range.e.r - range.s.r + 1;
    const cols = range.e.c - range.s.c + 1;
    // Build empty grid
    const grid: RawCell[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        row: r, col: c, value: null, text: '',
      }))
    );

    // Fill cells
    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr];
        if (!cell) continue;
        let value: CellValue = cell.v ?? null;
        if (cell.t === 'd' && !(value instanceof Date)) value = new Date(value as string | number);
        const text = cellToText(value);
        grid[r - range.s.r][c - range.s.c] = {
          row: r - range.s.r, col: c - range.s.c, value, text,
        };
      }
    }

    // Apply merged cells — copy value from top-left to all spanned cells
    if (ws['!merges']) {
      for (const m of ws['!merges']) {
        const top = grid[m.s.r - range.s.r]?.[m.s.c - range.s.c];
        if (!top) continue;
        top.merged = { rowSpan: m.e.r - m.s.r + 1, colSpan: m.e.c - m.s.c + 1 };
        // Mark merged children with the same value for label/value detection
        for (let r = m.s.r; r <= m.e.r; r++) {
          for (let c = m.s.c; c <= m.e.c; c++) {
            if (r === m.s.r && c === m.s.c) continue;
            const child = grid[r - range.s.r]?.[c - range.s.c];
            if (child) {
              child.value = top.value;
              child.text = top.text;
            }
          }
        }
      }
    }

    result.push({ name, grid, rows, cols });
  }
  return { sheets: result, sheetNames: wb.SheetNames };
}

/** Detect tables in the grid (consecutive rows with similar non-empty column count, header row at top) */
function detectTables(grid: RawCell[][]): ExtractedTable[] {
  const tables: ExtractedTable[] = [];
  if (grid.length === 0) return tables;
  const rows = grid.length;

  let r = 0;
  while (r < rows) {
    const row = grid[r];
    const filledCols = row.filter(c => c.text).length;
    // Header heuristic: row with ≥3 filled cells that are "label-like"
    if (filledCols >= 3) {
      const isHeader = row.every(c => !c.text || looksLikeLabel(c.text)) && filledCols >= 3;
      if (isHeader) {
        // Collect header columns
        const headerCols: number[] = [];
        row.forEach((c, i) => { if (c.text) headerCols.push(i); });
        if (headerCols.length < 3) { r++; continue; }
        const headers = headerCols.map(i => cleanLabel(row[i].text));
        // Find data rows below
        const dataRows: string[][] = [];
        let dr = r + 1;
        while (dr < rows) {
          const data = grid[dr];
          const filled = headerCols.filter(i => data[i]?.text).length;
          if (filled < Math.max(2, Math.floor(headerCols.length / 2))) break;
          dataRows.push(headerCols.map(i => data[i]?.text ?? ''));
          dr++;
          if (dataRows.length > 500) break;
        }
        if (dataRows.length >= 2) {
          tables.push({
            headers, rows: dataRows,
            startRow: r, startCol: headerCols[0],
          });
          r = dr;
          continue;
        }
      }
    }
    r++;
  }
  return tables;
}

/** Detect key-value pairs (label-value horizontal/vertical) */
function detectKeyValues(grid: RawCell[][], skipRows: Set<number>): ExtractedField[] {
  const fields: ExtractedField[] = [];
  const usedCells = new Set<string>();
  const cellKey = (r: number, c: number) => `${r},${c}`;

  const isUsed = (r: number, c: number) => usedCells.has(cellKey(r, c)) || skipRows.has(r);
  const markUsed = (r: number, c: number) => usedCells.add(cellKey(r, c));

  for (let r = 0; r < grid.length; r++) {
    if (skipRows.has(r)) continue;
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (!cell.text || isUsed(r, c)) continue;

      // Try horizontal: label in (r,c), value in (r,c+1)
      const next = row[c + 1];
      if (next && next.text && !isUsed(r, c + 1) && looksLikeLabel(cell.text) && !looksLikeLabel(next.text)) {
        const labelText = cleanLabel(cell.text);
        const valueText = next.text;
        // Skip very short numeric labels
        if (labelText.length < 1) continue;
        const matched = matchField(labelText);
        fields.push({
          label: labelText,
          canonicalKey: matched?.key,
          displayLabel: matched?.displayLabel,
          value: valueText,
          labelPos: { row: r, col: c },
          valuePos: { row: r, col: c + 1 },
          confidence: matched?.confidence ?? 50,
          source: 'kv_horizontal',
          dataType: matched?.dataType ?? 'text',
        });
        markUsed(r, c);
        markUsed(r, c + 1);
        // If value spans multiple cells (merged), try to skip them
        if (next.merged) {
          for (let cc = 1; cc < next.merged.colSpan; cc++) markUsed(r, c + 1 + cc);
        }
        continue;
      }

      // Try vertical: label in (r,c), value in (r+1,c)
      const below = grid[r + 1]?.[c];
      if (below && below.text && !isUsed(r + 1, c) && looksLikeLabel(cell.text) && !looksLikeLabel(below.text)) {
        const labelText = cleanLabel(cell.text);
        const valueText = below.text;
        const matched = matchField(labelText);
        fields.push({
          label: labelText,
          canonicalKey: matched?.key,
          displayLabel: matched?.displayLabel,
          value: valueText,
          labelPos: { row: r, col: c },
          valuePos: { row: r + 1, col: c },
          confidence: matched?.confidence ?? 45,
          source: 'kv_vertical',
          dataType: matched?.dataType ?? 'text',
        });
        markUsed(r, c);
        markUsed(r + 1, c);
      }
    }
  }

  // Sort by confidence (highest first), but keep duplicates of canonical keys
  return fields.sort((a, b) => b.confidence - a.confidence);
}

/** Detect title from top-most merged cell or first non-empty row */
function detectTitle(grid: RawCell[][]): string | undefined {
  for (let r = 0; r < Math.min(5, grid.length); r++) {
    const row = grid[r];
    for (const cell of row) {
      if (cell.text && cell.merged && cell.merged.colSpan >= 2) {
        return cell.text;
      }
    }
    // Or first single non-empty cell that's the only one in its row
    const filled = row.filter(c => c.text);
    if (filled.length === 1 && filled[0].text.length > 5 && filled[0].text.length < 100) {
      return filled[0].text;
    }
  }
  return undefined;
}

/** Main: parse the full file into extracted equipment */
export async function smartParseExcel(file: File): Promise<SmartParseResult> {
  const { sheets } = await readExcelGrid(file);
  const equipment: ExtractedEquipment[] = [];
  let dataSheetCount = 0;
  let tableSheetCount = 0;

  for (const sheet of sheets) {
    if (sheet.grid.length === 0) continue;

    const tables = detectTables(sheet.grid);
    const skipRows = new Set<number>();
    tables.forEach(t => {
      for (let i = 0; i <= t.rows.length; i++) skipRows.add(t.startRow + i);
    });

    const fields = detectKeyValues(sheet.grid, skipRows);
    const title = detectTitle(sheet.grid);
    const cellCount = sheet.grid.reduce((s, row) => s + row.filter(c => c.text).length, 0);

    // Determine name
    let name = title || sheet.name;
    const nameField = fields.find(f => f.canonicalKey === 'name');
    if (nameField) name = nameField.value;

    // Count fields by source type
    if (fields.length >= 3) dataSheetCount++;
    if (tables.length > 0 && tables.some(t => t.rows.length >= 3)) tableSheetCount++;

    equipment.push({
      name,
      fields,
      tables,
      sheetName: sheet.name,
      detectedTitle: title,
      rawGrid: sheet.grid,
      cellCount,
    });
  }

  const primaryType: SmartParseResult['primaryType'] =
    dataSheetCount > tableSheetCount ? 'datasheet' :
      tableSheetCount > dataSheetCount ? 'table' : 'mixed';

  return { fileName: file.name, equipment, primaryType };
}

/** Convert extracted equipment into a form-ready structure */
export interface EquipmentForm {
  /** Source: original sheet */
  sourceSheet: string;
  /** Display name */
  name: string;
  /** Mapped canonical fields (system fields) */
  systemFields: Record<string, string>;
  /** All custom/dynamic fields (label → value) */
  customFields: { label: string; value: string }[];
  /** Tables found */
  tables: ExtractedTable[];
}

export function buildEquipmentForms(parsed: SmartParseResult): EquipmentForm[] {
  return parsed.equipment.map(eq => {
    const systemFields: Record<string, string> = {};
    const customFields: { label: string; value: string }[] = [];
    const usedLabels = new Set<string>();

    // Group by canonical key — take highest confidence
    const groupedByKey: Record<string, ExtractedField> = {};
    for (const f of eq.fields) {
      if (f.canonicalKey && f.confidence >= 60) {
        if (!groupedByKey[f.canonicalKey] || f.confidence > groupedByKey[f.canonicalKey].confidence) {
          groupedByKey[f.canonicalKey] = f;
        }
      }
    }

    // Set system fields
    for (const [key, f] of Object.entries(groupedByKey)) {
      systemFields[key] = f.value;
      usedLabels.add(normLabel(f.label));
    }

    // Custom fields = everything else
    for (const f of eq.fields) {
      const norm = normLabel(f.label);
      if (usedLabels.has(norm)) continue;
      usedLabels.add(norm);
      if (!f.value || f.value.length === 0) continue;
      customFields.push({ label: f.label, value: f.value });
    }

    return {
      sourceSheet: eq.sheetName,
      name: systemFields['name'] || eq.name,
      systemFields,
      customFields,
      tables: eq.tables,
    };
  });
}
