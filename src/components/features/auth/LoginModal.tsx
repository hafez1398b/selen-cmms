"use client";

import { useState } from "react";
import { X, User, Lock, LogIn, Sparkles, Shield } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { username: string; role: string; name: string }) => void;
}

const testUsers = [
  { username: "admin", password: "admin", name: "مدیر سیستم", role: "manager", roleLabel: "مدیر ارشد", color: "#8b5cf6" },
  { username: "supervisor", password: "1234", name: "علی محمدی", role: "supervisor", roleLabel: "سرپرست تعمیرات", color: "#d4a017" },
  { username: "expert", password: "1234", name: "محمد کریمی", role: "expert", roleLabel: "کارشناس ابزار دقیق", color: "#3b82f6" },
  { username: "technician", password: "1234", name: "حسن رضایی", role: "technician", roleLabel: "تکنسین", color: "#22c55e" },
];

export function LoginModal({ isOpen, onClose, onLogin }: Props) {
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const user = testUsers.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin({ username: user.username, role: user.role, name: user.name });
        toast.success("ورود موفق", `خوش آمدید ${user.name}`);
        onClose();
      } else {
        toast.error("ورود ناموفق", "نام کاربری یا رمز عبور اشتباه است");
      }
      setIsLoading(false);
    }, 800);
  };

  const quickLogin = (user: typeof testUsers[0]) => {
    setUsername(user.username);
    setPassword(user.password);
    setTimeout(() => {
      onLogin({ username: user.username, role: user.role, name: user.name });
      toast.success("ورود موفق", `خوش آمدید ${user.name}`);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-black/80 to-purple-500/20 backdrop-blur-md" />
      <div className="relative w-full max-w-md bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-2xl animate-fade-in overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 bg-gradient-to-l from-amber-500/10 via-white dark:via-[#111] to-white dark:to-[#111] text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30">
            <span className="text-[#0a0a0a] font-black text-2xl">S</span>
          </div>
          <h2 className="text-lg font-bold text-amber-600 dark:text-amber-500">سامانه هوشمند نت‌سلن</h2>
          <p className="text-xs text-gray-500 mt-1">CMMS/EAM Enterprise Platform</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">نام کاربری</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input-field pr-10"
                placeholder="admin"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 block">رمز عبور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="input-field pr-10"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="btn-primary w-full justify-center disabled:opacity-50"
          >
            {isLoading ? "در حال بررسی..." : <><LogIn className="w-4 h-4" /> ورود به سامانه</>}
          </button>

          {/* Quick Login */}
          <div className="border-t border-gray-200 dark:border-[#1a1a1a] pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-bold text-purple-500">ورود سریع (نمایشی)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {testUsers.map(u => (
                <button
                  key={u.username}
                  onClick={() => quickLogin(u)}
                  className="p-2 rounded-lg border border-gray-200 dark:border-[#1a1a1a] hover:border-amber-500 text-right text-xs"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: u.color }} />
                    <span className="font-bold">{u.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">{u.roleLabel}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-2">
            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
              <Shield className="w-3 h-3 text-green-500" />
              <span>SSL Encrypted • ISO 27001</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
