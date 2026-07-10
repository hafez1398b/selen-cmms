"use client";

import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
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
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

      const parsedSheets: SheetData[] = workbook.SheetNames.map(name => {
        const ws = workbook.Sheets[name];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
          defval: "",
          raw: false,
        });
        const headers = json.length > 0 ? Object.keys(json[0]) : [];
        return { name, headers, rows: json, rowCount: json.length };
      }).filter(s => s.rowCount > 0);

      if (parsedSheets.length === 0) {
        toast.error("خطا", "هیچ داده‌ای در فایل یافت نشد");
        reset();
        return;
      }

      setSheets(parsedSheets);
      // Auto-select sheet with most data
      const biggestSheet = parsedSheets.reduce((max, s) => s.rowCount > max.rowCount ? s : max);
      setSelectedSheet(biggestSheet.name);

      // Run AI detection
      setTimeout(() => {
        const detected = detectColumns(biggestSheet.headers, biggestSheet.rows);
        setDetectedFields(detected);
        const autoMapping: Record<string, string> = {};
        detected.forEach(d => {
          if (d.confidence >= 0.5) {
            autoMapping[d.sourceColumn] = d.targetField;
          }
        });
        setMapping(autoMapping);
        setStep("mapping");

        const autoDetected = detected.filter(d => d.confidence >= 0.5).length;
        toast.success(
          "تحلیل هوشمند تکمیل شد",
          `${autoDetected} از ${detected.length} ستون به‌صورت خودکار تشخیص داده شد`
        );
      }, 1500);
    } catch (err) {
      toast.error("خطا در خواندن فایل", String(err));
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

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    const sheet = sheets.find(s => s.name === sheetName);
    if (!sheet) return;
    const detected = detectColumns(sheet.headers, sheet.rows);
    setDetectedFields(detected);
    const autoMapping: Record<string, string> = {};
    detected.forEach(d => {
      if (d.confidence >= 0.5) autoMapping[d.sourceColumn] = d.targetField;
    });
    setMapping(autoMapping);
  };

  const handleMappingChange = (source: string, target: string) => {
    setMapping(prev => ({ ...prev, [source]: target }));
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

    // Simulate import progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setImportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setStep("done");
        setTimeout(() => {
          onImportComplete?.(transformed);
          toast.success("Import موفقیت‌آمیز", `${transformed.length} تجهیز به سامانه اضافه شد`);
          handleClose();
        }, 2000);
      }
    }, 100);
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

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-amber-600 dark:text-amber-500 text-sm md:text-base">
                Import هوشمند از Excel
              </h3>
              <p className="text-[10px] text-gray-500">تحلیل و نگاشت خودکار با AI</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-3 border-b border-gray-200 dark:border-[#1a1a1a] bg-gray-50 dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-1">
            {[
              { id: "upload", label: "بارگذاری" },
              { id: "analyzing", label: "تحلیل AI" },
              { id: "mapping", label: "نگاشت فیلدها" },
              { id: "preview", label: "پیش‌نمایش" },
              { id: "importing", label: "ورود اطلاعات" },
            ].map((s, i, arr) => {
              const currentIdx = ["upload", "analyzing", "mapping", "preview", "importing", "done"].indexOf(step);
              const stepIdx = ["upload", "analyzing", "mapping", "preview", "importing"].indexOf(s.id);
              const isActive = step === s.id;
              const isDone = stepIdx < currentIdx;
              return (
                <div key={s.id} className="flex-1 flex items-center gap-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      isDone ? 'bg-green-500 text-white' :
                      isActive ? 'bg-amber-500 text-[#0a0a0a] animate-pulse-glow' :
                      'bg-gray-200 dark:bg-[#1a1a1a] text-gray-400'
                    }`}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className={`text-[9px] hidden md:inline ${isActive ? 'font-bold text-amber-600 dark:text-amber-500' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                  {i < arr.length - 1 && (
                    <div className={`flex-1 h-0.5 ${stepIdx < currentIdx ? 'bg-green-500' : 'bg-gray-200 dark:bg-[#1a1a1a]'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* STEP: Upload */}
          {step === "upload" && (
            <div className="animate-fade-in space-y-4">
              <label
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-12 cursor-pointer transition-all ${
                  dragOver
                    ? 'border-amber-500 bg-amber-500/10 scale-[1.02]'
                    : 'border-gray-300 dark:border-[#2a2a2a] hover:border-amber-500'
                }`}
              >
                <Upload className={`w-14 h-14 mb-3 transition-transform ${dragOver ? 'scale-110 text-amber-500' : 'text-gray-400'}`} />
                <p className="text-sm font-bold">فایل Excel را اینجا رها کنید</p>
                <p className="text-xs text-gray-500 mt-1">یا کلیک کنید</p>
                <p className="text-[10px] text-gray-500 mt-3">.xlsx, .xls, .csv (حداکثر ۱۰ مگابایت)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
              </label>

              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-purple-600 dark:text-purple-400 mb-2">💡 AI چه کارهایی می‌کند؟</p>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>✓ فایل Excel را به‌صورت واقعی می‌خواند</li>
                      <li>✓ ستون‌های فارسی و انگلیسی را تشخیص می‌دهد</li>
                      <li>✓ نام‌های مختلف را نگاشت می‌کند (کد، شماره، Code، ID)</li>
                      <li>✓ الگوی داده را تحلیل می‌کند</li>
                      <li>✓ خطاها و تکراری‌ها را شناسایی می‌کند</li>
                      <li>✓ پیش‌نمایش قبل از ثبت نهایی</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-xs">
                <p className="font-bold text-blue-600 dark:text-blue-400 mb-2">📋 نمونه ساختار فایل Excel:</p>
                <div className="overflow-x-auto bg-white dark:bg-[#0a0a0a] rounded-lg p-2">
                  <table className="w-full text-[10px] font-mono">
                    <thead className="border-b border-gray-200 dark:border-[#1a1a1a]">
                      <tr>
                        <th className="p-1 text-right">کد</th>
                        <th className="p-1 text-right">نام تجهیز</th>
                        <th className="p-1 text-right">سازنده</th>
                        <th className="p-1 text-right">مدل</th>
                        <th className="p-1 text-right">سال ساخت</th>
                        <th className="p-1 text-right">محل</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-500">
                      <tr>
                        <td className="p-1">MX-101</td>
                        <td className="p-1">میکسر اصلی</td>
                        <td className="p-1">Cannon</td>
                        <td className="p-1">A80</td>
                        <td className="p-1">2019</td>
                        <td className="p-1">سالن ۱</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Analyzing */}
          {step === "analyzing" && (
            <div className="text-center py-16 animate-fade-in">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-white dark:bg-[#111] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              </div>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-500">در حال تحلیل با AI...</p>
              <div className="mt-6 space-y-2 max-w-xs mx-auto text-xs text-gray-500">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>خواندن فایل Excel</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>شناسایی شیت‌ها</span>
                </div>
                <div className="flex items-center gap-2 justify-center text-amber-500 font-bold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>تشخیص هوشمند ستون‌ها...</span>
                </div>
                <div className="flex items-center gap-2 justify-center opacity-40">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  <span>تحلیل الگوی داده</span>
                </div>
                <div className="flex items-center gap-2 justify-center opacity-40">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  <span>نگاشت به فیلدها</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Mapping */}
          {step === "mapping" && currentSheet && (
            <div className="animate-fade-in space-y-4">
              {/* File info */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-green-600 dark:text-green-500">فایل با موفقیت خوانده شد</p>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                    <FileSpreadsheet className="inline w-3 h-3" /> {file?.name}
                    {" • "}
                    <strong>{currentSheet.rowCount}</strong> رکورد
                    {" • "}
                    <strong>{currentSheet.headers.length}</strong> ستون
                    {" • "}
                    <strong className="text-amber-500">{mappedCount}</strong> نگاشت خودکار
                  </p>
                </div>
              </div>

              {/* Sheet selector */}
              {sheets.length > 1 && (
                <div>
                  <label className="text-xs font-bold mb-1 block">شیت انتخابی:</label>
                  <select
                    value={selectedSheet}
                    onChange={e => handleSheetChange(e.target.value)}
                    className="select-field"
                  >
                    {sheets.map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.rowCount} رکورد)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mapping table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold">نگاشت ستون‌ها به فیلدها:</p>
                  <button
                    onClick={() => {
                      const auto: Record<string, string> = {};
                      detectedFields.forEach(d => {
                        if (d.confidence >= 0.5) auto[d.sourceColumn] = d.targetField;
                      });
                      setMapping(auto);
                      toast.info("بازنشانی", "نگاشت به حالت خودکار برگردانده شد");
                    }}
                    className="text-[10px] text-amber-500 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    بازنشانی خودکار
                  </button>
                </div>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                  {detectedFields.map(field => {
                    const confColor =
                      field.confidence >= 0.9 ? "#22c55e" :
                      field.confidence >= 0.7 ? "#3b82f6" :
                      field.confidence >= 0.5 ? "#f59e0b" : "#6b7280";
                    return (
                      <div
                        key={field.sourceColumn}
                        className={`p-2 rounded-lg border transition-all ${
                          mapping[field.sourceColumn]
                            ? 'border-gray-200 dark:border-[#1a1a1a] bg-gray-50/50 dark:bg-[#0a0a0a]'
                            : 'border-red-500/30 bg-red-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {/* Source */}
                          <div className="w-32 md:w-40 flex-shrink-0">
                            <p className="text-xs font-bold truncate" title={field.sourceColumn}>
                              {field.sourceColumn}
                            </p>
                            {field.sampleValues.length > 0 && (
                              <p className="text-[9px] text-gray-500 truncate mt-0.5" dir="auto">
                                نمونه: {field.sampleValues[0]}
                              </p>
                            )}
                          </div>

                          {/* Arrow */}
                          <ChevronLeft className="w-3 h-3 text-gray-400 flex-shrink-0" />

                          {/* Target select */}
                          <select
                            value={mapping[field.sourceColumn] || ""}
                            onChange={e => handleMappingChange(field.sourceColumn, e.target.value)}
                            className="select-field !py-1 !text-xs flex-1 min-w-0"
                          >
                            <option value="">-- نگاشت نشده --</option>
                            {AVAILABLE_FIELDS.map(f => (
                              <option key={f} value={f}>
                                {FIELD_LABELS[f]}
                              </option>
                            ))}
                          </select>

                          {/* Confidence */}
                          {field.confidence > 0 && (
                            <div className="flex-shrink-0" title={field.reason}>
                              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: confColor + '20' }}>
                                <Sparkles className="w-2.5 h-2.5" style={{ color: confColor }} />
                                <span className="text-[9px] font-bold" style={{ color: confColor }}>
                                  {Math.round(field.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        {field.reason && field.confidence > 0 && (
                          <p className="text-[9px] text-gray-500 mt-1 mr-32 md:mr-40">
                            💡 {field.reason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {!hasRequiredMapping && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">
                    فیلدهای <strong>کد</strong> و <strong>نام</strong> الزامی هستند. لطفاً ستون‌های مربوطه را نگاشت کنید.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP: Preview */}
          {step === "preview" && currentSheet && (
            <div className="animate-fade-in space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">آماده ثبت</p>
                  <p className="text-2xl font-black text-green-500 mt-1">{currentSheet.rowCount - errorCount}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">هشدار</p>
                  <p className="text-2xl font-black text-amber-500 mt-1">{warningCount}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">خطا</p>
                  <p className="text-2xl font-black text-red-500 mt-1">{errorCount}</p>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="border border-gray-200 dark:border-[#1a1a1a] rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] p-2 border-b border-gray-200 dark:border-[#1a1a1a]">
                    <p className="text-xs font-bold">مشکلات یافت شده ({errors.length})</p>
                  </div>
                  <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                    {errors.slice(0, 20).map((err, i) => (
                      <div key={i} className={`flex items-start gap-2 text-xs p-1.5 rounded ${err.severity === 'error' ? 'bg-red-500/5' : 'bg-amber-500/5'}`}>
                        {err.severity === "error" ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="flex-1">
                          <strong>ردیف {err.row}:</strong> {err.message}
                        </span>
                      </div>
                    ))}
                    {errors.length > 20 && (
                      <p className="text-[10px] text-gray-500 text-center py-2">
                        و {errors.length - 20} مشکل دیگر...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Preview Data */}
              <div className="border border-gray-200 dark:border-[#1a1a1a] rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-[#0a0a0a] p-2 border-b border-gray-200 dark:border-[#1a1a1a]">
                  <p className="text-xs font-bold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    پیش‌نمایش (۵ ردیف اول)
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead className="bg-gray-50 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#1a1a1a]">
                      <tr>
                        {Object.entries(mapping).filter(([_, t]) => t).map(([source, target]) => (
                          <th key={source} className="p-2 text-right whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-amber-500 font-bold">{FIELD_LABELS[target] || target}</span>
                              <span className="text-[9px] text-gray-500 font-normal">← {source}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSheet.rows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-[#0a0a0a]">
                          {Object.entries(mapping).filter(([_, t]) => t).map(([source, target]) => (
                            <td key={source} className="p-2 whitespace-nowrap" dir="auto">
                              {String(row[source] ?? "-")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Importing */}
          {step === "importing" && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-white animate-pulse" />
              </div>
              <p className="text-lg font-bold mb-3">در حال ثبت اطلاعات...</p>
              <div className="max-w-xs mx-auto">
                <div className="progress-bar">
                  <div className="progress-fill bg-gradient-to-l from-amber-500 to-amber-700" style={{ width: `${importProgress}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-2">{importProgress}%</p>
              </div>
            </div>
          )}

          {/* STEP: Done */}
          {step === "done" && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-lg font-bold text-green-500 mb-1">Import موفقیت‌آمیز!</p>
              <p className="text-xs text-gray-500">در حال بستن...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "mapping" && (
          <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
            <button onClick={reset} className="btn-secondary flex-1 justify-center">
              → شروع مجدد
            </button>
            <button
              onClick={handleValidate}
              disabled={!hasRequiredMapping}
              className="btn-primary flex-1 justify-center disabled:opacity-40"
            >
              بررسی و پیش‌نمایش
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === "preview" && (
          <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
            <button onClick={() => setStep("mapping")} className="btn-secondary flex-1 justify-center">
              → ویرایش نگاشت
            </button>
            <button
              onClick={handleImport}
              disabled={errorCount > 0}
              className="btn-primary flex-1 justify-center disabled:opacity-40"
              title={errorCount > 0 ? "ابتدا خطاها را برطرف کنید" : ""}
            >
              <Zap className="w-4 h-4" />
              ثبت {currentSheet ? currentSheet.rowCount - errorCount : 0} تجهیز
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
