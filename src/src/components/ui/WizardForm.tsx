"use client";

import { useState, type ReactNode } from "react";
import { X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from "lucide-react";

export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  validate?: (data: any) => string | null; // returns error message or null
  render: (props: {
    data: any;
    setData: (d: any) => void;
    next: () => void;
    back: () => void;
  }) => ReactNode;
  getSummary?: (data: any) => string;  // Custom summary display
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  gradient?: string; // e.g. "from-amber-500 to-amber-700"
  steps: WizardStep[];
  onComplete: (data: any) => void;
  initialData?: Record<string, any>;
  completionMessage?: string;
}

export function WizardForm({
  isOpen, onClose, title, subtitle,
  gradient = "from-amber-500 to-amber-700",
  steps, onComplete, initialData = {},
  completionMessage = "با موفقیت ثبت شد!",
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>(initialData);
  const [showSummary, setShowSummary] = useState(false);
  const [done, setDone] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = showSummary ? 100 : done ? 100 : Math.round(((currentStep + 1) / (steps.length + 1)) * 100);

  const handleNext = () => {
    setValidationError(null);
    if (step.validate) {
      const error = step.validate(data);
      if (error) {
        setValidationError(error);
        return;
      }
    }
    if (isLastStep) {
      setShowSummary(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setDone(true);
    setTimeout(() => {
      onComplete(data);
      handleClose();
    }, 1200);
  };

  const handleClose = () => {
    setCurrentStep(0);
    setData(initialData);
    setShowSummary(false);
    setDone(false);
    setValidationError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center md:p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full md:max-w-2xl max-h-[95vh] overflow-hidden bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-2"><div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" /></div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-600 dark:text-amber-500 text-sm md:text-base">{title}</h3>
                {subtitle && <p className="text-[10px] text-gray-500">{subtitle}</p>}
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center justify-between text-[10px] mb-1.5">
            <span className="text-gray-500">
              {showSummary ? "خلاصه و تایید نهایی" : done ? "تکمیل شد" : `مرحله ${currentStep + 1} از ${steps.length}`}
            </span>
            <span className="font-bold text-amber-500">{progress}%</span>
          </div>
          <div className="progress-bar h-2">
            <div className={`progress-fill bg-gradient-to-l ${gradient} transition-all duration-500`} style={{ width: `${progress}%` }} />
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto scrollbar-hide">
            {steps.map((s, i) => {
              const isActive = !showSummary && !done && i === currentStep;
              const isDone = i < currentStep || showSummary || done;
              return (
                <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDone ? 'bg-green-500 text-white' :
                      isActive ? `bg-gradient-to-br ${gradient} text-white animate-pulse-glow` :
                      'bg-gray-200 dark:bg-[#1a1a1a] text-gray-400'
                    }`}
                  >
                    {isDone ? '✓' : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 w-4 md:w-6 ${i < currentStep || showSummary || done ? 'bg-green-500' : 'bg-gray-200 dark:bg-[#1a1a1a]'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Completion screen */}
          {done ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-lg font-bold text-green-500 mb-1">{completionMessage}</p>
              <p className="text-xs text-gray-500">در حال بستن...</p>
            </div>
          ) : showSummary ? (
            /* Summary */
            <div className="animate-fade-in space-y-3">
              <div className="text-center mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-2`}>
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold">خلاصه اطلاعات</h3>
                <p className="text-xs text-gray-500 mt-1">اطلاعات را بررسی و تایید کنید</p>
              </div>

              {steps.map(s => (
                <div key={s.id} className="p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg border-r-2 border-amber-500/40">
                  <div className="flex items-center gap-2 mb-1">
                    {s.icon && <span>{s.icon}</span>}
                    <p className="text-xs font-bold text-amber-500">{s.title}</p>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 pr-6">
                    {(() => {
                      // Use custom summary if provided
                      if (s.getSummary) return s.getSummary(data) || "-";
                      const val = data[s.id];
                      if (Array.isArray(val)) return val.length > 0 ? val.join("، ") : "-";
                      if (typeof val === "object" && val !== null) {
                        return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(" • ");
                      }
                      return val ? String(val) : "-";
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Current Step */
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                {step.icon && (
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3 text-2xl`}>
                    {step.icon}
                  </div>
                )}
                <h3 className="text-base md:text-lg font-bold">{step.title}</h3>
                {step.subtitle && <p className="text-xs text-gray-500 mt-1">{step.subtitle}</p>}
              </div>

              {step.render({
                data,
                setData: (newData: any) => setData({ ...data, ...newData }),
                next: handleNext,
                back: handleBack,
              })}

              {validationError && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-600 dark:text-red-400 text-center">
                  ⚠ {validationError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
            <button
              onClick={handleBack}
              disabled={currentStep === 0 && !showSummary}
              className="btn-secondary flex-1 justify-center disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
              مرحله قبل
            </button>
            {showSummary ? (
              <button onClick={handleSubmit} className="btn-primary flex-1 justify-center">
                <CheckCircle2 className="w-4 h-4" />
                تایید و ثبت
              </button>
            ) : (
              <button onClick={handleNext} className="btn-primary flex-1 justify-center">
                {isLastStep ? "خلاصه" : "مرحله بعد"}
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components for common step types
export function OptionCards<T extends string>({
  options, value, onChange, columns = 2,
}: {
  options: { value: T; label: string; icon?: string; color?: string; description?: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-2`}>
      {options.map(o => {
        const isSelected = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`p-3 rounded-xl border-2 text-right transition-all ${
              isSelected
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-gray-200 dark:border-[#1a1a1a] hover:border-amber-500/50'
            }`}
            style={isSelected && o.color ? { borderColor: o.color, backgroundColor: o.color + '15' } : {}}
          >
            <div className="flex items-start gap-2">
              {o.icon && <span className="text-2xl flex-shrink-0">{o.icon}</span>}
              <div className="flex-1">
                <p className="font-bold text-sm">{o.label}</p>
                {o.description && <p className="text-[10px] text-gray-500 mt-1">{o.description}</p>}
              </div>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function InputField({
  label, value, onChange, type = "text", placeholder, dir = "auto",
}: {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  dir?: "auto" | "rtl" | "ltr";
}) {
  return (
    <div>
      {label && <label className="text-xs font-bold mb-1 block">{label}</label>}
      <input
        type={type}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
        dir={dir}
      />
    </div>
  );
}

export function TextareaField({
  label, value, onChange, placeholder, rows = 4,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      {label && <label className="text-xs font-bold mb-1 block">{label}</label>}
      <textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field resize-y"
        style={{ minHeight: `${rows * 24}px` }}
      />
    </div>
  );
}
