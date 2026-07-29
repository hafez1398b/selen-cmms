"use client";
import { useAppState } from "@/context/AppStateContext";
import { useState } from "react";
export function SparePartForm() {
  const { setModalOpen, setModalType } = useAppState();
  const [fd, setFd] = useState({ name: "", code: "", category: "", minStock: "0", price: "", location: "" });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs text-gray-500 mb-1 block">نام قطعه<span className="text-red-400">*</span></label><input className="input-field" onChange={e => setFd(p => ({ ...p, name: e.target.value }))} /></div>
        <div><label className="text-xs text-gray-500 mb-1 block">کد قطعه<span className="text-red-400">*</span></label><input className="input-field" onChange={e => setFd(p => ({ ...p, code: e.target.value }))} /></div>
        <div><label className="text-xs text-gray-500 mb-1 block">دسته‌بندی</label><select className="select-field" onChange={e => setFd(p => ({ ...p, category: e.target.value }))}><option>بلبرینگ</option><option>تسمه</option><option>فیلتر</option><option>سنسور</option><option>الکتریکی</option></select></div>
        <div><label className="text-xs text-gray-500 mb-1 block">حداقل موجودی</label><input type="number" className="input-field" onChange={e => setFd(p => ({ ...p, minStock: e.target.value }))} /></div>
        <div><label className="text-xs text-gray-500 mb-1 block">قیمت واحد</label><input type="number" className="input-field" onChange={e => setFd(p => ({ ...p, price: e.target.value }))} /></div>
        <div><label className="text-xs text-gray-500 mb-1 block">محل</label><input className="input-field" onChange={e => setFd(p => ({ ...p, location: e.target.value }))} /></div>
      </div>
      <div className="flex gap-2 pt-4"><button className="btn-primary flex-1" onClick={() => { setModalOpen(false); setModalType(""); }}>ذخیره</button><button className="btn-secondary flex-1" onClick={() => { setModalOpen(false); setModalType(""); }}>انصراف</button></div>
    </div>
  );
}
