"use client";
import { useAppState } from "@/context/AppStateContext";
import { useState } from "react";
export function PersonnelForm() {
  const { setModalOpen, setModalType } = useAppState();
  const [fd, setFd] = useState({ name: "", username: "", position: "", dept: "", role: "تکنسین" });
  const fields = [
    { label: "نام کامل", key: "name", req: true },
    { label: "نام کاربری", key: "username", req: true },
    { label: "سمت", key: "position" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key}><label className="text-xs text-gray-500 mb-1 block">{f.label}{f.req && <span className="text-red-400">*</span>}</label>
            <input className="input-field" onChange={e => setFd(p => ({ ...p, [f.key]: e.target.value }))} /></div>
        ))}
        <div><label className="text-xs text-gray-500 mb-1 block">دپارتمان</label><select className="select-field" onChange={e => setFd(p => ({ ...p, dept: e.target.value }))}><option>تعمیرات مکانیک</option><option>تعمیرات برق</option><option>ابزار دقیق</option></select></div>
        <div><label className="text-xs text-gray-500 mb-1 block">نقش</label><select className="select-field" onChange={e => setFd(p => ({ ...p, role: e.target.value }))}><option>مدیر</option><option>سرپرست</option><option>کارشناس</option><option>تکنسین</option></select></div>
      </div>
      <div className="flex gap-2 pt-4"><button className="btn-primary flex-1" onClick={() => { setModalOpen(false); setModalType(""); }}>ذخیره</button><button className="btn-secondary flex-1" onClick={() => { setModalOpen(false); setModalType(""); }}>انصراف</button></div>
    </div>
  );
}
