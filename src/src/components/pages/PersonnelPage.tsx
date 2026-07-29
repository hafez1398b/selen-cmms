"use client";

import { useState, useMemo } from "react";
import { personnelData, skillsData, roleLabels, roleColors, shiftLabels, skillCategoryLabels, skillCategoryColors, type Personnel } from "@/lib/personnel-data";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Users, Search, Plus, User, Star, Award, Clock, TrendingUp, X, Phone, Calendar, Briefcase, ChevronLeft } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";

type ViewMode = "grid" | "matrix" | "shifts";

export function PersonnelPage() {
  const { setCurrentPage } = useAppState();
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selected, setSelected] = useState<Personnel | null>(null);

  let filtered = personnelData;
  if (search) filtered = filtered.filter(p => p.fullName.includes(search) || p.employeeCode.includes(search) || p.position.includes(search));
  if (filterRole !== "all") filtered = filtered.filter(p => p.role === filterRole);

  const stats = useMemo(() => ({
    total: personnelData.length,
    active: personnelData.filter(p => p.isActive).length,
    avgProductivity: Math.round(personnelData.reduce((s, p) => s + p.productivity, 0) / personnelData.length),
    totalWorkOrders: personnelData.reduce((s, p) => s + p.completedWorkOrders, 0),
  }), []);

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-3 md:space-y-4 animate-fade-in">
      {/* Clickable Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <button onClick={() => setFilterRole("all")} className="kpi-card !p-3 card-hover text-right group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center"><Users className="w-4 h-4 text-purple-500" /></div>
            <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
          </div>
          <p className="text-[10px] text-gray-500 mb-0.5">کل پرسنل</p>
          <p className="text-xl md:text-2xl font-black text-purple-500">{stats.total}</p>
        </button>
        <button onClick={() => setFilterRole("all")} className="kpi-card !p-3 card-hover text-right group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center"><User className="w-4 h-4 text-green-500" /></div>
            <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
          </div>
          <p className="text-[10px] text-gray-500 mb-0.5">فعال</p>
          <p className="text-xl md:text-2xl font-black text-green-500">{stats.active}</p>
        </button>
        <button onClick={() => setView("matrix")} className="kpi-card !p-3 card-hover text-right group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-amber-500" /></div>
            <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
          </div>
          <p className="text-[10px] text-gray-500 mb-0.5">میانگین بهره‌وری</p>
          <p className="text-xl md:text-2xl font-black text-amber-500">{stats.avgProductivity}%</p>
        </button>
        <button onClick={() => setCurrentPage("workOrders")} className="kpi-card !p-3 card-hover text-right group cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center"><Briefcase className="w-4 h-4 text-blue-500" /></div>
            <ChevronLeft className="w-3 h-3 text-gray-400 group-hover:text-amber-500 group-hover:-translate-x-1 transition-all" />
          </div>
          <p className="text-[10px] text-gray-500 mb-0.5">کل دستور کارها</p>
          <p className="text-xl md:text-2xl font-black text-blue-500">{stats.totalWorkOrders}</p>
        </button>
      </div>

      {/* View Selector */}
      <div className="chart-card !p-2 flex gap-1 overflow-x-auto scrollbar-hide">
        {[
          { id: "grid", label: "کارت‌های پرسنل" },
          { id: "matrix", label: "ماتریس مهارت" },
          { id: "shifts", label: "شیفت‌بندی" },
        ].map(v => (
          <button key={v.id} onClick={() => setView(v.id as any)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs whitespace-nowrap ${
              view === v.id ? 'bg-gradient-to-l from-amber-500 to-amber-700 text-[#0a0a0a] font-bold' : 'text-gray-500'
            }`}>{v.label}</button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="chart-card !p-3 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pr-10" />
        </div>
        <div className="flex gap-2">
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="select-field flex-1 md:w-[140px]">
            <option value="all">همه سمت‌ها</option>
            <option value="manager">مدیر</option>
            <option value="supervisor">سرپرست</option>
            <option value="expert">کارشناس</option>
            <option value="technician">تکنسین</option>
          </select>
          <button className="btn-primary text-xs"><Plus className="w-4 h-4" /> افزودن پرسنل</button>
        </div>
      </div>

      {view === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(p => (
            <button key={p.id} onClick={() => setSelected(p)} className="chart-card !p-4 card-hover text-right">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#0a0a0a] font-black">{p.fullName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: roleColors[p.role] + '20', color: roleColors[p.role] }}>
                      {roleLabels[p.role]}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                  </div>
                  <p className="font-bold text-sm truncate">{p.fullName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{p.position}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-2.5 h-2.5 ${i <= Math.round(p.rating) ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-[#1a1a1a] text-center">
                <div><p className="text-[9px] text-gray-500">بهره‌وری</p><p className="text-sm font-bold text-green-500">{p.productivity}%</p></div>
                <div><p className="text-[9px] text-gray-500">دستور کار</p><p className="text-sm font-bold text-amber-500">{p.completedWorkOrders}</p></div>
                <div><p className="text-[9px] text-gray-500">مهارت</p><p className="text-sm font-bold text-blue-500">{p.skills.length}</p></div>
              </div>
            </button>
          ))}
        </div>
      )}

      {view === "matrix" && (
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-3">ماتریس مهارت پرسنل</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#1a1a1a]">
                  <th className="text-right py-2 px-2 text-gray-500 sticky right-0 bg-white dark:bg-[#111]">پرسنل</th>
                  {skillsData.map(s => (
                    <th key={s.id} className="text-center py-2 px-1 text-gray-500 font-medium">
                      <div className="[writing-mode:vertical-rl] rotate-180 h-24 flex items-end" title={s.name}>
                        <span className="text-[10px] truncate max-w-[80px]">{s.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 dark:border-[#0a0a0a] table-row-hover cursor-pointer" onClick={() => setSelected(p)}>
                    <td className="py-2 px-2 sticky right-0 bg-white dark:bg-[#111]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-500">{p.fullName.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-[11px]">{p.fullName}</p>
                          <p className="text-[9px] text-gray-500">{p.position}</p>
                        </div>
                      </div>
                    </td>
                    {skillsData.map(skill => {
                      const s = p.skills.find(x => x.skillId === skill.id);
                      return (
                        <td key={skill.id} className="text-center py-2 px-1">
                          {s ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="flex">
                                {[1,2,3,4,5].map(i => (
                                  <div key={i} className="w-1.5 h-3 mx-px rounded-sm" style={{ backgroundColor: i <= s.level ? skillCategoryColors[skill.category] : '#e5e7eb' }} />
                                ))}
                              </div>
                              <span className="text-[8px] text-gray-500">{s.level}</span>
                            </div>
                          ) : <span className="text-gray-300">-</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "shifts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {(["morning", "afternoon", "night", "flexible"] as const).map(shift => {
            const shiftPersonnel = personnelData.filter(p => p.currentShift === shift);
            return (
              <div key={shift} className="chart-card !p-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-[#1a1a1a]">
                  <div>
                    <p className="font-bold text-sm">{shiftLabels[shift]}</p>
                    <p className="text-[10px] text-gray-500">{shiftPersonnel.length} نفر</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  {shiftPersonnel.map(p => (
                    <button key={p.id} onClick={() => setSelected(p)} className="w-full flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-[#0a0a0a] hover:bg-amber-500/10 text-right">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-[#0a0a0a] font-bold text-xs">{p.fullName.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{p.fullName}</p>
                        <p className="text-[9px] text-gray-500 truncate">{roleLabels[p.role]}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && <PersonnelDetail person={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function PersonnelDetail({ person, onClose }: { person: Personnel; onClose: () => void }) {
  const skillRadarData = person.skills.map(s => {
    const skill = skillsData.find(sk => sk.id === s.skillId);
    return { skill: skill?.name.substring(0, 12) || "", level: s.level };
  });

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full md:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111] md:rounded-2xl rounded-t-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="md:hidden flex justify-center pt-2"><div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" /></div>
        <div className="p-4 border-b border-gray-200 dark:border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <span className="text-[#0a0a0a] font-black text-xl">{person.fullName.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-bold text-base">{person.fullName}</h3>
              <p className="text-xs text-gray-500">{person.position}</p>
              <p className="text-[10px] font-mono text-amber-500 mt-0.5">{person.employeeCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg text-center"><p className="text-[10px] text-gray-500">بهره‌وری</p><p className="font-black text-green-500 text-lg">{person.productivity}%</p></div>
            <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg text-center"><p className="text-[10px] text-gray-500">دستور کار</p><p className="font-black text-amber-500 text-lg">{person.completedWorkOrders}</p></div>
            <div className="p-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-lg text-center"><p className="text-[10px] text-gray-500">امتیاز</p><p className="font-black text-blue-500 text-lg">{person.rating}</p></div>
          </div>

          {person.skills.length > 0 && (
            <div className="chart-card !p-3 !border-0 !shadow-none">
              <h4 className="font-bold text-xs mb-2">نمودار مهارت‌ها</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skillRadarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#888', fontSize: 9 }} />
                    <PolarRadiusAxis domain={[0, 5]} tick={{ fill: '#888', fontSize: 8 }} />
                    <Radar name="سطح" dataKey="level" stroke="#d4a017" fill="#d4a017" fillOpacity={0.4} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {person.certifications.length > 0 && (
            <div>
              <h4 className="font-bold text-xs mb-2 flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-500" /> گواهی‌نامه‌ها ({person.certifications.length})</h4>
              <div className="space-y-1.5">
                {person.certifications.map(cert => (
                  <div key={cert.id} className="p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs">
                    <p className="font-bold">{cert.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {cert.issuer} • صادره: {cert.issuedDate}
                      {cert.expiryDate && ` • انقضا: ${cert.expiryDate}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-500" /><span dir="ltr">{person.phone}</span></div>
            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-500" /><span>استخدام: {person.hireDate}</span></div>
            <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-gray-500" /><span>شیفت: {shiftLabels[person.currentShift]}</span></div>
            <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-gray-500" /><span>{person.department}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
