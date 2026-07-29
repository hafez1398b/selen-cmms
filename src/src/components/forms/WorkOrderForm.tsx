"use client";
import { useAppState } from "@/context/AppStateContext";
import { useState } from "react";
export function WorkOrderForm() {
  const { setModalOpen, setModalType } = useAppState();
  const [fd, setFd] = useState({ title: "", asset: "", priority: "medium", type: "corrective", assigned: "", hours: "", desc: "" });
  const fields = [
    { label: "عنوان", key: "title", type: "text", req: true },
    { label: "تجهیز", key: "asset", type: "select", opts: ["آسیاب صنعتی", "نوار نقاله", "پمپ هیدرولیک", "کمپرسور"] },
    { label: "نوع", key: "type", type: "select", opts: ["پیشگیرانه", "اصلاحی", "پیش‌بینانه", "اضطراری"] },
    { label: "مسئول", key: "assigned", type: "select", opts: ["علی محمدی", "رضا احمدی", "حسن رضایی", "محمد کریمی"] },
    { label: "ساعت تخمینی", key: "hours", type: "number" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key}><label className="text-xs text-gray-500 mb-1 block">{f.label}{f.req && <span className="text-red-400">*</span>}</label>
            {f.type === "select" ? <select className="select-field" onChange={e => setFd(p => ({ ...p, [f.key]: e.target.value }))}>{f.opts?.map(o => <option key={o}>{o}</option>)}</select>
              : <input type={f.type} className="input-field" onChange={e => setFd(p => ({ ...p, [f.key]: e.target.value }))} />}
          </div>
        ))}
      </div>
      <div><label className="text-xs text-gray-500 mb-1 block">اولویت</label>
        <div className="flex gap-2">{[{ k: "low", l: "کم" }, { k: "medium", l: "متوسط" }, { k: "high", l: "بالا" }, { k: "critical", l: "بحرانی" }].map(p => (
          <button key={p.k} onClick={() => setFd(prev => ({ ...prev, priority: p.k }))} className={`px-3 py-1.5 rounded-lg text-xs ${fd.priority === p.k ? `${p.k === 'critical' ? 'bg-red-500' : p.k === 'high' ? 'bg-amber-500' : p.k === 'medium' ? 'bg-blue-500' : 'bg-green-500'} text-white` : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400'}`}>{p.l}</button>
        ))}</div>
      </div>
      <div><label className="text-xs text-gray-500 mb-1 block">توضیحات</label><textarea className="input-field resize-none h-20" onChange={e => setFd(p => ({ ...p, desc: e.target.value }))} /></div>
      <div className="flex gap-2 pt-4"><button className="btn-primary flex-1" onClick={() => { setModalOpen(false); setModalType(""); }}>ذخیره</button><button className="btn-secondary flex-1" onClick={() => { setModalOpen(false); setModalType(""); }}>انصراف</button></div>
    </div>
  );
}
