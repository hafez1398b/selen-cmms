"use client";

import { useState } from "react";
import {
  X, User, Clock, Calendar, ClipboardList, Sparkles, Mic, Camera,
  Phone, Video, Send, CheckCircle2, MessageCircle, Users as UsersIcon,
  AlertTriangle, Wrench, PlayCircle, PauseCircle, FileText, Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { VoiceRecorder, CallModal, BeforeAfterPhotos } from "@/components/ui/VoiceRecorder";
import { personnelData } from "@/lib/personnel-data";

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  equipmentName: string;
  status: string;
  priority: string;
  assignedTo: string;
  team: string[];
  createdBy: string;
  createdAt: string;
  estimatedHours: number;
  actualHours?: number;
  diagnosedCause?: string;
  recommendedAction?: string;
  parts: string[];
  cost: number;
  actionsTaken?: string;
  beforePhoto?: string;
  afterPhoto?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workOrder: WorkOrder;
}

const managerFani = { name: "مدیر فنی سلن", role: "مدیر فنی نگهداری" };

export function WorkOrderDetail({ isOpen, onClose, workOrder }: Props) {
  const toast = useToast();
  const [status, setStatus] = useState(workOrder.status);
  const [actionsText, setActionsText] = useState(workOrder.actionsTaken || "");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiAssistantType, setAiAssistantType] = useState<"text" | "voice" | "video">("text");
  const [beforePhoto, setBeforePhoto] = useState(workOrder.beforePhoto || "");
  const [afterPhoto, setAfterPhoto] = useState(workOrder.afterPhoto || "");
  const [callOpen, setCallOpen] = useState<null | "voice" | "video">(null);
  const [selectedTeam, setSelectedTeam] = useState<string[]>(workOrder.team);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  if (!isOpen) return null;

  const handleVoiceTranscript = (text: string) => {
    setActionsText(prev => prev ? `${prev}\n${text}` : text);
    setShowVoiceRecorder(false);
    toast.success("متن ثبت شد", "متن صوتی به شرح اقدامات اضافه شد");
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: "user", text: chatInput }]);
    const currentInput = chatInput;
    setChatInput("");
    setTimeout(() => {
      let response = "";
      if (currentInput.includes("بلبرینگ")) {
        response = "🔧 برای تعویض بلبرینگ:\n1. قطع کامل برق\n2. باز کردن Coupling\n3. استفاده از Puller مناسب\n4. تمیز کردن شفت\n5. نصب بلبرینگ جدید با Press\n\n⚠️ حتماً هم‌محورسازی را با Dial Indicator چک کنید.";
      } else if (currentInput.includes("روغن") || currentInput.includes("نشت")) {
        response = "💧 برای رفع نشتی روغن:\n1. تعویض سیل و اورینگ\n2. بازرسی سطح پمپ\n3. بستن اتصالات با Torque مناسب\n4. تست فشار سیستم\n\n📊 توصیه: از سیل SKF یا Parker استفاده کنید.";
      } else {
        response = `متوجه سوال شما شدم. با توجه به تجهیز ${workOrder.equipmentName}، پیشنهاد می‌کنم ابتدا بازرسی چشمی انجام دهید و اگر نیاز به توضیح بیشتر بود، تماس تصویری با مدیر فنی برقرار کنید.`;
      }
      setChatMessages(prev => [...prev, { role: "ai", text: response }]);
    }, 1000);
  };

  const changeStatus = (newStatus: string) => {
    setStatus(newStatus);
    toast.success("وضعیت تغییر کرد", `دستور کار به «${newStatus}» تغییر یافت`);
  };

  const complete = () => {
    if (!actionsText.trim()) {
      toast.warning("ناقص", "لطفاً شرح اقدامات را تکمیل کنید");
      return;
    }
    if (!afterPhoto) {
      toast.warning("ناقص", "لطفاً عکس بعد از اقدام را بارگذاری کنید");
      return;
    }
    changeStatus("تکمیل شده");
    toast.success("دستور کار تکمیل شد", "گزارش نهایی برای مدیر فنی ارسال شد");
    setTimeout(onClose, 1200);
  };

  const priorityColor = {
    critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#22c55e"
  }[workOrder.priority] || "#3b82f6";

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full md:max-w-4xl max-h-[95vh] overflow-hidden bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="md:hidden flex justify-center pt-2"><div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" /></div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a]">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold">{workOrder.id}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: priorityColor + '20', color: priorityColor }}>
                  {workOrder.priority}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 font-bold">{status}</span>
              </div>
              <h3 className="font-bold text-base">{workOrder.title}</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">🔧 {workOrder.equipmentName}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"><X className="w-5 h-5" /></button>
          </div>

          {/* Manager Consultation Buttons */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-[#0a0a0a]">
            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="text-[10px] px-3 py-1.5 rounded-full bg-gradient-to-l from-purple-500 to-amber-500 text-white font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              دستیار هوشمند سلن
            </button>
            <button
              onClick={() => setCallOpen("voice")}
              className="text-[10px] px-3 py-1.5 rounded-full bg-blue-500 text-white font-bold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              تماس صوتی با مدیر فنی
            </button>
            <button
              onClick={() => setCallOpen("video")}
              className="text-[10px] px-3 py-1.5 rounded-full bg-green-500 text-white font-bold flex items-center gap-1"
            >
              <Video className="w-3 h-3" />
              تماس تصویری با مدیر فنی
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Description */}
          <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <p className="text-xs font-bold mb-1">شرح مشکل:</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{workOrder.description}</p>
          </div>

          {/* AI Diagnosis (from Manager approval) */}
          {workOrder.diagnosedCause && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-xs font-bold mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                علت خرابی (تایید شده توسط مدیر فنی):
              </p>
              <p className="text-sm font-bold text-amber-500">{workOrder.diagnosedCause}</p>
              {workOrder.recommendedAction && (
                <>
                  <p className="text-xs font-bold mt-3 mb-1">اقدام پیشنهادی AI:</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{workOrder.recommendedAction}</p>
                </>
              )}
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg text-center">
              <p className="text-[10px] text-gray-500">مسئول</p>
              <p className="text-xs font-bold text-amber-500">{workOrder.assignedTo}</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg text-center">
              <p className="text-[10px] text-gray-500">زمان تخمینی</p>
              <p className="text-sm font-bold text-blue-500">{workOrder.estimatedHours}h</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg text-center">
              <p className="text-[10px] text-gray-500">هزینه</p>
              <p className="text-sm font-bold text-green-500">{(workOrder.cost / 1000000).toFixed(1)}M</p>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg text-center">
              <p className="text-[10px] text-gray-500">قطعات</p>
              <p className="text-sm font-bold text-purple-500">{workOrder.parts.length}</p>
            </div>
          </div>

          {/* AI Assistant (Chat) */}
          {showAIAssistant && (
            <div className="chart-card !p-3 border-purple-500/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1 bg-gray-100 dark:bg-[#0a0a0a] rounded-lg p-1">
                  <button onClick={() => setAiAssistantType("text")} className={`text-[10px] px-2 py-1 rounded ${aiAssistantType === "text" ? 'bg-white dark:bg-[#1a1a1a] font-bold' : ''}`}>
                    <MessageCircle className="w-3 h-3 inline mr-1" />متنی
                  </button>
                  <button onClick={() => setAiAssistantType("voice")} className={`text-[10px] px-2 py-1 rounded ${aiAssistantType === "voice" ? 'bg-white dark:bg-[#1a1a1a] font-bold' : ''}`}>
                    <Mic className="w-3 h-3 inline mr-1" />صوتی
                  </button>
                  <button onClick={() => setAiAssistantType("video")} className={`text-[10px] px-2 py-1 rounded ${aiAssistantType === "video" ? 'bg-white dark:bg-[#1a1a1a] font-bold' : ''}`}>
                    <Video className="w-3 h-3 inline mr-1" />تصویری
                  </button>
                </div>
                <span className="text-xs font-bold text-purple-500 mr-auto">دستیار هوشمند سلن</span>
              </div>

              {aiAssistantType === "text" && (
                <>
                  <div className="max-h-48 overflow-y-auto space-y-2 mb-3 min-h-[100px]">
                    {chatMessages.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">سوال خود را از دستیار سلن بپرسید...</p>
                    ) : chatMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[80%] p-2 rounded-lg text-xs ${m.role === "user" ? 'bg-amber-500 text-[#0a0a0a] font-bold' : 'bg-gray-100 dark:bg-[#0a0a0a]'}`}>
                          {m.role === "ai" && <p className="text-[9px] text-purple-500 font-bold mb-1">🤖 AI سلن</p>}
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="سوال بپرسید..." className="input-field flex-1 !py-1.5 !text-xs" />
                    <button onClick={sendChat} className="btn-primary !py-1.5 !px-3">
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}

              {aiAssistantType === "voice" && (
                <VoiceRecorder
                  onTranscript={(text) => {
                    setChatMessages(prev => [...prev, { role: "user", text }]);
                    setAiAssistantType("text");
                    setTimeout(() => sendChat(), 200);
                  }}
                  onCancel={() => setAiAssistantType("text")}
                />
              )}

              {aiAssistantType === "video" && (
                <div className="text-center py-6">
                  <Video className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs mb-3">دستیار تصویری AI سلن</p>
                  <button className="btn-primary" onClick={() => toast.info("فعال‌سازی", "دستیار تصویری آماده استفاده")}>
                    <PlayCircle className="w-4 h-4" />
                    شروع تعامل تصویری
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Actions Text with Voice-to-Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold">شرح اقدامات انجام شده (توسط تکنسین):</label>
              <button
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                className={`text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-all ${showVoiceRecorder ? 'bg-red-500 text-white' : 'bg-gradient-to-l from-purple-500 to-amber-500 text-white'}`}
              >
                <Mic className="w-3 h-3" />
                {showVoiceRecorder ? "بستن ضبط" : "تبدیل صوت به متن"}
              </button>
            </div>

            {showVoiceRecorder && (
              <div className="mb-3">
                <VoiceRecorder onTranscript={handleVoiceTranscript} onCancel={() => setShowVoiceRecorder(false)} />
              </div>
            )}

            <textarea
              value={actionsText}
              onChange={e => setActionsText(e.target.value)}
              placeholder="می‌توانید مستقیم بنویسید یا از دکمه بالا برای ضبط صوت استفاده کنید..."
              className="input-field min-h-[120px] resize-y"
            />
            <p className="text-[10px] text-gray-500 mt-1">💡 تکنسین‌ها می‌توانند حین انجام کار، صوت را ضبط و تبدیل به متن کنند</p>
          </div>

          {/* Before/After Photos */}
          <div>
            <label className="text-xs font-bold mb-2 block flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              تصاویر قبل و بعد از اقدام:
            </label>
            <BeforeAfterPhotos
              beforePhoto={beforePhoto}
              afterPhoto={afterPhoto}
              onBeforeChange={setBeforePhoto}
              onAfterChange={setAfterPhoto}
            />
          </div>

          {/* Team Members */}
          <div>
            <label className="text-xs font-bold mb-2 block flex items-center gap-1">
              <UsersIcon className="w-3.5 h-3.5" />
              اعضای تیم اجرای دستور کار:
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
              {personnelData.map(p => {
                const isSelected = selectedTeam.includes(p.fullName);
                return (
                  <label key={p.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-amber-500 bg-amber-500/10' : 'border-gray-200 dark:border-[#1a1a1a]'}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setSelectedTeam(isSelected ? selectedTeam.filter(t => t !== p.fullName) : [...selectedTeam, p.fullName]);
                      }}
                      className="accent-amber-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{p.fullName}</p>
                      <p className="text-[9px] text-gray-500 truncate">{p.position}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedTeam.length > 0 && (
              <p className="text-[10px] text-amber-500 mt-2">
                ✓ {selectedTeam.length} نفر انتخاب شدند: {selectedTeam.join("، ")}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#1a1a1a] flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">بستن</button>
          <button onClick={complete} className="btn-primary flex-1 justify-center">
            <CheckCircle2 className="w-4 h-4" />
            تکمیل و ثبت گزارش
          </button>
        </div>
      </div>

      {/* Call Modal */}
      {callOpen && (
        <CallModal
          isOpen={true}
          onClose={() => setCallOpen(null)}
          targetName={managerFani.name}
          targetRole={managerFani.role}
          type={callOpen}
        />
      )}
    </div>
  );
}
