"use client";

import { useState, useRef, useCallback } from "react";
import {
  X, Upload, Sparkles, FileSpreadsheet, CheckCircle2, Loader2,
  ChevronLeft, AlertCircle, AlertTriangle, Zap, RefreshCw, Eye,
  Download, ArrowRight
} from "lucide-react";
import {
  detectColumns, validateRows, transformRow,
  FIELD_LABELS, AVAILABLE_FIELDS,
  type DetectedField, type ValidationError
} from "@/lib/ai-column-detector";
import { parseFile } from "@/lib/excel-parser";
import { useToast } from "@/components/ui/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (data: Record<string, any>[]) => void;
}

type Step = "upload" | "analyzing" | "mapping" | "preview" | "importing" | "done";

interface SheetData {
  name: string;
  headers: string[];
  rows: Record<string, any>[];
  rowCount: number;
}

export function AssetImportModal({ isOpen, onClose, onImportComplete }: Props) {
  const toast = useToast();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentSheet = sheets.find(s => s.name === selectedSheet);

  const reset = () => {
    setStep("upload");
    setFile(null);
    setSheets([]);
    setSelectedSheet("");
    setDetectedFields([]);
    setMapping({});
    setErrors([]);
    setImportProgress(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const readFile = useCallback(async (uploadedFile: File) => {
    setFile(uploadedFile);
    setStep("analyzing");

    try {
      const parsedSheets = await parseFile(uploadedFile);

      if (parsedSheets.length === 0) {
        toast.error("خطا", "هیچ داده‌ای در فایل یافت نشد");
        reset();
        return;
      }

      setSheets(parsedSheets);
      const biggestSheet = parsedSheets.reduce((max, s) => s.rowCount > max.rowCount ? s : max);
      setSelectedSheet(biggestSheet.name);

      setTimeout(() => {
        const detected = detectColumns(biggestSheet.headers, biggestSheet.rows);
        setDetectedFields(detected);
        const autoMapping: Record<string, string> = {};
        detected.forEach(d => {
          if (d.confidence >= 0.5) autoMapping[d.sourceColumn] = d.targetField;
        });
        setMapping(autoMapping);
        setStep("mapping");

        const autoDetected = detected.filter(d => d.confidence >= 0.5).length;
        toast.success("تحلیل تکمیل شد", `${autoDetected} از ${detected.length} ستون تشخیص داده شد`);
      }, 1200);
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error("خطا در خواندن فایل", err.message || "فایل معتبر نیست");
      reset();
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) readFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      if (!f.name.match(/\.(xlsx?|csv)$/i)) {
        toast.error("فرمت نامعتبر", "لطفاً فایل Excel یا CSV بارگذاری کنید");
        return;
      }
      readFile(f);
    }
  };

  const handleValidate = () => {
    if (!currentSheet) return;
    const validationErrors = validateRows(currentSheet.rows, mapping);
    setErrors(validationErrors);
    setStep("preview");
  };

  const handleImport = () => {
    if (!currentSheet) return;
    setStep("importing");
    setImportProgress(0);
    const transformed = currentSheet.rows.map(r => transformRow(r, mapping));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setImportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setStep("done");
        setTimeout(() => {
          onImportComplete?.(transformed);
          toast.success("Import موفق", `${transformed.length} تجهیز به سامانه اضافه شد`);
          handleClose();
        }, 1500);
      }
    }, 80);
  };

  const mappedCount = Object.values(mapping).filter(Boolean).length;
  const hasRequiredMapping = Object.values(mapping).includes("code") && Object.values(mapping).includes("name");
  const errorCount = errors.filter(e => e.severity === "error").length;
  const warningCount = errors.filter(e => e.severity === "warning").length;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center md:p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full md:max-w-4xl max-h-[95vh] overflow-hidden bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" />
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-amber-600 dark:text-amber-500 text-sm md:text-base">Import هوشمند از Excel</h3>
              <p className="text-[10px] text-gray-500">تحلیل و نگاشت خودکار با AI</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === "upload" && (
            <div className="animate-fade-in space-y-4">
              <label
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-12 cursor-pointer transition-all ${
                  dragOver ? 'border-amber-500 bg-amber-500/10 scale-[1.02]' : 'border-gray-300 dark:border-[#2a2a2a] hover:border-amber-500'
                }`}
              >
                <Upload className={`w-14 h-14 mb-3 transition-transform ${dragOver ? 'scale-110 text-amber-500' : 'text-gray-400'}`} />
                <p className="text-sm font-bold">فایل Excel را اینجا رها کنید</p>
                <p className="text-xs text-gray-500 mt-1">یا کلیک کنید</p>
                <p className="text-[10px] text-gray-500 mt-3">.xlsx, .xls, .csv (حداکثر ۱۰ مگابایت)</p>
                <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
              </label>

              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-purple-600 dark:text-purple-400 mb-2">💡 AI چه کارهایی می‌کند؟</p>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>✓ فایل Excel را واقعی می‌خواند</li>
                      <li>✓ ستون‌های فارسی و انگلیسی را تشخیص می‌دهد</li>
                      <li>✓ خطاها و تکراری‌ها را شناسایی می‌کند</li>
                      <li>✓ پیش‌نمایش قبل از ثبت نهایی</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "analyzing" && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles className="w-10 h-10 text-white animate-spin" />
              </div>
              <p className="text-lg font-bold text-amber-500">در حال تحلیل با AI...</p>
              <p className="text-xs text-gray-500 mt-2">تشخیص هوشمند ستون‌ها</p>
            </div>
          )}

          {step === "mapping" && currentSheet && (
            <div className="animate-fade-in space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-green-600 dark:text-green-500">فایل خوانده شد</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{currentSheet.rowCount} رکورد • {currentSheet.headers.length} ستون • {mappedCount} نگاشت خودکار</p>
                </div>
              </div>

              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                {detectedFields.map(field => {
                  const confColor = field.confidence >= 0.9 ? "#22c55e" : field.confidence >= 0.7 ? "#3b82f6" : field.confidence >= 0.5 ? "#f59e0b" : "#6b7280";
                  return (
                    <div key={field.sourceColumn} className={`p-2 rounded-lg border ${mapping[field.sourceColumn] ? 'border-gray-200 dark:border-[#1a1a1a]' : 'border-red-500/30 bg-red-500/5'}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-32 md:w-40 flex-shrink-0">
                          <p className="text-xs font-bold truncate">{field.sourceColumn}</p>
                          {field.sampleValues.length > 0 && (
                            <p className="text-[9px] text-gray-500 truncate mt-0.5">نمونه: {field.sampleValues[0]}</p>
                          )}
                        </div>
                        <ChevronLeft className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <select
                          value={mapping[field.sourceColumn] || ""}
                          onChange={e => setMapping({ ...mapping, [field.sourceColumn]: e.target.value })}
                          className="select-field !py-1 !text-xs flex-1 min-w-0"
                        >
                          <option value="">-- نگاشت نشده --</option>
                          {AVAILABLE_FIELDS.map(f => <option key={f} value={f}>{FIELD_LABELS[f]}</option>)}
                        </select>
                        {field.confidence > 0 && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: confColor + '20' }}>
                            <Sparkles className="w-2.5 h-2.5" style={{ color: confColor }} />
                            <span className="text-[9px] font-bold" style={{ color: confColor }}>{Math.round(field.confidence * 100)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!hasRequiredMapping && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">فیلدهای <strong>کد</strong> و <strong>نام</strong> الزامی هستند.</p>
                </div>
              )}
            </div>
          )}

          {step === "preview" && currentSheet && (
            <div className="animate-fade-in space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">آماده ثبت</p>
                  <p className="text-2xl font-black text-green-500 mt-1">{currentSheet.rowCount - errorCount}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">هشدار</p>
                  <p className="text-2xl font-black text-amber-500 mt-1">{warningCount}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">خطا</p>
                  <p className="text-2xl font-black text-red-500 mt-1">{errorCount}</p>
                </div>
              </div>

              {errors.length > 0 && (
                <div className="border border-gray-200 dark:border-[#1a1a1a] rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] p-2">
                    <p className="text-xs font-bold">مشکلات ({errors.length})</p>
                  </div>
                  <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                    {errors.slice(0, 20).map((err, i) => (
                      <div key={i} className="text-xs">
                        <strong>ردیف {err.row}:</strong> {err.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "importing" && (
            <div className="text-center py-16 animate-fade-in">
              <Zap className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
              <p className="text-lg font-bold mb-3">در حال ثبت...</p>
              <div className="max-w-xs mx-auto">
                <div className="progress-bar"><div className="progress-fill bg-gradient-to-l from-amber-500 to-amber-700" style={{ width: `${importProgress}%` }} /></div>
                <p className="text-xs text-gray-500 mt-2">{importProgress}%</p>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-16 animate-fade-in">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-bold text-green-500">Import موفقیت‌آمیز!</p>
            </div>
          )}
        </div>

        {step === "mapping" && (
          <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
            <button onClick={reset} className="btn-secondary flex-1 justify-center">→ شروع مجدد</button>
            <button onClick={handleValidate} disabled={!hasRequiredMapping} className="btn-primary flex-1 justify-center disabled:opacity-40">
              بررسی و پیش‌نمایش <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
        {step === "preview" && (
          <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
            <button onClick={() => setStep("mapping")} className="btn-secondary flex-1 justify-center">→ ویرایش</button>
            <button onClick={handleImport} disabled={errorCount > 0} className="btn-primary flex-1 justify-center disabled:opacity-40">
              <Zap className="w-4 h-4" />
              ثبت {currentSheet ? currentSheet.rowCount - errorCount : 0} تجهیز
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
