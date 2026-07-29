export interface OCRResult {
  text: string;
  confidence: number;
  source: string;
  extractedFields?: Record<string, string>;
}

export function extractFromFile(file: File | Buffer): OCRResult {
  return { text: "", confidence: 0, source: "file" };
}

export function extractFromImage(file: File | Buffer): OCRResult {
  return { text: "", confidence: 0, source: "image" };
}

export function extractFromPDF(file: File | Buffer): OCRResult {
  return { text: "", confidence: 0, source: "pdf" };
}
