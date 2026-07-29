"use client";

import { useState, useRef } from "react";
import {
  X, Upload, FileSpreadsheet, FileText, Image as ImageIcon,
  Sparkles, CheckCircle2, Loader2, ChevronLeft, AlertCircle,
  Camera, Brain, ArrowRight, Zap, Eye, RefreshCw, Save, Edit2
} from "lucide-react";
import { parseFile, type ParsedSheet } from "@/lib/excel-parser";
import { extractFromFile, extractFromImage, extractFromPDF, type OCRResult } from "@/lib/ocr-parser";
import { detectColumns, validateRows, transformRow, FIELD_LABELS, AVAILABLE_FIELDS, type DetectedField } from "@/lib/ai-column-detector";
import { useToast } from "@/components/ui/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (data: any[]) => void;
}

type SourceType = "excel" | "pdf" | "image" | "manual";
type Step = "select_source" | "upload" | "processing" | "review" | "map" | "preview" | "done";

export function SmartImportGateway({ isOpen, onClose, onImportComplete }: Props) {
  const toast = useToast();
  const [step, setStep] = useState<Step>("select_source");
  const [source, setSource] = useState<SourceType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Excel data
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);

  // OCR data
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, any>>({});

  if (!isOpen) return null;

  const currentSheet = sheets.find(s => s.name === selectedSheet);

  const reset = () => {
    setStep("select_source");
    setSource(null);
    setFile(null);
    setSheets([]);
    setSelectedSheet("");
    setDetectedFields([]);
    setMapping({});
    setOcrResult(null);
    setEditedFields({});
    setProgress(0);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSourceSelect = (s: SourceType) => {
    setSource(s);
    setStep("upload");
  };

  const handleFile = async (f: File) => {
    setFile(f);
    setStep("processing");
    try {
      if (source === "excel") {
        const parsed = await parseFile(f);
        if (parsed.length === 0) throw new Error("داده‌ای یافت نشد");
        setSheets(parsed);
        const biggest = parsed.reduce((max, s) => s.rowCount > max.rowCount ? s : max);
        setSelectedSheet(biggest.name);
        const detected = detectColumns(biggest.headers, biggest.rows);
        setDetectedFields(detected);
        const autoMap: Record<string, string> = {};
        detected.forEach(d => { if (d.confidence >= 0.5) autoMap[d.sourceColumn] = d.targetField; });
        setMapping(autoMap);
        setStep("map");
        toast.success("تحلیل شد", `${detected.filter(d => d.confidence >= 0.5).length} ستون تشخیص داده شد`);
      } else if (source === "pdf" || source === "image") {
        const result = source === "image" ? await extractFromImage(f) : await extractFromPDF(f);
        setOcrResult(result);
        setEditedFields(result.extractedFields || {});
        setStep("review");
        toast.success("استخراج شد", `اطلاعات با ${result.confidence}% اطمینان استخراج شد`);
      }
    } catch (err: any) {
      toast.error("خطا", err.message || "خطا در پردازش فایل");
      reset();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleImportExcel = () => {
    if (!currentSheet) return;
    setStep("preview");
    setProgress(0);
    let p = 0;
    const timer = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        const data = currentSheet.rows.map(r => transformRow(r, mapping));
        onImportComplete?.(data);
        setStep("done");
        setTimeout(() => {
          toast.success("موفق", `${data.length} تجهیز ثبت شد`);
          handleClose();
        }, 1500);
      }
    }, 80);
  };

  const handleSaveOCR = () => {
    setStep("done");
    setTimeout(() => {
      onImportComplete?.([editedFields]);
      toast.success("موفق", "تجهیز از فایل OCR ثبت شد");
      handleClose();
    }, 1000);
  };

  const sources = [
    { id: "excel" as const, label: "فایل Excel / CSV", icon: FileSpreadsheet, color: "#22c55e", desc: "ورود گروهی از جدول اکسل" },
    { id: "pdf" as const, label: "شناسنامه PDF", icon: FileText, color: "#ef4444", desc: "استخراج از فایل شناسنامه" },
    { id: "image" as const, label: "تصویر نامپلیت", icon: ImageIcon, color: "#8b5cf6", desc: "OCR از عکس تجهیز" },
    { id: "manual" as const, label: "ورود دستی", icon: Edit2, color: "#3b82f6", desc: "بدون فایل - فرم گام به گام" },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center md:p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full md:max-w-4xl max-h-[95vh] overflow-hidden bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="md:hidden flex justify-center pt-2"><div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" /></div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-amber-600 dark:text-amber-500">درگاه هوشمند ورود تجهیزات</h3>
              <p className="text-[10px] text-gray-500">استخراج و ثبت خودکار با AI</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"><X className="w-5 h-5" /></button>
        </div>

        {/* Progress */}
        {step !== "select_source" && (
          <div className="p-3 border-b border-gray-200 dark:border-[#1a1a1a] bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="flex items-center gap-2">
              {["انتخاب منبع", "بارگذاری", "پردازش AI", "بررسی", "ثبت نهایی"].map((label, i) => {
                const stepOrder = ["select_source", "upload", "processing", source === "excel" ? "map" : "review", "preview"];
                const currentIdx = stepOrder.indexOf(step === "done" ? "preview" : step);
                const isActive = stepOrder[i] === step || (step === "map" && i === 3) || (step === "review" && i === 3);
                const isDone = i < currentIdx || step === "done";
                return (
                  <div key={i} className="flex-1 flex items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-amber-500 text-[#0a0a0a] animate-pulse-glow' : 'bg-gray-200 dark:bg-[#1a1a1a] text-gray-400'}`}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    <span className={`text-[9px] hidden md:inline ${isActive ? 'font-bold text-amber-500' : 'text-gray-500'}`}>{label}</span>
                    {i < 4 && <div className={`flex-1 h-0.5 ${i < currentIdx ? 'bg-green-500' : 'bg-gray-200 dark:bg-[#1a1a1a]'}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 1: Source Selection */}
          {step === "select_source" && (
            <div className="animate-fade-in space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">منبع اطلاعات را انتخاب کنید</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sources.map(s => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSourceSelect(s.id)}
                      className="p-5 rounded-xl border-2 border-gray-200 dark:border-[#1a1a1a] hover:border-amber-500 hover:bg-amber-500/5 text-right transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: s.color + '20' }}>
                          <Icon className="w-7 h-7" style={{ color: s.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{s.label}</p>
                          <p className="text-[11px] text-gray-500 mt-1">{s.desc}</p>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <Brain className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-purple-600 dark:text-purple-400 mb-2">💡 قابلیت‌های AI سلن:</p>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      <li>✓ خواندن واقعی Excel (.xlsx, .csv)</li>
                      <li>✓ OCR تصویر نامپلیت (JPG, PNG)</li>
                      <li>✓ استخراج متن از PDF شناسنامه</li>
                      <li>✓ تشخیص هوشمند فیلدها (فارسی/انگلیسی)</li>
                      <li>✓ شناسایی برند، مدل، سریال، سال ساخت</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload */}
          {step === "upload" && source !== "manual" && (
            <div className="animate-fade-in space-y-4">
              <button onClick={() => setStep("select_source")} className="text-xs text-gray-500 hover:text-amber-500 flex items-center gap-1 mb-3">
                <ChevronLeft className="w-3 h-3 rotate-180" />
                تغییر منبع
              </button>

              <label
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-16 cursor-pointer transition-all ${
                  dragOver ? 'border-amber-500 bg-amber-500/10 scale-[1.02]' : 'border-gray-300 dark:border-[#2a2a2a] hover:border-amber-500'
                }`}
              >
                <Upload className={`w-16 h-16 mb-3 ${dragOver ? 'text-amber-500 scale-110' : 'text-gray-400'} transition-all`} />
                <p className="text-base font-bold">فایل را اینجا رها کنید</p>
                <p className="text-xs text-gray-500 mt-1">یا کلیک کنید</p>
                <div className="mt-4 flex items-center gap-2 text-[10px]">
                  {source === "excel" && <>
                    <FileSpreadsheet className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">.xlsx, .xls, .csv</span>
                  </>}
                  {source === "pdf" && <>
                    <FileText className="w-3 h-3 text-red-500" />
                    <span className="text-red-500">.pdf</span>
                  </>}
                  {source === "image" && <>
                    <ImageIcon className="w-3 h-3 text-purple-500" />
                    <span className="text-purple-500">.jpg, .png, .webp</span>
                  </>}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept={source === "excel" ? ".xlsx,.xls,.csv" : source === "pdf" ? ".pdf" : "image/*"}
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>

              {source === "image" && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <Camera className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>نکته:</strong> بهترین نتیجه با تصویر واضح و متمرکز از نامپلیت یا شناسنامه گرفته می‌شود. نور کافی و زاویه مستقیم توصیه می‌شود.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Processing */}
          {step === "processing" && (
            <div className="text-center py-16 animate-fade-in">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-white dark:bg-[#111] flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-amber-500 animate-spin" />
                </div>
              </div>
              <p className="text-lg font-bold text-amber-500 mb-2">AI سلن در حال پردازش...</p>
              <div className="mt-6 space-y-2 max-w-xs mx-auto text-xs text-gray-500">
                <p className="flex items-center gap-2 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  دریافت فایل
                </p>
                <p className="flex items-center gap-2 justify-center text-amber-500 font-bold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {source === "excel" ? "خواندن جدول و شناسایی ستون‌ها" : source === "pdf" ? "استخراج متن از PDF" : "پردازش OCR تصویر"}
                </p>
                <p className="flex items-center gap-2 justify-center opacity-40">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  تشخیص هوشمند فیلدها
                </p>
              </div>
            </div>
          )}

          {/* Step 4a: Excel Mapping */}
          {step === "map" && currentSheet && (
            <div className="animate-fade-in space-y-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-xs font-bold text-green-600 dark:text-green-500">✓ فایل خوانده شد</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {currentSheet.rowCount} رکورد • {currentSheet.headers.length} ستون
                </p>
              </div>

              <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
                {detectedFields.map(f => {
                  const confColor = f.confidence >= 0.9 ? "#22c55e" : f.confidence >= 0.5 ? "#f59e0b" : "#6b7280";
                  return (
                    <div key={f.sourceColumn} className="p-2 rounded-lg border border-gray-200 dark:border-[#1a1a1a] flex items-center gap-2">
                      <div className="w-32 md:w-40 flex-shrink-0">
                        <p className="text-xs font-bold truncate">{f.sourceColumn}</p>
                        {f.sampleValues[0] && <p className="text-[9px] text-gray-500 truncate">نمونه: {f.sampleValues[0]}</p>}
                      </div>
                      <ChevronLeft className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <select
                        value={mapping[f.sourceColumn] || ""}
                        onChange={e => setMapping({ ...mapping, [f.sourceColumn]: e.target.value })}
                        className="select-field !py-1 !text-xs flex-1 min-w-0"
                      >
                        <option value="">-- نگاشت نشده --</option>
                        {AVAILABLE_FIELDS.map(fname => <option key={fname} value={fname}>{FIELD_LABELS[fname]}</option>)}
                      </select>
                      {f.confidence > 0 && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: confColor + '20' }}>
                          <Sparkles className="w-2.5 h-2.5" style={{ color: confColor }} />
                          <span className="text-[9px] font-bold" style={{ color: confColor }}>{Math.round(f.confidence * 100)}%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4b: OCR Review */}
          {step === "review" && ocrResult && (
            <div className="animate-fade-in space-y-3">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 flex items-start gap-2">
                <Brain className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400">AI با {ocrResult.confidence}% اطمینان استخراج کرد</p>
                  <p className="text-[10px] text-gray-500 mt-1">لطفاً اطلاعات را بررسی و در صورت نیاز اصلاح کنید</p>
                </div>
              </div>

              {/* Extracted text preview */}
              <details className="chart-card !p-3">
                <summary className="text-xs font-bold cursor-pointer text-gray-600 dark:text-gray-400">
                  📄 متن استخراج شده (کلیک برای مشاهده)
                </summary>
                <pre className="text-[10px] mt-2 p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg whitespace-pre-wrap font-mono">{ocrResult.text}</pre>
              </details>

              {/* Editable fields */}
              <div className="space-y-2">
                <p className="text-xs font-bold">فیلدهای شناسایی شده:</p>
                {[
                  { key: "name", label: "نام تجهیز" },
                  { key: "code", label: "کد" },
                  { key: "manufacturer", label: "سازنده" },
                  { key: "model", label: "مدل" },
                  { key: "serialNumber", label: "شماره سریال" },
                  { key: "year", label: "سال ساخت" },
                  { key: "power", label: "توان" },
                  { key: "voltage", label: "ولتاژ" },
                ].map(f => {
                  const val = editedFields[f.key] || "";
                  const wasDetected = !!(ocrResult.extractedFields as any)[f.key];
                  return (
                    <div key={f.key} className="flex items-center gap-2">
                      <label className="text-xs font-bold w-24 flex-shrink-0">{f.label}:</label>
                      <input
                        type="text"
                        value={val}
                        onChange={e => setEditedFields({ ...editedFields, [f.key]: e.target.value })}
                        className="input-field !py-1.5 flex-1"
                        placeholder="خالی"
                      />
                      {wasDetected && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-500 font-bold flex-shrink-0">
                          <Sparkles className="w-2.5 h-2.5 inline" /> AI
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Preview / Import */}
          {step === "preview" && (
            <div className="text-center py-16 animate-fade-in">
              <Zap className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
              <p className="text-lg font-bold mb-3">در حال ثبت...</p>
              <div className="max-w-xs mx-auto">
                <div className="progress-bar"><div className="progress-fill bg-gradient-to-l from-amber-500 to-amber-700" style={{ width: `${progress}%` }} /></div>
                <p className="text-xs text-gray-500 mt-2">{progress}%</p>
              </div>
            </div>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="text-center py-16 animate-fade-in">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-bold text-green-500">ثبت با موفقیت انجام شد!</p>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {step === "map" && (
          <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
            <button onClick={reset} className="btn-secondary flex-1 justify-center">شروع مجدد</button>
            <button onClick={handleImportExcel} className="btn-primary flex-1 justify-center">
              <Zap className="w-4 h-4" />
              ثبت {currentSheet?.rowCount || 0} تجهیز
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
            <button onClick={reset} className="btn-secondary flex-1 justify-center">شروع مجدد</button>
            <button onClick={handleSaveOCR} className="btn-primary flex-1 justify-center">
              <Save className="w-4 h-4" />
              ذخیره تجهیز
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
