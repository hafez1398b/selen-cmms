"use client";
import { useAppState } from "@/context/AppStateContext";
import { useState } from "react";

export function AssetForm() {
  const { setModalOpen, setModalType } = useAppState();
  const [formData, setFormData] = useState({ name: "", code: "", parentId: "", manufacturer: "", model: "", serialNumber: "", criticality: "medium", status: "active" });

  const handleSubmit = () => { console.log("Asset:", formData); setModalOpen(false); setModalType(""); };
  const fields = [
    { label: "نام تجهیز", key: "name", type: "text", required: true },
    { label: "کد تجهیز", key: "code", type: "text", required: true },
    { label: "تجهیز والد", key: "parentId", type: "select", options: ["بدون والد", "سایت تولید اصلی", "ناحیه فرآوری", "ناحیه بسته‌بندی", "واحد آسیاب"] },
    { label: "سازنده", key: "manufacturer", type: "text" },
    { label: "مدل", key: "model", type: "text" },
    { label: "شماره سریال", key: "serialNumber", type: "text" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="text-xs text-gray-500 mb-1 block">{f.label}{f.required && <span className="text-red-400">*</span>}</label>
            {f.type === "select" ? (
              <select className="select-field" onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}>{f.options?.map(o => <option key={o}>{o}</option>)}</select>
            ) : (
              <input type={f.type} className="input-field" placeholder={f.label} onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))} />
            )}
          </div>
        ))}
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">بحرانیت</label>
        <div className="flex gap-2">
          {[{ k: "low", l: "پایین" }, { k: "medium", l: "متوسط" }, { k: "high", l: "بالا" }, { k: "critical", l: "بحرانی" }].map(p => (
            <button key={p.k} onClick={() => setFormData(prev => ({ ...prev, criticality: p.k }))}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${formData.criticality === p.k
                ? p.k === 'critical' ? 'bg-red-500 text-white' : p.k === 'high' ? 'bg-amber-500 text-[#0a0a0a]' : p.k === 'medium' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400'}`}>{p.l}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-4"><button className="btn-primary flex-1" onClick={handleSubmit}>ذخیره</button><button className="btn-secondary flex-1" onClick={() => { setModalOpen(false); setModalType(""); }}>انصراف</button></div>
    </div>
  );
}
