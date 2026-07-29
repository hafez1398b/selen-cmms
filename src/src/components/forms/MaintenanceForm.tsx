"use client";
import { useAppState } from "@/context/AppStateContext";
import { useState } from "react";
export function MaintenanceForm() {
  const { setModalOpen, setModalType } = useAppState();
  const [fd, setFd] = useState({ title: "", asset: "", type: "time", interval: "30", unit: "روز", assigned: "" });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs text-gray-500 mb-1 block">عنوان PM<span className="text-red-400">*</span></label><input className="input-field" onChange={e => setFd(p => ({ ...p, title: e.target.value }))} /></div>
        <div><label className="text-xs text-gray-500 mb-1 block">تجهیز</label><select className="select-field" onChange={e => setFd(p => ({ ...p, asset: e.target.value }))}><option>آسیاب صنعتی</option><option>نوار نقاله</option><option>پمپ هیدرولیک</option></select></div>
        <div><label className="text-xs text-gray-500 mb-1 block">فواصل</label><input type="number" className="input-field" onChange={e => setFd(p => ({ ...p, interval: e.target.value }))} /></div>
        <div><label className="text-xs text-gray-500 mb-1 block">واحد</label><select className="select-field" onChange={e => setFd(p => ({ ...p, unit: e.target.value }))}><option>روز</option><option>هفته</option><option>ماه</option><option>ساعت</option></select></div>
        <div><label className="text-xs text-gray-500 mb-1 block">مسئول</label><select className="select-field" onChange={e => setFd(p => ({ ...p, assigned: e.target.value }))}><option>علی محمدی</option><option>رضا احمدی</option><option>حسن رضایی</option></select></div>
      </div>
      <div className="flex gap-2 pt-4"><button className="btn-primary flex-1" onClick={() => { setModalOpen(false); setModalType(""); }}>ذخیره</button><button className="btn-secondary flex-1" onClick={() => { setModalOpen(false); setModalType(""); }}>انصراف</button></div>
    </div>
  );
}
