"use client";
import { failuresData, assetsData, personnelData, workOrdersData } from "@/lib/data";
import { useState } from "react";
import { Send, Bot, Sparkles, Loader2 } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const quickQuestions = ["بیشترین خرابی مربوط به کدام تجهیز است؟", "MTBF کدام تجهیزات کاهش یافته؟", "کدام تکنسین بیشترین دستورکار را انجام داده؟", "وضعیت OEE چگونه است؟", "توصیه‌های پیشگیرانه چیست؟"];

interface ChatMessage { id: number; role: "user" | "assistant"; content: string; chartData?: any[]; }

export function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "assistant", content: "سلام! 👋 من دستیار هوشمند CMMS Pro هستم. می‌توانم به سوالات شما درباره وضعیت تجهیزات، خرابی‌ها، عملکرد پرسنل و شاخص‌های کلیدی پاسخ دهم." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const getAIResponse = (question: string): ChatMessage => {
    if (question.includes("بیشترین خرابی")) {
      const top = assetsData.filter(a => a.totalFailures > 0).sort((a, b) => b.totalFailures - a.totalFailures)[0];
      return { id: Date.now(), role: "assistant", content: `**${top.name}** بیشترین خرابی: ${top.totalFailures} مورد\nMTBF: ${top.mtbf} ساعت | MTTR: ${top.mttr} ساعت | سلامت: ${top.healthScore}%`, chartData: assetsData.filter(a => a.totalFailures > 0).sort((a, b) => b.totalFailures - a.totalFailures).slice(0, 5).map(a => ({ name: a.name, count: a.totalFailures })) };
    }
    if (question.includes("تکنسین")) {
      const sorted = [...personnelData].sort((a, b) => b.completedWorkOrders - a.completedWorkOrders);
      return { id: Date.now(), role: "assistant", content: sorted.map((p, i) => `${i + 1}. **${p.fullName}**: ${p.completedWorkOrders} دستور | ${p.productivity}%`).join("\n") };
    }
    return { id: Date.now(), role: "assistant", content: `📊 ${assetsData.length} تجهیز | 🔧 ${workOrdersData.length} دستور کار | ⚠️ ${failuresData.length} خرابی` };
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: text }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => { setMessages(prev => [...prev, getAIResponse(text)]); setIsTyping(false); }, 1200);
  };

  return (
    <div className="p-3 md:p-5 lg:p-6 animate-fade-in flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
      <div className="chart-card flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-[#1a1a1a] mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center"><Bot className="w-5 h-5 text-[#0a0a0a]" /></div>
          <div><h3 className="font-bold text-sm">دستیار هوشمند CMMS</h3><p className="text-[10px] text-gray-500 dark:text-gray-500">تحلیل‌گر مبتنی بر AI</p></div>
          <div className="mr-auto flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /><span className="text-xs text-amber-400">AI</span></div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] ${msg.role === "user" ? "bg-gradient-to-br from-amber-600 to-amber-800 text-[#0a0a0a] rounded-2xl rounded-tr-md" : "bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl rounded-tl-md"} p-4`}>
                {msg.role === "assistant" && <div className="flex items-center gap-1 mb-2"><Sparkles className="w-3 h-3 text-amber-400" /><span className="text-xs text-amber-400">AI</span></div>}
                <p className="text-sm whitespace-pre-wrap" dir="rtl">{msg.content}</p>
                {msg.chartData && (
                  <div className="mt-3 h-40"><ResponsiveContainer width="100%" height="100%"><BarChart data={msg.chartData}><CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" /><XAxis dataKey="name" stroke="#555" fontSize={10} tick={{ fill: '#888' }} /><YAxis stroke="#555" fontSize={10} tick={{ fill: '#888' }} /><Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 8 }} /><Bar dataKey="count" fill="#d4a017" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                )}
              </div>
            </div>
          ))}
          {isTyping && <div className="flex justify-end"><div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-4 flex items-center gap-2"><Loader2 className="w-4 h-4 text-amber-400 animate-spin" /><span className="text-xs text-gray-600 dark:text-gray-400">در حال تحلیل...</span></div></div>}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">{quickQuestions.map((q, i) => (<button key={i} onClick={() => sendMessage(q)} className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-[#2a2a2a] text-gray-400 hover:border-amber-500 hover:text-amber-400 transition-colors">{q}</button>))}</div>
        <div className="flex items-center gap-2"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(input)} placeholder="سوال خود را بپرسید..." className="input-field border-none flex-1 bg-gray-100 dark:bg-[#1a1a1a]" /><button onClick={() => sendMessage(input)} className="btn-primary py-2 px-4"><Send className="w-4 h-4" /></button></div>
      </div>
    </div>
  );
}
