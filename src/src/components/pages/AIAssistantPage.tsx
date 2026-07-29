"use client";

import { useState } from "react";
import { Brain, Sparkles, MessageSquare, TrendingUp, Zap, ListChecks, Target, Package, Send, Loader2 } from "lucide-react";
import { PredictiveMaintenance } from "@/components/features/ai/PredictiveMaintenance";
import { assetsTreeData } from "@/lib/assets-data";
import { personnelData } from "@/lib/personnel-data";

type Tab = "chat" | "predictive" | "rca" | "recommendations";

export function AIAssistantPage() {
  const [tab, setTab] = useState<Tab>("predictive");

  const tabs = [
    { id: "predictive" as const, label: "پیش‌بینی هوشمند", icon: Brain, color: "#8b5cf6" },
    { id: "chat" as const, label: "چت با مشاور", icon: MessageSquare, color: "#d4a017" },
    { id: "rca" as const, label: "تحلیل RCA/FMEA", icon: Target, color: "#ef4444" },
    { id: "recommendations" as const, label: "توصیه‌های AI", icon: Sparkles, color: "#22c55e" },
  ];

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">
      {/* Header */}
      <div className="chart-card !p-4 bg-gradient-to-l from-purple-500/10 via-transparent to-amber-500/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-amber-600 dark:text-amber-500">مشاور هوشمند نت‌سلن</h2>
            <p className="text-xs text-gray-500 mt-0.5">دستیار AI شما برای مدیریت هوشمند نگهداری و تعمیرات</p>
          </div>
          <div className="hidden md:flex items-center gap-1 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-600 dark:text-green-500 font-bold">آنلاین</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="chart-card !p-2 flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[130px] px-3 py-2 rounded-lg text-xs whitespace-nowrap flex items-center justify-center gap-1.5 ${
                isActive ? 'bg-gradient-to-l from-amber-500 to-amber-700 text-[#0a0a0a] font-bold shadow-md' : 'text-gray-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "predictive" && <PredictiveMaintenance />}
      {tab === "chat" && <ChatView />}
      {tab === "rca" && <RCAView />}
      {tab === "recommendations" && <RecommendationsView />}
    </div>
  );
}

function ChatView() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "سلام! من مشاور هوشمند نت‌سلن هستم. چطور می‌تونم کمکتون کنم؟\n\nمی‌تونید بپرسید:\n• بحرانی‌ترین تجهیز کدام است؟\n• کدام پرسنل بیشترین بهره‌وری را دارد؟\n• پیشنهاد PM برای پمپ هیدرولیک\n• تحلیل روند خرابی‌های ۳ ماه اخیر" },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const quickPrompts = [
    "بحرانی‌ترین تجهیز کدام است؟",
    "بهترین تکنسین ماه گذشته",
    "پیش‌بینی خرابی هفته آینده",
    "تحلیل هزینه نگهداری",
  ];

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", content: text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      let response = "";
      if (text.includes("بحرانی")) {
        const critical = assetsTreeData.filter(a => a.criticality === "critical" && a.healthScore < 85).sort((a, b) => a.healthScore - b.healthScore)[0];
        response = `🔴 **بحرانی‌ترین تجهیز:** ${critical?.name}\n\n📊 وضعیت:\n• سلامت: ${critical?.healthScore}%\n• کد: ${critical?.code}\n• محل: ${critical?.location || "نامشخص"}\n\n⚠️ توصیه فوری: بازرسی و PM اضطراری`;
      } else if (text.includes("تکنسین") || text.includes("بهره‌وری")) {
        const best = personnelData.sort((a, b) => b.productivity - a.productivity)[0];
        response = `🏆 **بهترین پرسنل:** ${best.fullName}\n\n📊 عملکرد:\n• بهره‌وری: ${best.productivity}%\n• دستور کارها: ${best.completedWorkOrders}\n• امتیاز: ${best.rating}/۵\n• سمت: ${best.position}\n\n✨ ادامه این روند در ۲ ماه آینده منجر به دریافت پاداش عملکرد می‌شود.`;
      } else if (text.includes("پیش‌بینی") || text.includes("خرابی")) {
        response = `🔮 **پیش‌بینی هفته آینده:**\n\n۱. **پمپ هیدرولیک HP-350** - احتمال ۸۷٪ خرابی در ۱۵ روز\n۲. **دستگاه بسته‌بندی PK-301** - احتمال ۷۲٪ در ۲۵ روز\n\n💡 توصیه: به تب "پیش‌بینی هوشمند" مراجعه کنید.\n\n💰 صرفه‌جویی با اقدام به‌موقع: **۷۳ میلیون ریال**`;
      } else if (text.includes("هزینه")) {
        response = `💰 **تحلیل هزینه نگهداری:**\n\n📈 هزینه ماه جاری: **۳۵۰ میلیون ریال**\n• پیشگیرانه: ۴۵٪ (۱۵۷.۵M)\n• اصلاحی: ۳۲٪ (۱۱۲M)\n• خرابی: ۱۸٪ (۶۳M)\n• پیش‌بینانه: ۵٪ (۱۷.۵M)\n\n📊 نسبت به ماه قبل: **۱۲٪ کاهش** ✅\n\n💡 اگر PdM را ۲ برابر کنید، هزینه‌های اصلاحی ۴۰٪ کم می‌شود.`;
      } else if (text.includes("PM") || text.includes("پمپ")) {
        response = `📋 **پیشنهاد PM برای پمپ هیدرولیک:**\n\n**روزانه (اپراتور):**\n☐ بازرسی نشتی روغن\n☐ اندازه‌گیری دما\n☐ بررسی صدای غیرعادی\n\n**هفتگی:**\n☐ چک فشار خروجی\n☐ بررسی لرزش\n\n**ماهانه:**\n☐ تعویض فیلتر روغن\n☐ بازرسی سیل‌ها\n☐ تست عملکرد کامل\n\n**سه‌ماهه:**\n☐ تعویض کامل روغن\n☐ بازرسی بلبرینگ‌ها\n☐ کالیبراسیون سنسورها`;
      } else {
        response = `متوجه شدم! برای پاسخ دقیق‌تر می‌تونید:\n\n• یکی از سوالات پیشنهادی رو انتخاب کنید\n• یا سوال خود را دقیق‌تر بپرسید\n\nمی‌تونم در زمینه‌های زیر کمک کنم:\n📊 تحلیل داده‌ها و شاخص‌ها\n🔧 پیشنهاد PM\n🎯 تحلیل RCA و FMEA\n💰 بهینه‌سازی هزینه‌ها\n👥 مدیریت پرسنل`;
      }
      setMessages(m => [...m, { role: "ai", content: response }]);
      setThinking(false);
    }, 1200);
  };

  return (
    <div className="chart-card !p-0 overflow-hidden flex flex-col" style={{ height: "60vh" }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              msg.role === "user"
                ? "bg-gradient-to-l from-amber-500 to-amber-700 text-[#0a0a0a] rounded-tr-md"
                : "bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-tl-md"
            }`}>
              {msg.role === "ai" && (
                <div className="flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-500">مشاور نت‌سلن</span>
                </div>
              )}
              <p className="text-xs whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{
                __html: msg.content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              }} />
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-end">
            <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span className="text-xs text-gray-500">در حال تحلیل...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2 flex-wrap">
        {quickPrompts.map((p, i) => (
          <button key={i} onClick={() => send(p)} className="text-[10px] px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10">
            {p}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-[#1a1a1a] flex items-center gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} placeholder="سوال بپرسید..." className="input-field flex-1" />
        <button onClick={() => send(input)} disabled={!input.trim()} className="btn-primary !p-2 disabled:opacity-40">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function RCAView() {
  return (
    <div className="space-y-3">
      <div className="chart-card">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-red-500" />
          تحلیل علت ریشه‌ای (RCA) - ۵ چرا
        </h3>
        <div className="space-y-2">
          {[
            { q: "چرا بلبرینگ خراب شد؟", a: "لرزش غیرعادی داشت" },
            { q: "چرا لرزش داشت؟", a: "عدم هم‌محوری شفت" },
            { q: "چرا هم‌محور نبود؟", a: "کوپلینگ فرسوده شده بود" },
            { q: "چرا کوپلینگ فرسوده شد؟", a: "عدم بازرسی دوره‌ای" },
            { q: "چرا بازرسی نشد؟", a: "چک‌لیست شامل کوپلینگ نبود" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-[#0a0a0a]">
              <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
              <div className="flex-1">
                <p className="text-xs font-bold">{item.q}</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><ChevronLeft className="w-3 h-3" />{item.a}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-xs font-bold text-green-600 dark:text-green-500">✅ علت ریشه‌ای: نقص در برنامه PM</p>
          <p className="text-[11px] text-gray-500 mt-1">اقدام اصلاحی: افزودن بازرسی کوپلینگ به چک‌لیست ماهانه</p>
        </div>
      </div>

      <div className="chart-card">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-500" />
          تحلیل FMEA
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="text-right py-2 px-2 text-gray-500">حالت خرابی</th>
                <th className="text-center py-2 px-2 text-gray-500">S</th>
                <th className="text-center py-2 px-2 text-gray-500">O</th>
                <th className="text-center py-2 px-2 text-gray-500">D</th>
                <th className="text-center py-2 px-2 text-gray-500">RPN</th>
                <th className="text-center py-2 px-2 text-gray-500">اولویت</th>
              </tr>
            </thead>
            <tbody>
              {[
                { mode: "خرابی بلبرینگ", s: 8, o: 5, d: 4, priority: "بحرانی", color: "#ef4444" },
                { mode: "کوپلینگ فرسوده", s: 6, o: 6, d: 4, priority: "بالا", color: "#f59e0b" },
                { mode: "گرمای موتور", s: 9, o: 3, d: 5, priority: "بالا", color: "#f59e0b" },
                { mode: "نشتی هیدرولیک", s: 7, o: 4, d: 3, priority: "متوسط", color: "#3b82f6" },
                { mode: "خطای PLC", s: 9, o: 2, d: 3, priority: "پایین", color: "#22c55e" },
              ].map((item, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-[#0a0a0a]">
                  <td className="py-2 px-2 font-bold">{item.mode}</td>
                  <td className="py-2 px-2 text-center">{item.s}</td>
                  <td className="py-2 px-2 text-center">{item.o}</td>
                  <td className="py-2 px-2 text-center">{item.d}</td>
                  <td className="py-2 px-2 text-center font-black" style={{ color: item.color }}>{item.s * item.o * item.d}</td>
                  <td className="py-2 px-2 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: item.color + '20', color: item.color }}>{item.priority}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RecommendationsView() {
  const recommendations = [
    { title: "افزایش PdM برای تجهیزات بحرانی", desc: "با نصب سنسور وایبرشن روی ۳ تجهیز بحرانی، MTBF ۴۰٪ بهبود می‌یابد", saving: 85, priority: "high", icon: TrendingUp, color: "#22c55e" },
    { title: "کاهش قطعات راکد انبار", desc: "۱۲ قطعه در ۶ ماه اخیر مصرف نشده. کاهش موجودی = آزادسازی ۴۰M ریال سرمایه", saving: 40, priority: "medium", icon: Package, color: "#3b82f6" },
    { title: "بهینه‌سازی زمان‌بندی شیفت", desc: "با انتقال ۲ نفر از شیفت شب به عصر، بار کاری متعادل‌تر می‌شود", saving: 15, priority: "medium", icon: Zap, color: "#f59e0b" },
    { title: "آموزش تکنیسین برق", desc: "افزودن گواهی PLC S7-1500 برای ۲ نفر، وابستگی به کارشناس بیرونی را ۵۰٪ کاهش می‌دهد", saving: 60, priority: "high", icon: ListChecks, color: "#8b5cf6" },
    { title: "اصلاح چک‌لیست PM ماهانه", desc: "افزودن بازرسی کوپلینگ و هم‌محوری از تکرار خرابی بلبرینگ جلوگیری می‌کند", saving: 45, priority: "critical", icon: Target, color: "#ef4444" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <div key={i} className="chart-card !p-4 border-r-4" style={{ borderRightColor: rec.color }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: rec.color + '20' }}>
                  <Icon className="w-5 h-5" style={{ color: rec.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-[9px] text-amber-500 font-bold">AI</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: rec.color + '20', color: rec.color }}>
                      {rec.priority === "critical" ? "بحرانی" : rec.priority === "high" ? "بالا" : "متوسط"}
                    </span>
                  </div>
                  <p className="font-bold text-sm">{rec.title}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{rec.desc}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-[#0a0a0a]">
                    <span className="text-xs text-green-500 font-bold">💰 صرفه‌جویی: {rec.saving}M ریال</span>
                    <button className="text-[10px] px-2 py-1 rounded bg-amber-500 text-[#0a0a0a] font-bold">اجرا</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Missing icon import fix
function ChevronLeft({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="15 18 9 12 15 6"></polyline></svg>;
}
