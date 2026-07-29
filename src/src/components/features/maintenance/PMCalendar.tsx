"use client";

import { useState } from "react";
import { maintenancePlansData, statusColors, standardColors, type MaintenancePlan } from "@/lib/maintenance-data";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon } from "lucide-react";

interface Props {
  onSelectPM: (pm: MaintenancePlan) => void;
}

// Generate a mock calendar with events
const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export function PMCalendar({ onSelectPM }: Props) {
  const [currentMonth, setCurrentMonth] = useState({ year: 1403, month: 10 }); // Bahman 1403

  // Generate mock day-events map for current month
  const daysInMonth = 30;
  const startDayOfWeek = 4; // چهارشنبه

  const eventsByDay: Record<number, MaintenancePlan[]> = {};
  maintenancePlansData.forEach(pm => {
    // Extract day from nextDue (simple mock)
    const dayMatch = pm.nextDue.match(/\/(\d+)$/);
    if (dayMatch) {
      const day = parseInt(dayMatch[1]);
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(pm);
    }
  });

  const goToPrevMonth = () => {
    setCurrentMonth(m => ({ year: m.month === 1 ? m.year - 1 : m.year, month: m.month === 1 ? 12 : m.month - 1 }));
  };
  const goToNextMonth = () => {
    setCurrentMonth(m => ({ year: m.month === 12 ? m.year + 1 : m.year, month: m.month === 12 ? 1 : m.month + 1 }));
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="chart-card !p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="font-bold text-sm">{monthNames[currentMonth.month - 1]} {currentMonth.year}</h3>
            <p className="text-[10px] text-gray-500">{maintenancePlansData.filter(p => p.status === "scheduled" || p.status === "overdue").length} برنامه فعال</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goToPrevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth({ year: 1403, month: 10 })}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-bold"
          >
            امروز
          </button>
          <button onClick={goToNextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="chart-card !p-2 flex items-center gap-3 text-[10px] overflow-x-auto scrollbar-hide">
        <span className="font-bold flex-shrink-0">راهنما:</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-blue-500" /> برنامه‌ریزی
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-amber-500" /> در حال انجام
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-red-500" /> عقب‌افتاده
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-500" /> تکمیل شده
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="chart-card !p-2">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={i} className="aspect-square" />;
            }
            const events = eventsByDay[day] || [];
            const isToday = day === 28 && currentMonth.month === 10;

            return (
              <div
                key={i}
                className={`aspect-square md:aspect-auto md:min-h-[90px] p-1 md:p-1.5 rounded-lg border transition-all overflow-hidden ${
                  isToday
                    ? 'border-amber-500 bg-amber-500/10'
                    : events.length > 0
                    ? 'border-gray-200 dark:border-[#1a1a1a] bg-gray-50/50 dark:bg-[#0a0a0a] hover:border-amber-500'
                    : 'border-gray-100 dark:border-[#0a0a0a]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] md:text-xs font-bold ${isToday ? 'text-amber-600 dark:text-amber-500' : ''}`}>
                    {day}
                  </span>
                  {events.length > 0 && (
                    <span className="text-[9px] px-1 rounded bg-amber-500 text-[#0a0a0a] font-bold">
                      {events.length}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5 overflow-hidden hidden md:block">
                  {events.slice(0, 2).map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => onSelectPM(pm)}
                      className="w-full text-right text-[8px] px-1 py-0.5 rounded truncate"
                      style={{
                        backgroundColor: statusColors[pm.status] + '20',
                        color: statusColors[pm.status],
                      }}
                      title={pm.title}
                    >
                      {pm.title}
                    </button>
                  ))}
                  {events.length > 2 && (
                    <div className="text-[8px] text-gray-500 text-center">+{events.length - 2}</div>
                  )}
                </div>
                {/* Mobile: dots */}
                <div className="flex flex-wrap gap-0.5 md:hidden">
                  {events.slice(0, 4).map(pm => (
                    <div
                      key={pm.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: statusColors[pm.status] }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
