import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppStateProvider } from "@/context/AppStateContext";
import { WorkOrdersProvider } from "@/context/WorkOrdersContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "سامانه هوشمند نت‌سلن | CMMS/EAM",
  description: "سامانه جامع مدیریت نگهداری و تعمیرات - گروه صنعتی سلن (بسپار فوم غرب)",
  applicationName: "Selen CMMS Pro",
  authors: [{ name: "Selen Industrial Group" }],
  keywords: ["CMMS", "EAM", "Maintenance", "Selen", "بسپار فوم غرب"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e5e7eb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Anti-FOUC script
const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('cmms-theme') || 'dark';
      document.documentElement.classList.add(t);
      document.documentElement.style.colorScheme = t;
    } catch(e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased font-[Vazirmatn]">
        <ThemeProvider>
          <ToastProvider>
            <AppStateProvider>
              <WorkOrdersProvider>
                {children}
              </WorkOrdersProvider>
            </AppStateProvider>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
