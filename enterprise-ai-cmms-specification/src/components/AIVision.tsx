import { useState, useRef, useEffect } from 'react';
import { I } from './Icon';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { faNum } from '../lib/utils';
import { analyzeImage, type ImageAnalysisResult } from '../lib/imageAI';

interface Props {
  open: boolean;
  onClose: () => void;
  contextHint?: string;
  onResult?: (result: ImageAnalysisResult, imageUrl: string) => void;
}

export function AIVision({ open, onClose, contextHint, onResult }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [hint, setHint] = useState(contextHint ?? '');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) {
      stopCamera();
      setImageUrl(null);
      setResult(null);
      setAnalyzing(false);
    }
  }, [open]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setCameraActive(true);
      setImageUrl(null);
      setResult(null);
      // Wait for video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      toast.push('دسترسی به دوربین امکان‌پذیر نیست — لطفاً مجوز را بدهید یا از آپلود فایل استفاده کنید', 'error');
    }
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImageUrl(dataUrl);
    stopCamera();
    runAnalysis(dataUrl);
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 5_000_000) { toast.push('حجم تصویر باید کمتر از ۵MB باشد', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setImageUrl(url);
      setResult(null);
      runAnalysis(url);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async (url: string) => {
    setAnalyzing(true);
    setResult(null);
    try {
      // Small artificial delay to feel like "analyzing"
      await new Promise(r => setTimeout(r, 800));
      const r = await analyzeImage(url, hint);
      setResult(r);
      if (onResult) onResult(r, url);
    } catch {
      toast.push('خطا در تحلیل تصویر', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const reanalyze = () => {
    if (imageUrl) runAnalysis(imageUrl);
  };

  const reset = () => {
    setImageUrl(null);
    setResult(null);
    stopCamera();
  };

  const severityStyle = result ? {
    critical: { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-400/40', label: '🚨 بحرانی' },
    high: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-400/40', label: '⚠ بالا' },
    medium: { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-400/40', label: 'ℹ متوسط' },
    low: { bg: 'bg-ink-500/15', text: 'text-ink-300', border: 'border-ink-400/40', label: 'پایین' },
    info: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-400/40', label: '✓ عادی' },
  }[result.severity] : null;

  return (
    <Modal open={open} onClose={onClose} size="lg"
      title="🔍 تحلیل تصویری هوشمند (مثل گوگل لنز)"
      footer={
        <>
          {result && imageUrl && (
            <>
              <button onClick={reset} className="btn-ghost-gold px-3 py-2 rounded-lg text-sm">تصویر جدید</button>
              <button onClick={reanalyze} className="btn-ghost-gold px-3 py-2 rounded-lg text-sm flex items-center gap-1">
                <I.Cpu size={12} /> تحلیل مجدد
              </button>
            </>
          )}
          <button onClick={onClose} className="btn-gold px-4 py-2 rounded-lg text-sm">بستن</button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Context hint */}
        <div>
          <label className="text-xs text-amber-300 mb-1 block">توضیح کوتاه (اختیاری — به دقت تحلیل کمک می‌کند):</label>
          <input className="input-dark text-sm" placeholder="مثلاً: نشتی پمپ MDI، سوختگی کنتاکتور، ..."
            value={hint} onChange={e => setHint(e.target.value)} />
        </div>

        {!imageUrl && !cameraActive && (
          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={startCamera}
              className="surface-soft rounded-2xl p-6 hover:bg-amber-500/10 transition flex flex-col items-center gap-3 border-2 border-dashed border-amber-500/30">
              <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center">
                <I.Camera size={28} className="text-amber-300" />
              </div>
              <div className="text-center">
                <div className="font-bold text-amber-200">گرفتن عکس با دوربین</div>
                <div className="text-[11px] text-ink-300 mt-1">دوربین پشت موبایل استفاده می‌شود</div>
              </div>
            </button>

            <label className="surface-soft rounded-2xl p-6 hover:bg-amber-500/10 transition flex flex-col items-center gap-3 border-2 border-dashed border-amber-500/30 cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center">
                <I.Upload size={28} className="text-amber-300" />
              </div>
              <div className="text-center">
                <div className="font-bold text-amber-200">آپلود تصویر</div>
                <div className="text-[11px] text-ink-300 mt-1">از گالری، JPG/PNG/WebP — تا ۵MB</div>
              </div>
              <input type="file" accept="image/*" className="hidden"
                onChange={e => handleFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        )}

        {cameraActive && (
          <div className="space-y-3">
            <div className="surface-soft rounded-xl overflow-hidden relative">
              <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[400px] object-contain bg-black" />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={captureFromCamera} className="btn-gold px-6 py-3 rounded-full flex items-center gap-2">
                    <I.Camera size={18} /> گرفتن عکس
                  </button>
                  <button onClick={stopCamera} className="btn-ghost-gold px-4 py-3 rounded-full">
                    <I.X size={16} />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-amber-300/80 text-center">
              دوربین را به سمت تجهیز یا نشانه خرابی نشانه‌گیری کنید و دکمه «گرفتن عکس» را بزنید.
            </p>
          </div>
        )}

        {imageUrl && (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="surface-soft rounded-xl overflow-hidden">
              <img src={imageUrl} alt="" className="w-full max-h-[300px] object-contain bg-ink-900" />
            </div>

            <div className="space-y-3">
              {analyzing && (
                <div className="surface-soft rounded-xl p-6 text-center">
                  <div className="inline-block animate-spin mb-3">
                    <I.Cpu size={36} className="text-amber-400" />
                  </div>
                  <p className="text-sm text-amber-300">در حال تحلیل تصویر...</p>
                  <p className="text-[11px] text-ink-400 mt-1">شناسایی رنگ‌ها، تشخیص نواحی، تطبیق با پایگاه دانش</p>
                </div>
              )}

              {result && severityStyle && (
                <>
                  <div className={`rounded-xl p-4 border ${severityStyle.border} ${severityStyle.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className={`text-xs font-bold ${severityStyle.text}`}>{severityStyle.label}</div>
                        <h4 className="font-display text-lg text-gold-gradient">{result.categoryLabel}</h4>
                      </div>
                      <div className="text-left">
                        <div className="font-display text-2xl text-amber-300">{faNum(result.confidence)}٪</div>
                        <div className="text-[10px] text-ink-400">اطمینان AI</div>
                      </div>
                    </div>
                  </div>

                  <div className="surface-soft rounded-xl p-3">
                    <h5 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
                      <I.Eye size={11} /> آن‌چه AI می‌بیند
                    </h5>
                    <ul className="space-y-1 text-xs">
                      {result.observations.map((o, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-300">•</span>
                          <span className="text-ink-100 leading-5">{o}</span>
                        </li>
                      ))}
                    </ul>
                    {result.estimatedComponents.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {result.estimatedComponents.map(c => (
                          <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-200">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {result && imageUrl && (
          <>
            <div className="surface-soft rounded-xl p-3">
              <h5 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
                <I.AI size={11} /> تشخیص و علل احتمالی
              </h5>
              <ol className="space-y-1.5 text-sm">
                {result.diagnoses.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/15 text-amber-300 flex items-center justify-center font-bold text-[10px]">{faNum(i + 1)}</span>
                    <span className="text-ink-100 leading-6">{d}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="surface ring-gold rounded-xl p-3">
              <h5 className="text-xs text-gold-gradient font-bold mb-2 flex items-center gap-1">
                <I.Check size={11} /> توصیه‌های اقدام
              </h5>
              <ol className="space-y-1.5 text-sm">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full btn-gold flex items-center justify-center font-bold text-[10px]">{faNum(i + 1)}</span>
                    <span className="text-ink-100 leading-6">{r}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="surface-soft rounded-xl p-3">
              <h5 className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
                <I.Activity size={11} /> تحلیل تکنیکی تصویر
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-[10px] text-ink-400">روشنایی</div>
                  <div className="font-display text-base text-amber-300">{faNum(result.brightness)}/۲۵۵</div>
                </div>
                <div className="text-center col-span-2 sm:col-span-3">
                  <div className="text-[10px] text-ink-400 mb-1">رنگ‌های غالب</div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {result.colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded border border-amber-500/20"
                          style={{ background: `rgb(${c.rgb.join(',')})` }} />
                        <span className="text-[10px] text-ink-300">{c.dominant}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
