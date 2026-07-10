"use client";

import { useState } from "react";
import type { AssetNode } from "@/lib/assets-data";
import { Sparkles, Send, Brain, TrendingUp, AlertCircle, Wrench, Loader2, ListChecks, Target, Package } from "lucide-react";

interface Props {
  asset: AssetNode;
}

interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  category?: "pm" | "rca" | "kpi" | "parts" | "general";
}

export function AIAdvisorTab({ asset }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      content: `سلام! 👋 من **مشاور هوشمند نت‌سلن** برای تجهیز **${asset.name}** هستم.\n\nمی‌توانم به شما در موارد زیر کمک کنم:\n• برنامه PM پیشنهاد دهم\n• چک‌لیست تولید کنم\n• تحلیل خرابی (RCA) انجام دهم\n• FMEA ارائه دهم\n• MTBF/MTTR/OEE را تحلیل کنم\n• قطعات مصرفی مناسب پیشنهاد دهم\n\nچه کاری برای شما انجام دهم؟`,
      timestamp: "الان",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const quickActions = [
    { icon: ListChecks, label: "پیشنهاد چک‌لیست PM", prompt: "لطفاً یک چک‌لیست PM ماهانه پیشنهاد بده" },
    { icon: AlertCircle, label: "تحلیل RCA خرابی", prompt: "برای آخرین خرابی این تجهیز، تحلیل RCA انجام بده" },
    { icon: Target, label: "بررسی FMEA", prompt: "FMEA این تجهیز را تحلیل کن" },
    { icon: TrendingUp, label: "تحلیل شاخص‌ها", prompt: "MTBF و MTTR این تجهیز را تحلیل و بهبود پیشنهاد کن" },
    { icon: Package, label: "قطعات پیشنهادی", prompt: "چه قطعات یدکی باید در انبار داشته باشیم؟" },
    { icon: Wrench, label: "برنامه نگهداری", prompt: "برنامه جامع نگهداری این تجهیز را طراحی کن" },
  ];

  const getResponse = (prompt: string): Message => {
    let content = "";
    let category: Message["category"] = "general";

    if (prompt.includes("چک‌لیست") || prompt.includes("PM")) {
      category = "pm";
      content = `📋 **چک‌لیست PM ماهانه پیشنهادی برای ${asset.name}:**\n\n**آماده‌سازی:**\n☐ اطمینان از خاموش بودن تجهیز\n☐ آماده‌سازی ابزار و قطعات\n☐ رعایت پروتکل LOTO\n\n**بازرسی چشمی:**\n☐ بررسی نشتی روغن و مواد\n☐ بررسی وضعیت اتصالات الکتریکی\n☐ بررسی نامپلیت و برچسب‌های ایمنی\n\n**اندازه‌گیری:**\n☐ اندازه‌گیری وایبرشن (< 4.5 mm/s)\n☐ اندازه‌گیری دما (< 70°C)\n☐ بررسی جریان مصرفی موتور\n\n**عملیاتی:**\n☐ تعویض روغن سیستم هیدرولیک\n☐ تمیزکاری فیلترها\n☐ گریس‌کاری بلبرینگ‌ها\n☐ کالیبراسیون سنسورها\n\n**پایانی:**\n☐ ثبت پارامترها\n☐ راه‌اندازی تست\n☐ تکمیل فرم\n\n💡 **زمان تخمینی:** ۴ ساعت | **استاندارد:** ISO 55000`;
    } else if (prompt.includes("RCA") || prompt.includes("علت")) {
      category = "rca";
      content = `🔍 **تحلیل علت ریشه‌ای (5 Why):**\n\n**مشکل:** خرابی بلبرینگ اصلی در ${asset.name}\n\n**Why 1:** چرا بلبرینگ خراب شد؟\n→ لرزش غیرعادی داشت\n\n**Why 2:** چرا لرزش داشت؟\n→ عدم هم‌محوری شفت\n\n**Why 3:** چرا هم‌محوری نبود؟\n→ کوپلینگ فرسوده شده بود\n\n**Why 4:** چرا کوپلینگ فرسوده شد؟\n→ عدم بازرسی دوره‌ای\n\n**Why 5:** چرا بازرسی نشده؟\n→ چک‌لیست شامل کوپلینگ نبود\n\n✅ **علت ریشه‌ای:** نقص در برنامه PM\n\n**اقدامات اصلاحی:**\n1. تعویض بلبرینگ و کوپلینگ\n2. هم‌محورسازی مجدد شفت\n\n**اقدامات پیشگیرانه:**\n1. افزودن بازرسی کوپلینگ به چک‌لیست ماهانه\n2. آموزش تکنسین‌ها\n3. نصب سنسور وایبرشن آنلاین`;
    } else if (prompt.includes("FMEA")) {
      category = "rca";
      content = `📊 **تحلیل FMEA پیشنهادی برای ${asset.name}:**\n\n| حالت خرابی | S | O | D | RPN |\n|---|---|---|---|---|\n| خرابی بلبرینگ | 8 | 5 | 4 | 160 🔴 |\n| نشتی هیدرولیک | 7 | 4 | 3 | 84 🟡 |\n| گرمای بیش از حد موتور | 9 | 3 | 5 | 135 🟡 |\n| فرسودگی کوپلینگ | 6 | 6 | 4 | 144 🟡 |\n| خطای PLC | 9 | 2 | 3 | 54 🟢 |\n\n**اولویت اقدام:**\n1. 🔴 **RPN 160** — بلبرینگ (فوری)\n2. 🟡 **RPN 144** — کوپلینگ\n3. 🟡 **RPN 135** — کولینگ موتور\n\n💡 **توصیه:** نصب سنسور وایبرشن Continuous Monitoring می‌تواند D را از ۴ به ۱ کاهش دهد.`;
    } else if (prompt.includes("MTBF") || prompt.includes("شاخص")) {
      category = "kpi";
      content = `📈 **تحلیل شاخص‌های ${asset.name}:**\n\n**وضعیت فعلی:**\n• MTBF: ${asset.mtbf || 0} ساعت\n• MTTR: ${asset.mttr || 0} ساعت\n• Availability: ${asset.availability || 0}%\n• OEE: ${asset.oee || 0}%\n\n**مقایسه با استاندارد:**\n${(asset.mtbf || 0) < 500 ? '⚠️ MTBF زیر استاندارد (500h)' : '✅ MTBF مطلوب'}\n${(asset.mttr || 0) > 3 ? '⚠️ MTTR بالاتر از هدف' : '✅ MTTR قابل قبول'}\n\n**پیشنهادات بهبود:**\n1. **افزایش MTBF:** اجرای PM پیش‌بینانه (PdM) با پایش وایبرشن\n2. **کاهش MTTR:** نگهداری قطعات یدکی بحرانی در انبار\n3. **افزایش OEE:** کاهش زمان‌های Setup و تنظیم\n\n📊 **پیش‌بینی:** با اجرای پیشنهادات، در ۳ ماه:\n• MTBF: ۴۰٪ افزایش\n• MTTR: ۳۰٪ کاهش\n• OEE: از ${asset.oee}% به ${(asset.oee || 0) + 8}%`;
    } else if (prompt.includes("قطعات")) {
      category = "parts";
      content = `📦 **قطعات یدکی توصیه شده برای ${asset.name}:**\n\n**بحرانی (همیشه موجود):**\n• بلبرینگ اصلی 6205 — 4 عدد\n• سنسور دما PT100 — 2 عدد\n• فیلتر هیدرولیک — 3 عدد\n• سیل روغن — 8 عدد\n\n**مهم (موجودی متوسط):**\n• کوپلینگ — 1 عدد\n• روغن هیدرولیک ISO 46 — 20 لیتر\n• تسمه V-Belt — 2 عدد\n• کنتاکتور — 2 عدد\n\n**مصرفی (سفارش دوره‌ای):**\n• گریس — 1 کیلو\n• پیچ‌ومهره‌ها — کیت کامل\n• فیوز — 5 عدد\n\n💰 **ارزش کل انبار پیشنهادی:** ~۱۸ میلیون ریال\n\n⚠️ **هشدار:** موجودی فعلی برخی قطعات کمتر از حداقل است. مشاهده جزئیات در تب "قطعات".`;
    } else {
      content = `متوجه شدم که پرسیدید: "${prompt}"\n\nبرای پاسخ دقیق‌تر، لطفاً یکی از موضوعات زیر را انتخاب کنید:\n• برنامه PM\n• تحلیل RCA/FMEA\n• شاخص‌های عملکرد\n• قطعات یدکی\n\nیا از دکمه‌های میانبر بالا استفاده کنید.`;
    }

    return {
      id: Date.now(),
      role: "ai",
      content,
      timestamp: "الان",
      category,
    };
  };

  const send = (prompt: string) => {
    if (!prompt.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: "user",
      content: prompt,
      timestamp: "الان",
    }]);
    setInput("");
    setIsThinking(true);
    setTimeout(() => {
      setMessages(prev => [...prev, getResponse(prompt)]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      <div className="chart-card !p-0 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 320px)", minHeight: 500 }}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a] bg-gradient-to-l from-purple-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">مشاور هوشمند نت‌سلن</h3>
                <span className="text-[9px] px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  آنلاین
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                در حال گفتگو درباره: <strong className="text-amber-500">{asset.name}</strong>
              </p>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-gradient-to-l from-amber-500 to-amber-700 text-[#0a0a0a] rounded-tr-md"
                    : "bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-tl-md"
                }`}
              >
                {msg.role === "ai" && (
                  <div className="flex items-center gap-1 mb-2">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500">مشاور نت‌سلن</span>
                    {msg.category && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-500 mr-auto">
                        {msg.category === "pm" ? "PM" : msg.category === "rca" ? "RCA" : msg.category === "kpi" ? "KPI" : msg.category === "parts" ? "قطعات" : "عمومی"}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className="text-xs whitespace-pre-wrap leading-relaxed"
                  dir="rtl"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^(\|.+\|)$/gm, '<span class="font-mono text-[10px]">$1</span>')
                  }}
                />
                <p className={`text-[9px] mt-2 ${msg.role === "user" ? "opacity-70" : "text-gray-500"}`}>{msg.timestamp}</p>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-end">
              <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-3 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span className="text-xs text-gray-500">در حال تحلیل...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-t border-gray-200 dark:border-[#1a1a1a] overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {quickActions.map((qa, i) => {
              const Icon = qa.icon;
              return (
                <button
                  key={i}
                  onClick={() => send(qa.prompt)}
                  className="flex-shrink-0 text-[10px] px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10 flex items-center gap-1 whitespace-nowrap"
                >
                  <Icon className="w-3 h-3" />
                  {qa.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200 dark:border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="سوال خود را بپرسید..."
              className="input-field flex-1"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim()}
              className="btn-primary !p-2 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
