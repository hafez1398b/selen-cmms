"use client";
import { useAppState } from "@/context/AppStateContext";
import { personnelData } from "@/lib/data";
import { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

export function PersonnelPage() {
  const { setModalOpen, setModalType, setSelectedItem } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  let filtered = personnelData;
  if (searchTerm) filtered = filtered.filter(p => p.fullName.includes(searchTerm) || p.position.includes(searchTerm));

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "کل پرسنل", value: personnelData.length, color: "#8b5cf6" },
          { label: "فعال", value: personnelData.filter(p => p.isActive).length, color: "#22c55e" },
          { label: "میانگین بهره‌وری", value: (personnelData.reduce((s, p) => s + Number(p.productivity), 0) / personnelData.length).toFixed(0) + "%", color: "#d4a017" },
          { label: "کل دستور کارها", value: personnelData.reduce((s, p) => s + p.completedWorkOrders, 0), color: "#3b82f6" },
        ].map((c, i) => (
          <div key={i} className="kpi-card text-center"><p className="text-[10px] text-gray-500 mb-1">{c.label}</p><p className="text-2xl font-black" style={{ color: c.color }}>{c.value}</p></div>
        ))}
      </div>
      <div className="chart-card"><div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-500" /><input type="text" placeholder="جستجو..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pr-10" /></div>
        <button className="btn-primary" onClick={() => { setModalType("addPersonnel"); setSelectedItem(null); setModalOpen(true); }}><Plus className="w-4 h-4" /> افزودن پرسنل</button>
      </div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="chart-card card-hover">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0">
                <span className="text-[#0a0a0a] font-black text-lg">{p.fullName.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm">{p.fullName}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-500">{p.position}</p>
              </div>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-500">
              <div><span>دپارتمان:</span><p className="text-white mt-1">{p.department}</p></div>
              <div><span>نقش:</span><p className="text-white mt-1">{p.role}</p></div>
              <div><span>بهره‌وری:</span><p className="text-green-400 mt-1 font-bold">{p.productivity}%</p></div>
              <div><span>دستور کارها:</span><p className="text-white mt-1 font-bold">{p.completedWorkOrders}</p></div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#1a1a1a] flex justify-between items-center">
              <div className="progress-bar w-24"><div className="progress-fill bg-gradient-to-l from-amber-500 to-amber-700" style={{ width: `${p.productivity}%` }} /></div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:bg-[#1a1a1a] text-amber-400" onClick={() => { setModalType("editPersonnel"); setSelectedItem(p); setModalOpen(true); }}><Edit2 className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
