"use client";

import { Sparkles, Shield, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="hidden md:flex items-center justify-between px-6 py-2 bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-[#1a1a1a] text-[10px] text-gray-500 dark:text-gray-500 flex-shrink-0">
      <div className="flex items-center gap-4">
        <span>© ۱۳۹۲-۱۴۰۳ گروه صنعتی سلن (بسپار فوم غرب)</span>
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-green-500" />
          ISO 55000 & 14224 Compliant
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" />
          Powered by Next.js 16
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-500" />
          AI Enabled
        </span>
        <span className="text-amber-600 dark:text-amber-500 font-bold">v0.2.0</span>
      </div>
    </footer>
  );
}
