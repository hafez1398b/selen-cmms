"use client";

import { useState } from "react";
import { Calendar, Sparkles, TrendingUp, AlertCircle, Users, Clock, Target, Zap, Filter, Download, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

interface Task {
  id: number;
  title: string;
  asset: string;
  assignee: string;
  startDay: number;
  duration: number;
  progress: number;
  priority: "critical" | "high" | "medium" | "low";
  status: "planned" | "in_progress" | "completed" | "delayed";
  aiOptimized?: boolean;
}

const tasks: Task[] = [
  { id: 1, title: "سرویس ماهانه آسیاب صنعتی", asset: "دستگاه آسیاب صنعتی", assignee: "علی محمدی", startDay: 1, duration: 3, progress: 100, priority: "high", status: "completed" },
  { id: 2, title: "تعویض بلبرینگ اصلی", asset: "دستگاه آسیاب صنعتی", assignee: "علی محمدی", startDay: 4, duration: 2, progress: 75, priority: "critical", status: "in_progress", aiOptimized: true },
  { id: 3, title: "بازدید هفتگی نوار نقاله", asset: "نوار نقاله اصلی", assignee: "حسن رضایی", startDay: 2, duration: 1, progress: 100, priority: "medium", status: "completed" },
  { id: 4, title: "کالیبراسیون سنسورها", asset: "دستگاه بسته‌بندی", assignee: "محمد کریمی", startDay: 6, duration: 2, progress: 40, priority: "medium", status: "in_progress" },
  { id: 5, title: "سرویس ۵۰۰ ساعته کمپرسور", asset: "کمپرسور هوا", assignee: "رضا احمدی", startDay: 8, duration: 3, progress: 20, priority: "high", status: "in_progress", aiOptimized: true },
  { id: 6, title: "تعمیر پمپ هیدرولیک", asset: "پمپ هیدرولیک", assignee: "علی محمدی", startDay: 10, duration: 4, progress: 0, priority: "critical", status: "planned", aiOptimized: true },
  { id: 7, title: "تعویض فیلتر روغن", asset: "پمپ هیدرولیک", assignee: "مهدی عباسی", startDay: 12, duration: 1, progress: 0, priority: "medium", status: "planned" },
  { id: 8, title: "بازرسی وایبرشن موتور", asset: "موتور الکتریکی", assignee: "محمد کریمی", startDay: 14, duration: 1, progress: 0, priority: "low", status: "planned" },
  { id: 9, title: "PM سیستم روانکاری", asset: "سیستم روانکاری", assignee: "حسن رضایی", startDay: 15, duration: 2, progress: 0, priority: "high", status: "planned", aiOptimized: true },
  { id: 10, title: "بازرسی کلی سیستم", asset: "خط تولید", assignee: "امیر حسینی", startDay: 18, duration: 5, progress: 0, priority: "high", status: "planned" },
  { id: 11, title: "تعویض تسمه نوار نقاله", asset: "نوار نقاله اصلی", assignee: "سعید نوری", startDay: 20, duration: 2, progress: 0, priority: "medium", status: "planned" },
  { id: 12, title: "سرویس فصلی موتورها", asset: "چند تجهیز", assignee: "علی محمدی", startDay: 22, duration: 4, progress: 0, priority: "high", status: "planned" },
];

const totalDays = 30;

const priorityColors = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#3b82f6",
  low: "#22c55e",
};

const statusColors = {
  planned: "#6b7280",
  in_progress: "#d4a017",
  completed: "#22c55e",
  delayed: "#ef4444",
};

const statusLabels = {
  planned: "برنامه‌ریزی شده",
  in_progress: "در حال انجام",
  completed: "تکمیل شده",
  delayed: "تاخیر خورده",
};

const priorityLabels = {
  critical: "بحرانی",
  high: "بالا",
  medium: "متوسط",
  low: "پایین",
};

export function PlanningPage() {
  const [selectedMonth, setSelectedMonth] = useState("بهمن ۱۴۰۳");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = filterPriority === "all" ? tasks : tasks.filter(t => t.priority === filterPriority);

  // Stats
  const completedCount = tasks.filter(t => t.status === "completed").length;
  const inProgressCount = tasks.filter(t => t.status === "in_progress").length;
  const plannedCount = tasks.filter(t => t.status === "planned").length;
  const aiOptimizedCount = tasks.filter(t => t.aiOptimized).length;

  // Resource allocation chart
  const resourceAllocation = [
    { name: "علی محمدی", hours: 32, capacity: 40 },
    { name: "رضا احمدی", hours: 24, capacity: 40 },
    { name: "حسن رضایی", hours: 28, capacity: 40 },
    { name: "محمد کریمی", hours: 22, capacity: 40 },
    { name: "مهدی عباسی", hours: 18, capacity: 40 },
    { name: "سعید نوری", hours: 20, capacity: 40 },
  ];

  // Progress trend
  const progressTrend = [
    { week: "هفته ۱", planned: 8, completed: 7 },
    { week: "هفته ۲", planned: 12, completed: 10 },
    { week: "هفته ۳", planned: 15, completed: 12 },
    { week: "هفته ۴", planned: 20, completed: 15 },
  ];

  // AI Insights
  const aiInsights = [
    {
      icon: Zap,
      title: "بهینه‌سازی زمان‌بندی توسط AI",
      desc: `${aiOptimizedCount} وظیفه توسط AI بهینه‌سازی شده. با ترکیب سرویس‌های همزمان، ۱۸ ساعت صرفه‌جویی می‌شود.`,
      color: "amber",
    },
    {
      icon: AlertCircle,
      title: "هشدار تداخل منابع",
      desc: "علی محمدی در روزهای ۴-۶ و ۱۰-۱۴ بار کاری زیادی دارد. توصیه: انتقال وظیفه ۶ به مهدی عباسی.",
      color: "red",
    },
    {
      icon: Target,
      title: "پیش‌بینی تکمیل ماه",
      desc: "با روند فعلی، ۹۲٪ وظایف تا پایان ماه تکمیل می‌شود. برای رسیدن به ۱۰۰٪، ۲ نیروی اضافی برای هفته آخر لازم است.",
      color: "blue",
    },
    {
      icon: TrendingUp,
      title: "پیشنهاد PM پیش‌بینانه",
      desc: "بر اساس داده‌های ۳ ماه اخیر، پمپ هیدرولیک احتمالاً در ۱۵ روز آینده نیاز به بازرسی خواهد داشت.",
      color: "purple",
    },
  ];

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-4 animate-fade-in">

      {/* Header */}
      <div className="chart-card">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#0a0a0a]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-amber-500">مرکز برنامه‌ریزی هوشمند</h2>
            <p className="text-xs text-gray-500 mt-0.5">زمان‌بندی گانت، مدیریت منابع و برنامه‌ریزی مبتنی بر هوش مصنوعی</p>
          </div>
          <div className="flex items-center gap-2">
            <select className="select-field w-[140px] text-xs" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              <option>بهمن ۱۴۰۳</option>
              <option>اسفند ۱۴۰۳</option>
              <option>فروردین ۱۴۰۴</option>
            </select>
            <button className="btn-primary text-xs">
              <Sparkles className="w-3.5 h-3.5" /> بهینه‌سازی با AI
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "کل وظایف", value: tasks.length, icon: Calendar, color: "#d4a017" },
          { label: "در حال انجام", value: inProgressCount, icon: Clock, color: "#3b82f6" },
          { label: "تکمیل شده", value: completedCount, icon: Target, color: "#22c55e" },
          { label: "بهینه شده با AI", value: aiOptimizedCount, icon: Sparkles, color: "#8b5cf6" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="kpi-card">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '18' }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-500">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Gantt Chart */}
      <div className="chart-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm">نمودار گانت - زمان‌بندی وظایف</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">{selectedMonth} - {tasks.length} وظیفه فعال</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="select-field w-[130px] text-xs">
              <option value="all">همه اولویت‌ها</option>
              <option value="critical">بحرانی</option>
              <option value="high">بالا</option>
              <option value="medium">متوسط</option>
              <option value="low">پایین</option>
            </select>
            <button className="btn-secondary text-xs py-1.5"><Download className="w-3.5 h-3.5" /> Excel</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Days Header */}
            <div className="flex border-b border-gray-200 dark:border-[#1a1a1a] pb-2 mb-2">
              <div className="w-[240px] flex-shrink-0 text-xs text-gray-500 font-medium px-2">وظیفه / مسئول</div>
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, 1fr)` }}>
                {Array.from({ length: totalDays }, (_, i) => (
                  <div key={i} className="text-center text-[9px] text-gray-500 border-l border-gray-200 dark:border-[#1a1a1a]/50">
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Task Rows */}
            <div className="space-y-1.5">
              {filteredTasks.map(task => {
                const leftPercent = ((task.startDay - 1) / totalDays) * 100;
                const widthPercent = (task.duration / totalDays) * 100;
                const color = statusColors[task.status];

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="flex items-center hover:bg-gray-50 dark:bg-[#111] rounded-lg cursor-pointer py-1 transition-colors"
                  >
                    {/* Task info */}
                    <div className="w-[240px] flex-shrink-0 px-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-6 rounded-full" style={{ backgroundColor: priorityColors[task.priority] }} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-medium text-white truncate">{task.title}</p>
                            {task.aiOptimized && <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                          </div>
                          <p className="text-[9px] text-gray-500 truncate">{task.assignee}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 relative h-8">
                      {/* Grid background */}
                      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, 1fr)` }}>
                        {Array.from({ length: totalDays }, (_, i) => (
                          <div key={i} className="border-l border-gray-200 dark:border-[#1a1a1a]/30" />
                        ))}
                      </div>
                      {/* Bar */}
                      <div
                        className="absolute top-1 h-6 rounded-md shadow-lg flex items-center px-2 group hover:shadow-xl transition-all"
                        style={{
                          right: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          background: `linear-gradient(to left, ${color}, ${color}dd)`,
                          border: task.aiOptimized ? '1px solid rgba(212,160,23,0.6)' : 'none',
                        }}
                      >
                        {/* Progress bar */}
                        <div
                          className="absolute right-0 top-0 bottom-0 rounded-md opacity-50"
                          style={{ width: `${task.progress}%`, backgroundColor: '#000' }}
                        />
                        <span className="relative text-[9px] font-bold text-white truncate">
                          {task.progress > 0 && `${task.progress}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-gray-200 dark:border-[#1a1a1a]">
              {Object.entries(statusColors).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">{statusLabels[key as keyof typeof statusLabels]}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 mr-auto">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-amber-400">بهینه‌سازی شده با AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Resource Allocation */}
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-1">تخصیص منابع - ظرفیت پرسنل</h3>
          <p className="text-[10px] text-gray-500 mb-3">ساعت کار برنامه‌ریزی شده در برابر ظرفیت</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceAllocation} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis type="number" stroke="#555" fontSize={10} tick={{ fill: '#888' }} />
                <YAxis dataKey="name" type="category" stroke="#555" fontSize={10} tick={{ fill: '#888' }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="capacity" name="ظرفیت" fill="#2a2a2a" radius={[0, 6, 6, 0]} barSize={16} />
                <Bar dataKey="hours" name="ساعت کاری" fill="#d4a017" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Trend */}
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-1">روند پیشرفت هفتگی</h3>
          <p className="text-[10px] text-gray-500 mb-3">مقایسه وظایف برنامه‌ریزی شده و تکمیل شده</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                <XAxis dataKey="week" stroke="#555" fontSize={10} tick={{ fill: '#888' }} />
                <YAxis stroke="#555" fontSize={10} tick={{ fill: '#888' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="planned" name="برنامه‌ریزی شده" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" name="تکمیل شده" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="chart-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">تحلیل و پیشنهادات هوش مصنوعی</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-500">بهینه‌سازی هوشمند برنامه‌ریزی</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.map((insight, i) => {
            const Icon = insight.icon;
            const colorMap: Record<string, { bg: string, border: string, icon: string }> = {
              amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-400' },
              red: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400' },
              blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400' },
              purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: 'text-purple-400' },
            };
            const c = colorMap[insight.color];
            return (
              <div key={i} className={`${c.bg} border ${c.border} rounded-xl p-4 flex items-start gap-3`}>
                <Icon className={`w-5 h-5 ${c.icon} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{insight.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-5 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: priorityColors[selectedTask.priority] }} />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedTask.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{selectedTask.asset}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-500">مسئول:</span><span className="text-white">{selectedTask.assignee}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-500">شروع:</span><span className="text-white">روز {selectedTask.startDay}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-500">مدت:</span><span className="text-white">{selectedTask.duration} روز</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-500">اولویت:</span><span style={{ color: priorityColors[selectedTask.priority] }}>{priorityLabels[selectedTask.priority]}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-500">وضعیت:</span><span style={{ color: statusColors[selectedTask.status] }}>{statusLabels[selectedTask.status]}</span></div>
              <div>
                <div className="flex justify-between mb-1"><span className="text-gray-500 dark:text-gray-500">پیشرفت:</span><span className="text-white">{selectedTask.progress}%</span></div>
                <div className="progress-bar"><div className="progress-fill bg-gradient-to-l from-amber-500 to-amber-700" style={{ width: `${selectedTask.progress}%` }} /></div>
              </div>
              {selectedTask.aiOptimized && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-400">بهینه‌سازی شده با AI</p>
                    <p className="text-[10px] text-gray-400 mt-1">این وظیفه توسط هوش مصنوعی برای بهترین زمان اجرا برنامه‌ریزی شده است.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
