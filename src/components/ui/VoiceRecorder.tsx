"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Volume2, Trash2, Play, Pause, Send } from "lucide-react";

interface Props {
  onTranscript: (text: string) => void;
  onCancel?: () => void;
  autoStart?: boolean;
}

export function VoiceRecorder({ onTranscript, onCancel, autoStart = false }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("مرورگر شما از تبدیل صوت به متن پشتیبانی نمی‌کند. لطفاً از Chrome استفاده کنید.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fa-IR";

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript + " ";
        else interimText += result[0].transcript;
      }
      if (finalText) setTranscript(prev => prev + finalText);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        setError("دسترسی به میکروفن رد شد. لطفاً در تنظیمات مرورگر اجازه دهید.");
      } else if (event.error !== "no-speech") {
        setError(`خطا: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;

    if (autoStart) startRecording();

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    setDuration(0);
    startTimeRef.current = Date.now();
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch (err) {
      setError("خطا در شروع ضبط");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSubmit = () => {
    stopRecording();
    if (transcript.trim()) onTranscript(transcript.trim());
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="chart-card !p-4 border-amber-500/40">
      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-xs font-bold">{isRecording ? "در حال ضبط..." : "آماده ضبط"}</span>
            </div>
            <span className="text-xs font-mono text-amber-500">{formatTime(duration)}</span>
          </div>

          {/* Wave animation */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1 h-12 mb-3">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-amber-500 to-amber-300 rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 30}px`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: "800ms"
                  }}
                />
              ))}
            </div>
          )}

          {/* Transcript */}
          <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-3 min-h-[80px] max-h-[200px] overflow-y-auto mb-3">
            {transcript || interimTranscript ? (
              <p className="text-sm leading-relaxed">
                <span className="text-gray-900 dark:text-white">{transcript}</span>
                <span className="text-gray-400 dark:text-gray-500 italic">{interimTranscript}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                {isRecording ? "شروع به صحبت کنید..." : "روی دکمه میکروفن کلیک کنید"}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button onClick={startRecording} className="btn-primary flex-1 justify-center">
                <Mic className="w-4 h-4" />
                شروع ضبط
              </button>
            ) : (
              <button onClick={stopRecording} className="btn-danger flex-1 justify-center">
                <MicOff className="w-4 h-4" />
                توقف
              </button>
            )}
            {transcript && (
              <button onClick={handleSubmit} className="btn-primary justify-center">
                <Send className="w-4 h-4" />
                ثبت
              </button>
            )}
            {onCancel && (
              <button onClick={onCancel} className="btn-secondary justify-center">
                انصراف
              </button>
            )}
          </div>

          <p className="text-[10px] text-gray-500 mt-2 text-center">
            💡 برای بهترین نتیجه از کروم و در محیط آرام استفاده کنید
          </p>
        </>
      )}
    </div>
  );
}

/**
 * Voice/Video Call Modal - simulated for demo (in production connects to WebRTC/Jitsi)
 */
export function CallModal({ isOpen, onClose, targetName, targetRole, type }: {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetRole: string;
  type: "voice" | "video";
}) {
  const [state, setState] = useState<"calling" | "connected" | "ended">("calling");
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setState("calling");
    setDuration(0);
    const timer = setTimeout(() => setState("connected"), 2500);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (state !== "connected") return;
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  if (!isOpen) return null;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const endCall = () => {
    setState("ended");
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="text-center p-6 max-w-md w-full">
        {/* Avatar */}
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center mx-auto mb-4 ${state === "calling" ? 'animate-pulse-glow' : ''}`}>
          <span className="text-white font-black text-5xl">{targetName.charAt(0)}</span>
        </div>

        <p className="text-xl font-bold text-white mb-1">{targetName}</p>
        <p className="text-sm text-gray-400 mb-6">{targetRole}</p>

        {state === "calling" && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay:"0ms"}} />
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay:"150ms"}} />
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{animationDelay:"300ms"}} />
            </div>
            <p className="text-sm text-amber-500">در حال برقراری {type === "video" ? "تماس تصویری" : "تماس صوتی"}...</p>
          </div>
        )}

        {state === "connected" && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm text-green-500 font-bold">متصل شده</p>
            </div>
            <p className="text-2xl font-mono font-bold text-white">{formatTime(duration)}</p>

            {type === "video" && (
              <div className="mt-4 mx-auto w-full aspect-video max-w-sm bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border-2 border-amber-500/30">
                <div className="text-center">
                  <Volume2 className="w-12 h-12 text-amber-500/60 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">تصویر: {targetName}</p>
                  <p className="text-[10px] text-gray-500 mt-1">(شبیه‌سازی - در نسخه واقعی WebRTC)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {state === "ended" && (
          <p className="text-sm text-red-500 mb-6">تماس پایان یافت</p>
        )}

        {state !== "ended" && (
          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center mx-auto transition-colors shadow-lg shadow-red-500/50"
          >
            <span className="text-2xl">📞</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Before/After Photo Uploader
 */
export function BeforeAfterPhotos({
  beforePhoto, afterPhoto,
  onBeforeChange, onAfterChange,
}: {
  beforePhoto?: string;
  afterPhoto?: string;
  onBeforeChange: (url: string) => void;
  onAfterChange: (url: string) => void;
}) {
  const handleUpload = (type: "before" | "after") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      if (type === "before") onBeforeChange(url);
      else onAfterChange(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {(["before", "after"] as const).map(type => {
        const photo = type === "before" ? beforePhoto : afterPhoto;
        const label = type === "before" ? "تصویر قبل از اقدام" : "تصویر بعد از اقدام";
        const color = type === "before" ? "#ef4444" : "#22c55e";
        return (
          <label
            key={type}
            className="cursor-pointer border-2 border-dashed rounded-xl overflow-hidden aspect-square relative group"
            style={{ borderColor: color + '40' }}
          >
            {photo ? (
              <>
                <img src={photo} alt={label} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
                  {type === "before" ? "قبل" : "بعد"}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-xs text-white">تغییر تصویر</p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                  <span className="text-2xl">📷</span>
                </div>
                <p className="text-xs font-bold text-center" style={{ color }}>{label}</p>
                <p className="text-[10px] text-gray-500">کلیک کنید</p>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload(type)} />
          </label>
        );
      })}
    </div>
  );
}
