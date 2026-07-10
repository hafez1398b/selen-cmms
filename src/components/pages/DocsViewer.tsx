"use client";

import { useState, useEffect } from "react";
import { FileText, ChevronLeft, Book, Loader2, CheckCircle2 } from "lucide-react";

const docTitles: Record<string, { title: string; badge: string; color: string }> = {
  "00-PROJECT-CHARTER.md": { title: "منشور پروژه", badge: "Charter", color: "#d4a017" },
  "01-ARCHITECTURE.md": { title: "معماری سامانه", badge: "Architecture", color: "#3b82f6" },
  "02-DATABASE-DESIGN.md": { title: "طراحی دیتابیس", badge: "Database", color: "#22c55e" },
  "03-UI-DESIGN-SYSTEM.md": { title: "سیستم طراحی UI", badge: "Design", color: "#8b5cf6" },
  "04-DEVELOPMENT-ROADMAP.md": { title: "نقشه راه توسعه", badge: "Roadmap", color: "#f59e0b" },
  "05-PRODUCT-BACKLOG.md": { title: "بک‌لاگ محصول", badge: "Backlog", color: "#ef4444" },
  "06-CODING-STANDARDS.md": { title: "استانداردهای کدنویسی", badge: "Standards", color: "#06b6d4" },
  "07-API-STRUCTURE.md": { title: "ساختار API", badge: "API", color: "#ec4899" },
};

export function DocsViewer() {
  const [files, setFiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/docs")
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setFiles(data.files);
          if (data.files.length > 0) setSelected(data.files[0]);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/docs?file=${selected}`)
      .then(r => r.json())
      .then(data => {
        if (data.ok) setContent(data.content);
        setLoading(false);
      });
  }, [selected]);

  const renderMarkdown = (md: string) => {
    // Simple markdown-to-HTML for display
    const lines = md.split("\n");
    const elements: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-4">
            <table className="w-full text-xs border border-gray-200 dark:border-[#1a1a1a] rounded-lg">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#1a1a1a]">
                  {tableRows[0].map((cell, i) => (
                    <th key={i} className="px-3 py-2 text-right font-bold border-b border-gray-200 dark:border-[#1a1a1a]">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(2).map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-[#1a1a1a]">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-right">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, i) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre key={i} className="bg-gray-100 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a] rounded-lg p-3 my-3 overflow-x-auto text-xs" dir="ltr">
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          );
          codeBuffer = [];
        }
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith("|") && line.includes("|")) {
        const cells = line.split("|").filter(c => c.trim() !== "").map(c => c.trim());
        if (!inTable) inTable = true;
        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable();
      }

      if (line.startsWith("# ")) {
        elements.push(<h1 key={i} className="text-2xl font-black text-amber-600 dark:text-amber-500 mt-6 mb-3">{line.substring(2)}</h1>);
      } else if (line.startsWith("## ")) {
        elements.push(<h2 key={i} className="text-xl font-bold mt-5 mb-2 pb-2 border-b border-gray-200 dark:border-[#1a1a1a]">{line.substring(3)}</h2>);
      } else if (line.startsWith("### ")) {
        elements.push(<h3 key={i} className="text-base font-bold mt-4 mb-2 text-amber-600 dark:text-amber-500">{line.substring(4)}</h3>);
      } else if (line.startsWith("#### ")) {
        elements.push(<h4 key={i} className="text-sm font-bold mt-3 mb-1">{line.substring(5)}</h4>);
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        const text = line.substring(2);
        elements.push(
          <div key={i} className="flex items-start gap-2 my-1 mr-4">
            <span className="text-amber-500 mt-1">•</span>
            <span className="text-sm flex-1" dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-600 dark:text-amber-400">$1</strong>').replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-[#1a1a1a] rounded text-xs" dir="ltr">$1</code>') }} />
          </div>
        );
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(
          <div key={i} className="flex items-start gap-2 my-1 mr-4">
            <span className="text-amber-500 font-bold text-xs mt-0.5">{line.match(/^(\d+)/)?.[0]}.</span>
            <span className="text-sm flex-1">{line.replace(/^\d+\.\s/, "")}</span>
          </div>
        );
      } else if (line.startsWith("---")) {
        elements.push(<hr key={i} className="my-4 border-gray-200 dark:border-[#1a1a1a]" />);
      } else if (line.trim()) {
        elements.push(
          <p key={i} className="text-sm my-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-600 dark:text-amber-400">$1</strong>').replace(/`(.+?)`/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-[#1a1a1a] rounded text-xs" dir="ltr">$1</code>') }} />
        );
      }
    });
    flushTable();

    return elements;
  };

  return (
    <div className="p-3 md:p-5 lg:p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="chart-card !p-4 md:!p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center flex-shrink-0">
            <Book className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm md:text-lg font-bold text-amber-600 dark:text-amber-500">مستندات فاز ۰ - معماری و طراحی</h2>
            <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              مطابق قانون شماره ۱ — مرجع اصلی پروژه
            </p>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] text-green-600 dark:text-green-400 font-bold">فاز ۰ تکمیل</span>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        {[
          { label: "کل فازها", value: "۱۰", color: "#3b82f6" },
          { label: "تکمیل شده", value: "۱", color: "#22c55e" },
          { label: "در حال اجرا", value: "۰", color: "#f59e0b" },
          { label: "پیشرفت", value: "۱۰٪", color: "#d4a017" },
          { label: "مستندات", value: files.length.toString(), color: "#8b5cf6" },
        ].map((s, i) => (
          <div key={i} className="kpi-card !p-3 md:!p-4 text-center">
            <p className="text-[10px] text-gray-500 mb-1">{s.label}</p>
            <p className="text-xl md:text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar - Doc List */}
        <div className="lg:col-span-1">
          <div className="chart-card !p-3">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              فهرست مستندات
            </h3>
            <div className="space-y-1">
              {files.map(file => {
                const info = docTitles[file] || { title: file, badge: "Doc", color: "#888" };
                const isActive = selected === file;
                return (
                  <button
                    key={file}
                    onClick={() => setSelected(file)}
                    className={`w-full text-right p-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-l from-amber-500/20 to-amber-500/5 border border-amber-500/30'
                        : 'hover:bg-gray-50 dark:hover:bg-[#0a0a0a] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: info.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isActive ? 'text-amber-600 dark:text-amber-500' : ''}`}>
                          {info.title}
                        </p>
                        <p className="text-[9px] text-gray-500 mt-0.5" dir="ltr">
                          {info.badge}
                        </p>
                      </div>
                      {isActive && <ChevronLeft className="w-3 h-3 text-amber-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="lg:col-span-3">
          <div className="chart-card !p-4 md:!p-6 min-h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : content ? (
              <div className="prose prose-sm max-w-none">
                {renderMarkdown(content)}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                یک سند از فهرست انتخاب کنید
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phase 0 Report */}
      <div className="chart-card !p-4 md:!p-5">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          گزارش فاز ۰
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <p className="font-bold text-green-600 dark:text-green-400 mb-2">✅ تکمیل شده:</p>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• منشور پروژه (Charter)</li>
              <li>• سند معماری (Architecture)</li>
              <li>• طراحی دیتابیس (۳۵ جدول)</li>
              <li>• سیستم طراحی UI</li>
              <li>• نقشه راه ۱۰ فاز</li>
              <li>• بک‌لاگ محصول</li>
              <li>• استانداردهای کدنویسی</li>
              <li>• ساختار API</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="font-bold text-amber-600 dark:text-amber-400 mb-2">⏭️ مرحله بعد (فاز ۱):</p>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• UI Framework</li>
              <li>• Theme System (Dark/Light)</li>
              <li>• Sidebar + Header + Footer</li>
              <li>• Dashboard Skeleton</li>
              <li>• Bottom Nav موبایل</li>
              <li>• Animation System</li>
              <li>• Responsive Layout</li>
            </ul>
            <p className="mt-2 text-[10px] text-gray-500">
              زمان تخمینی: ۲-۳ روز — منتظر تأیید کارفرما
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
