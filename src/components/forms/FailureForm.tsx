"use client";
import { useAppState } from "@/context/AppStateContext";
import { useState } from "react";
export function FailureForm() {
  const { setModalOpen, setModalType } = useAppState();
  const [fd, setFd] = useState({ title: "", asset: "", severity: "medium", failureType: "mechanical", desc: "" });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs text-gray-500 mb-1 block">عنوان خرابی<span className="text-red-400">*</span></label><input className="input-field" onChange={e => setFd(p => ({ ...p, title: e.target.value }))} /></div>
        <div><label className="text-xs text-gray-500 mb-1 block">تجهیز</label><select className="select-field" onChange={e => setFd(p => ({ ...p, asset: e.target.value }))}><option>آسیاب صنعتی</option><option>نوار نقاله</option><option>پمپ هیدرولیک</option></select></div>
        <div><label className="text-xs text-gray-500 mb-1 block">نوع خرابی</label><select className="select-field" onChange={e => setFd(p => ({ ...p, failureType: e.target.value }))}><option>مکانیکی</option><option>الکتریکی</option><option>هیدرولیک</option><option>الکترونیکی</option></select></div>
      </div>
      <div><label className="text-xs text-gray-500 mb-1 block">شدت</label>
        <div className="flex gap-2">{[{ k: "low", l: "کم" }, { k: "medium", l: "متوسط" }, { k: "high", l: "بالا" }, { k: "critical", l: "بحرانی" }].map(s => (
          <button key={s.k} onClick={() => setFd(p => ({ ...p, severity: s.k }))} className={`px-3 py-1.5 rounded-lg text-xs ${fd.severity === s.k ? `${s.k === 'critical' ? 'bg-red-500' : s.k === 'high' ? 'bg-amber-500' : s.k === 'medium' ? 'bg-blue-500' : 'bg-green-500'} text-white` : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400'}`}>{s.l}</button>
        ))}</div>
      </div>
      <div><label className="text-xs text-gray-500 mb-1 block">شرح</label><textarea className="input-field resize-none h-20" onChange={e => setFd(p => ({ ...p, desc: e.target.value }))} /></div>
      <div className="flex gap-2 pt-4"><button className="btn-primary flex-1" onClick={() => { setModalOpen(false); setModalType(""); }}>ثبت</button><button className="btn-secondary flex-1" onClick={() => { setModalOpen(false); setModalType(""); }}>انصراف</button></div>
    </div>
  );
}
