"use client";

import { useState } from "react";
import {
  X, Send, Sparkles, Loader2, CheckCircle2, AlertTriangle,
  Brain, User, ChevronLeft, Zap
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { assetsTreeData } from "@/lib/assets-data";
import { personnelData } from "@/lib/personnel-data";
import { WizardForm, OptionCards, InputField, TextareaField, type WizardStep } from "@/components/ui/WizardForm";
import { SmartSelectList } from "@/components/ui/SmartSelectList";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkOrder?: (data: any) => void;
}

interface AISuggestion {
  possibleCauses: { cause: string; probability: number }[];
  recommendedAction: string;
  urgency: "low" | "medium" | "high" | "critical";
  estimatedTime: number;
  suggestedTechnicians: string[];
  suggestedParts: string[];
  estimatedCost: number;
  confidence: number;
}

// AI analysis based on keywords
function analyzeDescription(description: string): AISuggestion {
  const desc = description.toLowerCase();

  if (desc.includes("لرزش") || desc.includes("صدا") || desc.includes("وایبر")) {
    return {
      possibleCauses: [
        { cause: "خرابی بلبرینگ و یاتاقان", probability: 75 },
        { cause: "عدم هم‌محوری شفت", probability: 65 },
        { cause: "فرسودگی کوپلینگ", probability: 45 },
        { cause: "شل شدن فوندانسیون", probability: 25 },
      ],
      recommendedAction: "توقف فوری تجهیز، اندازه‌گیری وایبرشن با دستگاه CAT-II، تعویض بلبرینگ و بازرسی کوپلینگ",
      urgency: "high", estimatedTime: 6,
      suggestedTechnicians: ["علی محمدی", "حسن رضایی"],
      suggestedParts: ["بلبرینگ 6205-2RS", "کوپلینگ", "روغن هیدرولیک"],
      estimatedCost: 12000000, confidence: 85,
    };
  }
  if (desc.includes("نشتی") || desc.includes("روغن") || desc.includes("هیدرولیک")) {
    return {
      possibleCauses: [
        { cause: "فرسودگی سیل و اورینگ‌ها", probability: 80 },
        { cause: "شل شدن اتصالات هیدرولیک", probability: 55 },
        { cause: "ترک در پوسته پمپ", probability: 30 },
      ],
      recommendedAction: "تعویض سیل و اورینگ‌ها، بررسی فشار خط، بازرسی کامل سیستم هیدرولیک",
      urgency: "medium", estimatedTime: 3,
      suggestedTechnicians: ["علی محمدی", "مهدی عباسی"],
      suggestedParts: ["سیل روغن 50mm", "اورینگ سیلندر", "روغن ISO 46"],
      estimatedCost: 5500000, confidence: 82,
    };
  }
  if (desc.includes("گرم") || desc.includes("دما")) {
    return {
      possibleCauses: [
        { cause: "خرابی سیستم خنک‌کننده", probability: 70 },
        { cause: "روانکاری ناکافی", probability: 60 },
        { cause: "اضافه‌بار الکتریکی", probability: 45 },
      ],
      recommendedAction: "بازرسی سیستم خنک‌کننده، اندازه‌گیری جریان مصرفی، گریس‌کاری، تست فن خنک‌کننده",
      urgency: "high", estimatedTime: 4,
      suggestedTechnicians: ["رضا احمدی", "محمد کریمی"],
      suggestedParts: ["گریس EP2", "فن خنک‌کننده", "ترموستات"],
      estimatedCost: 7500000, confidence: 78,
    };
  }
  if (desc.includes("برق") || desc.includes("الکتریک") || desc.includes("جرقه")) {
    return {
      possibleCauses: [
        { cause: "اتصالی در سیم‌کشی", probability: 70 },
        { cause: "خرابی کنتاکتور یا رله", probability: 60 },
        { cause: "خرابی فیوز محافظ", probability: 45 },
      ],
      recommendedAction: "قطع کامل برق، بازرسی سیم‌کشی، تست کنتاکتورها، اندازه‌گیری مقاومت زمین",
      urgency: "critical", estimatedTime: 5,
      suggestedTechnicians: ["امیر حسینی", "رضا احمدی"],
      suggestedParts: ["کنتاکتور 3RT60", "فیوز خودکار", "سیم افشان"],
      estimatedCost: 8500000, confidence: 80,
    };
  }
  return {
    possibleCauses: [
      { cause: "نیاز به بازرسی دقیق‌تر", probability: 60 },
      { cause: "احتمال خرابی پیش‌بینی نشده", probability: 40 },
    ],
    recommendedAction: "بازرسی چشمی و اندازه‌گیری پارامترها توسط تکنسین متخصص",
    urgency: "medium", estimatedTime: 2,
    suggestedTechnicians: ["علی محمدی"],
    suggestedParts: [], estimatedCost: 2000000, confidence: 65,
  };
}

export function ServiceRequestForm({ isOpen, onClose, onCreateWorkOrder }: Props) {
  const toast = useToast();

  const steps: WizardStep[] = [
    {
      id: "requestedBy",
      title: "درخواست‌کننده کیست؟",
      subtitle: "نام فرد یا واحد درخواست‌کننده",
      icon: "👤",
      validate: (d) => !d.requestedBy ? "درخواست‌کننده الزامی است" : null,
      render: ({ data, setData }) => (
        <SmartSelectList
          options={personnelData.map(p => ({
            value: p.fullName,
            label: p.fullName,
            description: `${p.position} • ${p.department}`,
            icon: "👤",
          }))}
          value={data.requestedBy}
          onChange={(v) => setData({ requestedBy: v })}
          storageKey="service_request_users"
          columns={2}
          addLabel="افزودن درخواست‌کننده جدید (پرسنل یا واحد)"
        />
      ),
    },
    {
      id: "equipment",
      title: "کدام تجهیز مشکل دارد؟",
      subtitle: "تجهیز موردنظر را انتخاب کنید",
      icon: "⚙️",
      validate: (d) => !d.equipmentId ? "لطفاً تجهیز را انتخاب کنید" : null,
      render: ({ data, setData }) => (
        <SmartSelectList
          options={assetsTreeData.filter(a => a.typeKey === "equipment").map(a => ({
            value: String(a.id),
            label: a.name,
            description: `${a.code} • ${a.manufacturer || ""} ${a.model || ""}`,
            icon: "⚙️",
          }))}
          value={data.equipmentId ? String(data.equipmentId) : ""}
          onChange={(v, label) => {
            if (!v) return;
            const asset = assetsTreeData.find(a => String(a.id) === v);
            if (asset) {
              setData({ equipmentId: asset.id, equipmentName: asset.name, equipmentCode: asset.code });
            } else {
              // Custom equipment added by user
              setData({
                equipmentId: Date.now(),
                equipmentName: label,
                equipmentCode: `TEMP-${Date.now()}`,
              });
            }
          }}
          storageKey="service_request_equipment"
          columns={2}
          addLabel="افزودن تجهیز جدید (موقت)"
        />
      ),
    },
    {
      id: "priority",
      title: "اولویت درخواست چیست؟",
      subtitle: "میزان فوریت را انتخاب کنید",
      icon: "⚠️",
      validate: (d) => !d.priority ? "لطفاً اولویت را انتخاب کنید" : null,
      render: ({ data, setData }) => (
        <OptionCards
          columns={2}
          value={data.priority}
          onChange={(v: any) => setData({ priority: v })}
          options={[
            { value: "low", label: "کم", icon: "🟢", color: "#22c55e", description: "غیر فوری" },
            { value: "medium", label: "متوسط", icon: "🔵", color: "#3b82f6", description: "طبق برنامه" },
            { value: "high", label: "بالا", icon: "🟠", color: "#f59e0b", description: "سریع" },
            { value: "critical", label: "بحرانی", icon: "🔴", color: "#ef4444", description: "فوری" },
          ]}
        />
      ),
    },
    {
      id: "title",
      title: "عنوان کوتاه درخواست",
      subtitle: "یک جمله خلاصه (مثال: لرزش شدید موتور)",
      icon: "📝",
      validate: (d) => !d.title ? "عنوان الزامی است" : null,
      render: ({ data, setData }) => (
        <InputField
          value={data.title || ""}
          onChange={v => setData({ title: v })}
          placeholder="مثال: لرزش شدید موتور میکسر"
        />
      ),
    },
    {
      id: "description",
      title: "شرح کامل مشکل",
      subtitle: "با جزئیات توضیح دهید تا AI بتواند تحلیل کند",
      icon: "💬",
      validate: (d) => !d.description || d.description.length < 20 ? "لطفاً شرح کامل (حداقل ۲۰ حرف) بنویسید" : null,
      render: ({ data, setData }) => (
        <div className="space-y-2">
          <TextareaField
            value={data.description || ""}
            onChange={v => setData({ description: v })}
            placeholder="مثال: از دیروز صبح میکسر لرزش شدید داره، صدای غیرعادی از قسمت بلبرینگ شنیده می‌شه و گرمای موتور بالا رفته..."
            rows={5}
          />
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-600 dark:text-gray-400">
              <strong className="text-purple-500">AI سلن</strong> با تحلیل این متن، علت‌های احتمالی و راهکار پیشنهادی را ارائه می‌دهد. هرچه دقیق‌تر بنویسید، تحلیل بهتری خواهید داشت.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "aiAnalysis",
      title: "تحلیل هوش مصنوعی سلن",
      subtitle: "AI شرح شما را تحلیل کرد",
      icon: "🤖",
      render: ({ data, setData }) => {
        // Auto-run AI analysis on first render
        if (!data.aiSuggestion && data.description) {
          setTimeout(() => {
            const suggestion = analyzeDescription(data.description);
            setData({ aiSuggestion: suggestion });
          }, 100);
        }
        const ai = data.aiSuggestion as AISuggestion | undefined;
        if (!ai) {
          return (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-purple-500 mx-auto mb-3 animate-pulse" />
              <p className="text-sm text-purple-500">در حال تحلیل...</p>
            </div>
          );
        }
        return (
          <div className="space-y-3">
            <div className="bg-gradient-to-l from-purple-500/10 to-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold text-purple-600">تحلیل AI سلن</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold mr-auto">
                  اطمینان {ai.confidence}%
                </span>
              </div>
            </div>
            <p className="text-xs font-bold flex items-center gap-1 mt-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              علت‌های احتمالی خرابی:
            </p>
            <div className="space-y-1.5">
              {ai.possibleCauses.map((c, i) => (
                <div key={i} className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{i + 1}. {c.cause}</span>
                    <span className="text-xs font-bold" style={{ color: c.probability >= 70 ? '#ef4444' : c.probability >= 50 ? '#f59e0b' : '#3b82f6' }}>{c.probability}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${c.probability}%`, backgroundColor: c.probability >= 70 ? '#ef4444' : c.probability >= 50 ? '#f59e0b' : '#3b82f6' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-green-500/5 border border-green-500/30 rounded-lg">
              <p className="text-xs font-bold text-green-600 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> اقدام پیشنهادی:
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{ai.recommendedAction}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-amber-500/5 rounded-lg"><p className="text-[10px] text-gray-500">تکنسین:</p><p className="font-bold text-amber-500">{ai.suggestedTechnicians[0]}</p></div>
              <div className="p-2 bg-blue-500/5 rounded-lg"><p className="text-[10px] text-gray-500">زمان:</p><p className="font-bold text-blue-500">{ai.estimatedTime} ساعت</p></div>
              <div className="p-2 bg-green-500/5 rounded-lg"><p className="text-[10px] text-gray-500">هزینه:</p><p className="font-bold text-green-500">{(ai.estimatedCost / 1000000).toFixed(1)}M</p></div>
              <div className="p-2 bg-red-500/5 rounded-lg"><p className="text-[10px] text-gray-500">اولویت AI:</p><p className="font-bold text-red-500">{{ low: "کم", medium: "متوسط", high: "بالا", critical: "بحرانی" }[ai.urgency]}</p></div>
            </div>
            {ai.suggestedParts.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg">
                <p className="text-xs font-bold mb-2">قطعات مورد نیاز:</p>
                <div className="flex flex-wrap gap-1">
                  {ai.suggestedParts.map((p, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-amber-500/20 text-amber-600">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "managerConfirm",
      title: "تایید مدیر فنی",
      subtitle: "این تشخیص در سابقه ثبت و دستور کار صادر می‌شود",
      icon: "✅",
      validate: (d) => !d.confirmed ? "لطفاً تایید کنید" : null,
      render: ({ data, setData }) => (
        <OptionCards
          columns={2}
          value={data.confirmed}
          onChange={(v: any) => setData({ confirmed: v })}
          options={[
            { value: "yes", label: "تایید و صدور دستور کار", icon: "✅", color: "#22c55e", description: "علت تشخیصی AI پذیرفته می‌شود" },
            { value: "modify", label: "نیاز به اصلاح", icon: "✏️", color: "#f59e0b", description: "بعداً بررسی خواهد شد" },
          ]}
        />
      ),
    },
  ];

  return (
    <WizardForm
      isOpen={isOpen}
      onClose={onClose}
      title="ثبت درخواست تعمیر"
      subtitle="با تحلیل هوش مصنوعی سلن"
      gradient="from-red-500 to-amber-500"
      steps={steps}
      initialData={{ priority: "medium" }}
      completionMessage="درخواست ثبت و دستور کار صادر شد!"
      onComplete={(data) => {
        if (data.confirmed === "yes") {
          const woData = {
            title: data.title,
            description: data.description,
            equipmentName: data.equipmentName,
            equipmentId: data.equipmentId,
            diagnosedCause: data.aiSuggestion?.possibleCauses[0].cause,
            recommendedAction: data.aiSuggestion?.recommendedAction,
            priority: data.aiSuggestion?.urgency || data.priority,
            estimatedHours: data.aiSuggestion?.estimatedTime,
            assignedTo: data.aiSuggestion?.suggestedTechnicians[0],
            parts: data.aiSuggestion?.suggestedParts,
            cost: data.aiSuggestion?.estimatedCost,
          };
          onCreateWorkOrder?.(woData);
          toast.success("دستور کار صادر شد", `به ${woData.assignedTo} تخصیص یافت`);
        } else {
          toast.info("ذخیره شد", "درخواست برای بررسی بعدی ذخیره شد");
        }
      }}
    />
  );
}
