// Intelligent Column Detection - AI-powered field mapping
// Uses fuzzy matching + Persian/English variants + context clues

export interface DetectedField {
  sourceColumn: string;
  targetField: string;
  confidence: number; // 0-1
  reason: string;
  sampleValues: string[];
}

// Field aliases - Persian, English, and variants
const FIELD_ALIASES: Record<string, {
  variants: string[];
  keywords: string[];
  dataPattern?: RegExp;
  priority: number;
}> = {
  code: {
    variants: ["کد", "شماره", "code", "id", "asset code", "کد تجهیز", "کد دستگاه", "شماره تجهیز", "شناسه", "کد شناسایی", "asset id", "equipment code", "no", "no.", "شماره سریال کوتاه"],
    keywords: ["code", "کد"],
    dataPattern: /^[A-Z0-9\-\_]+$/i,
    priority: 10,
  },
  name: {
    variants: ["نام", "عنوان", "name", "title", "نام تجهیز", "نام دستگاه", "asset name", "equipment name", "description", "شرح", "شرح تجهیز", "اسم"],
    keywords: ["name", "نام", "عنوان", "title"],
    priority: 10,
  },
  nameEn: {
    variants: ["name en", "english name", "نام انگلیسی", "نام لاتین", "en name"],
    keywords: ["english", "en"],
    dataPattern: /^[A-Za-z\s\-0-9]+$/,
    priority: 6,
  },
  manufacturer: {
    variants: ["سازنده", "برند", "برند سازنده", "manufacturer", "brand", "make", "شرکت سازنده", "vendor", "شرکت"],
    keywords: ["manufacturer", "brand", "سازنده", "برند"],
    priority: 8,
  },
  model: {
    variants: ["مدل", "model", "type", "تیپ", "نوع", "مدل دستگاه"],
    keywords: ["model", "مدل"],
    priority: 8,
  },
  serialNumber: {
    variants: ["سریال", "شماره سریال", "serial", "serial number", "serial no", "s/n", "sn", "سریال نامبر"],
    keywords: ["serial", "سریال", "sn"],
    priority: 9,
  },
  yearManufactured: {
    variants: ["سال ساخت", "year", "year manufactured", "manufacturing year", "سال تولید", "سال", "manufacturing date", "تاریخ ساخت"],
    keywords: ["year", "سال"],
    dataPattern: /^(1[3-4]\d{2}|19\d{2}|20\d{2})$/,
    priority: 7,
  },
  yearInstalled: {
    variants: ["سال نصب", "install year", "installation year", "سال بهره‌برداری", "تاریخ نصب"],
    keywords: ["install", "نصب"],
    dataPattern: /^(1[3-4]\d{2}|19\d{2}|20\d{2})$/,
    priority: 7,
  },
  location: {
    variants: ["موقعیت", "محل", "location", "place", "محل نصب", "position", "کارگاه", "سالن", "خط تولید", "بخش"],
    keywords: ["location", "محل", "موقعیت"],
    priority: 7,
  },
  status: {
    variants: ["وضعیت", "status", "state", "condition", "وضعیت فعلی"],
    keywords: ["status", "وضعیت"],
    priority: 6,
  },
  criticality: {
    variants: ["بحرانیت", "اهمیت", "criticality", "priority", "importance", "درجه اهمیت", "سطح بحرانیت"],
    keywords: ["critical", "priority", "بحرانی", "اهمیت"],
    priority: 6,
  },
  healthScore: {
    variants: ["سلامت", "امتیاز سلامت", "health", "health score", "condition score", "درصد سلامت", "score"],
    keywords: ["health", "سلامت", "score"],
    dataPattern: /^(100|[0-9]{1,2}(\.\d+)?)%?$/,
    priority: 5,
  },
  purchasePrice: {
    variants: ["قیمت", "قیمت خرید", "price", "cost", "purchase price", "ارزش", "value", "بها"],
    keywords: ["price", "cost", "قیمت", "بها"],
    dataPattern: /^\d+([\.,]\d+)*$/,
    priority: 5,
  },
  parentCode: {
    variants: ["کد والد", "parent", "parent code", "کد پدر", "زیرمجموعه", "belongs to"],
    keywords: ["parent", "والد"],
    priority: 6,
  },
  typeKey: {
    variants: ["نوع", "type", "category", "دسته", "نوع تجهیز", "asset type", "دسته‌بندی"],
    keywords: ["type", "نوع", "category"],
    priority: 5,
  },
  supplier: {
    variants: ["تامین‌کننده", "supplier", "vendor", "فروشنده"],
    keywords: ["supplier", "تامین"],
    priority: 4,
  },
  warrantyEnd: {
    variants: ["گارانتی", "warranty", "پایان گارانتی", "warranty end"],
    keywords: ["warranty", "گارانتی"],
    priority: 3,
  },
};

// Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Similarity score 0-1
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// Normalize Persian/Arabic characters
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[‌\s\-_.]+/g, " ")
    .replace(/[^\w\sا-ی]/g, "");
}

// Detect a single column
function detectColumn(header: string, values: any[]): { field: string; confidence: number; reason: string } | null {
  const normalized = normalize(header);
  const sampleValues = values.slice(0, 5).map(v => String(v || "")).filter(Boolean);

  let bestMatch: { field: string; confidence: number; reason: string } | null = null;

  for (const [field, config] of Object.entries(FIELD_ALIASES)) {
    let confidence = 0;
    let reason = "";

    // Exact variant match
    for (const variant of config.variants) {
      const normalizedVariant = normalize(variant);
      if (normalized === normalizedVariant) {
        confidence = 1.0;
        reason = `مطابقت دقیق با "${variant}"`;
        break;
      }
      // Contains
      if (normalized.includes(normalizedVariant) || normalizedVariant.includes(normalized)) {
        const sim = 0.85;
        if (sim > confidence) {
          confidence = sim;
          reason = `شامل کلمه "${variant}"`;
        }
      }
      // Fuzzy match
      const sim = similarity(normalized, normalizedVariant);
      if (sim > 0.8 && sim > confidence) {
        confidence = sim * 0.9;
        reason = `شباهت ${Math.round(sim * 100)}% با "${variant}"`;
      }
    }

    // Keyword match
    for (const kw of config.keywords) {
      if (normalized.includes(normalize(kw))) {
        const sim = 0.75;
        if (sim > confidence) {
          confidence = sim;
          reason = `شامل کلیدواژه "${kw}"`;
        }
      }
    }

    // Data pattern match
    if (config.dataPattern && sampleValues.length > 0) {
      const matches = sampleValues.filter(v => config.dataPattern!.test(String(v).trim())).length;
      const ratio = matches / sampleValues.length;
      if (ratio >= 0.6) {
        const patternConfidence = 0.7 + ratio * 0.2;
        if (patternConfidence > confidence) {
          confidence = patternConfidence;
          reason = `الگوی داده‌ها (${Math.round(ratio * 100)}%) با فیلد "${field}" مطابقت دارد`;
        } else if (confidence > 0.5) {
          // Boost existing match with pattern confirmation
          confidence = Math.min(1, confidence + 0.1);
          reason += ` + الگوی داده‌ها تایید می‌کند`;
        }
      }
    }

    if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { field, confidence, reason };
    }
  }

  return bestMatch && bestMatch.confidence >= 0.5 ? bestMatch : null;
}

// Main detection function
export function detectColumns(
  headers: string[],
  rows: Record<string, any>[]
): DetectedField[] {
  const detected: DetectedField[] = [];
  const usedFields = new Set<string>();

  // First pass: detect all
  const candidates = headers.map(header => {
    const values = rows.map(r => r[header]);
    const detection = detectColumn(header, values);
    return { header, detection, values };
  });

  // Sort by confidence
  candidates.sort((a, b) => (b.detection?.confidence || 0) - (a.detection?.confidence || 0));

  // Assign fields (highest confidence wins)
  for (const { header, detection, values } of candidates) {
    if (!detection) {
      detected.push({
        sourceColumn: header,
        targetField: "",
        confidence: 0,
        reason: "تشخیص داده نشد",
        sampleValues: values.slice(0, 3).map(v => String(v || "")).filter(Boolean),
      });
      continue;
    }

    if (usedFields.has(detection.field)) {
      // Field already taken, try to find another
      detected.push({
        sourceColumn: header,
        targetField: "",
        confidence: 0,
        reason: `فیلد "${detection.field}" قبلاً تخصیص یافته`,
        sampleValues: values.slice(0, 3).map(v => String(v || "")).filter(Boolean),
      });
      continue;
    }

    usedFields.add(detection.field);
    detected.push({
      sourceColumn: header,
      targetField: detection.field,
      confidence: detection.confidence,
      reason: detection.reason,
      sampleValues: values.slice(0, 3).map(v => String(v || "")).filter(Boolean),
    });
  }

  // Return in original header order
  return headers.map(h => detected.find(d => d.sourceColumn === h)!);
}

// Validate a row of data
export interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: "error" | "warning";
}

export function validateRows(
  rows: Record<string, any>[],
  mapping: Record<string, string> // sourceCol -> targetField
): ValidationError[] {
  const errors: ValidationError[] = [];
  const codesSeen = new Set<string>();

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // +1 for header, +1 for 1-indexed

    // Check required fields
    let hasCode = false;
    let hasName = false;

    for (const [source, target] of Object.entries(mapping)) {
      const value = row[source];

      if (target === "code") {
        if (!value) {
          errors.push({ row: rowNum, field: "code", message: "کد الزامی است", severity: "error" });
        } else {
          hasCode = true;
          const strVal = String(value).trim();
          if (codesSeen.has(strVal)) {
            errors.push({ row: rowNum, field: "code", message: `کد تکراری: ${strVal}`, severity: "error" });
          }
          codesSeen.add(strVal);
        }
      }

      if (target === "name" && !value) {
        errors.push({ row: rowNum, field: "name", message: "نام الزامی است", severity: "error" });
      } else if (target === "name" && value) {
        hasName = true;
      }

      if (target === "yearManufactured" && value) {
        const year = Number(value);
        if (isNaN(year) || year < 1300 || year > 2050) {
          errors.push({ row: rowNum, field: "yearManufactured", message: `سال معتبر نیست: ${value}`, severity: "warning" });
        }
      }

      if (target === "healthScore" && value !== undefined && value !== "") {
        const score = Number(String(value).replace("%", ""));
        if (isNaN(score) || score < 0 || score > 100) {
          errors.push({ row: rowNum, field: "healthScore", message: `امتیاز سلامت باید 0-100 باشد`, severity: "warning" });
        }
      }
    }

    if (!hasCode) errors.push({ row: rowNum, field: "code", message: "فیلد کد یافت نشد", severity: "error" });
    if (!hasName) errors.push({ row: rowNum, field: "name", message: "فیلد نام یافت نشد", severity: "error" });
  });

  return errors;
}

// Transform row using mapping
export function transformRow(
  row: Record<string, any>,
  mapping: Record<string, string>
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [source, target] of Object.entries(mapping)) {
    if (target && row[source] !== undefined) {
      const value = row[source];
      // Type coercion
      if (target === "yearManufactured" || target === "yearInstalled") {
        result[target] = Number(value) || undefined;
      } else if (target === "healthScore" || target === "purchasePrice") {
        result[target] = Number(String(value).replace(/[,%]/g, "")) || 0;
      } else if (target === "status") {
        const s = String(value).trim().toLowerCase();
        result[target] = s.includes("فعال") || s === "active" ? "active" :
                          s.includes("تعمیر") || s === "maintenance" ? "maintenance" :
                          s.includes("خراب") || s === "failed" ? "failed" : "inactive";
      } else if (target === "criticality") {
        const s = String(value).trim().toLowerCase();
        result[target] = s.includes("بحرانی") || s === "critical" ? "critical" :
                          s.includes("بالا") || s === "high" ? "high" :
                          s.includes("متوسط") || s === "medium" ? "medium" :
                          s.includes("پایین") || s === "low" ? "low" : "medium";
      } else {
        result[target] = String(value).trim();
      }
    }
  }
  return result;
}

// Field labels for UI
export const FIELD_LABELS: Record<string, string> = {
  code: "کد تجهیز",
  name: "نام",
  nameEn: "نام انگلیسی",
  manufacturer: "سازنده",
  model: "مدل",
  serialNumber: "شماره سریال",
  yearManufactured: "سال ساخت",
  yearInstalled: "سال نصب",
  location: "موقعیت",
  status: "وضعیت",
  criticality: "بحرانیت",
  healthScore: "امتیاز سلامت",
  purchasePrice: "قیمت خرید",
  parentCode: "کد والد",
  typeKey: "نوع",
  supplier: "تامین‌کننده",
  warrantyEnd: "پایان گارانتی",
};

// Available fields for manual mapping
export const AVAILABLE_FIELDS = Object.keys(FIELD_ALIASES);
