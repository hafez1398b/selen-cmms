"use client";
import { useAppState } from "@/context/AppStateContext";
import { workOrdersData, getStatusBadge } from "@/lib/data";
import { useState } from "react";
import { Plus, Search, Edit2, Trash2, User, Clock, Calendar } from "lucide-react";

export function WorkOrdersPage() {
  const { setModalOpen, setModalType, setSelectedItem } = useAppState();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  let filtered = workOrdersData;
  if (searchTerm) filtered = filtered.filter(w => w.title.includes(searchTerm) || w.orderNumber.includes(searchTerm));
  if (filterStatus !== "all") filtered = filtered.filter(w => w.status === filterStatus);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {[
          { label: "کل دستور کارها", value: workOrdersData.length, color: "#3b82f6" },
          { label: "باز", value: workOrdersData.filter(w => w.status === "open").length, color: "#d4a017" },
          { label: "در حال انجام", value: workOrdersData.filter(w => w.status === "in_progress").length, color: "#f59e0b" },
          { label: "تکمیل شده", value: workOrdersData.filter(w => w.status === "completed").length, color: "#22c55e" },
        ].map((c, i) => (
          <div key={i} className="kpi-card !p-3 md:!p-4 text-center">
            <p className="text-[10px] text-gray-500 dark:text-gray-500 mb-1">{c.label}</p>
            <p className="text-xl md:text-2xl font-black" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="chart-card !p-3 md:!p-5">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="جستجو..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pr-10" />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-field flex-1 md:w-[140px] md:flex-initial">
              <option value="all">همه</option>
              <option value="open">باز</option>
              <option value="in_progress">در حال انجام</option>
              <option value="completed">تکمیل شده</option>
            </select>
            <button className="btn-primary flex-1 md:flex-initial justify-center" onClick={() => { setModalType("addWorkOrder"); setSelectedItem(null); setModalOpen(true); }}>
              <Plus className="w-4 h-4" /> <span className="hidden md:inline">دستور کار جدید</span><span className="md:hidden">جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        {paginated.map(wo => (
          <div key={wo.id} className="chart-card !p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-gray-500">{wo.orderNumber}</span>
                  <span className={`badge ${getStatusBadge(wo.priority).className} !text-[9px]`}>{getStatusBadge(wo.priority).label}</span>
                </div>
                <p className="text-sm font-bold">{wo.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{wo.assetName}</p>
              </div>
              <span className={`badge ${getStatusBadge(wo.status).className} flex-shrink-0`}>{getStatusBadge(wo.status).label}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-[#1a1a1a] text-[10px]">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{wo.assignedTo}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{wo.estimatedHours}h</span>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500" onClick={() => { setModalType("editWorkOrder"); setSelectedItem(wo); setModalOpen(true); }}>
                  <Edit2 className="w-3 h-3" />
                </button>
                <button className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block chart-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                <th className="text-right py-3 px-4 text-gray-500 font-medium">شماره</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">عنوان</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">تجهیز</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">نوع</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">اولویت</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">مسئول</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">وضعیت</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">ساعت</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(wo => (
                <tr key={wo.id} className="border-b border-gray-200 dark:border-[#1a1a1a] table-row-hover">
                  <td className="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">{wo.orderNumber}</td>
                  <td className="py-3 px-4 font-medium">{wo.title}</td>
                  <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-gray-400">{wo.assetName}</td>
                  <td className="py-3 px-4 text-center"><span className={`badge ${getStatusBadge(wo.type).className}`}>{getStatusBadge(wo.type).label}</span></td>
                  <td className="py-3 px-4 text-center"><span className={`badge ${getStatusBadge(wo.priority).className}`}>{getStatusBadge(wo.priority).label}</span></td>
                  <td className="py-3 px-4 text-center">{wo.assignedTo}</td>
                  <td className="py-3 px-4 text-center"><span className={`badge ${getStatusBadge(wo.status).className}`}>{getStatusBadge(wo.status).label}</span></td>
                  <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{wo.estimatedHours}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-amber-500" onClick={() => { setModalType("editWorkOrder"); setSelectedItem(wo); setModalOpen(true); }}><Edit2 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-[#1a1a1a]">
          <p className="text-xs text-gray-500">{filtered.length} مورد</p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-sm ${currentPage === i + 1 ? 'bg-amber-500 text-[#0a0a0a] font-bold' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400'}`}>{i + 1}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Pagination */}
      <div className="md:hidden flex items-center justify-between px-2">
        <p className="text-xs text-gray-500">{filtered.length} مورد</p>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-7 h-7 rounded-lg text-xs ${currentPage === i + 1 ? 'bg-amber-500 text-[#0a0a0a] font-bold' : 'bg-gray-100 dark:bg-[#1a1a1a]'}`}>{i + 1}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
