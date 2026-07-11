"use client";

import { useAppState } from "@/context/AppStateContext";
import { TopHeader } from "@/components/layout/TopHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";
import { DashboardPage } from "@/components/pages/DashboardPage";
import { AssetsPage } from "@/components/pages/AssetsPage";
import { WorkOrdersPage } from "@/components/pages/WorkOrdersPage";
import { MaintenancePage } from "@/components/pages/MaintenancePage";
import { FailuresPage } from "@/components/pages/FailuresPage";
import { PersonnelPage } from "@/components/pages/PersonnelPage";
import { InventoryPage } from "@/components/pages/InventoryPage";
import { ReportsPage } from "@/components/pages/ReportsPage";
import { AIAssistantPage } from "@/components/pages/AIAssistantPage";
import { SettingsPage } from "@/components/pages/SettingsPage";
import { KPIPage } from "@/components/pages/KPIPage";
import { PlanningPage } from "@/components/pages/PlanningPage";
import { DocsViewer } from "@/components/pages/DocsViewer";
import { ModalContainer } from "@/components/ui/Modal";
import { NotificationPanel } from "@/components/layout/NotificationPanel";
import { LoginModal } from "@/components/features/auth/LoginModal";
import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/useMediaQuery";

export default function Home() {
  const { currentPage, sidebarOpen, toggleSidebar, loginOpen, setLoginOpen, setCurrentUser } = useAppState();
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard": return <DashboardPage />;
      case "assets": return <AssetsPage />;
      case "workOrders": return <WorkOrdersPage />;
      case "maintenance": return <MaintenancePage />;
      case "failures": return <FailuresPage />;
      case "personnel": return <PersonnelPage />;
      case "inventory": return <InventoryPage />;
      case "reports": return <ReportsPage />;
      case "aiAssistant": return <AIAssistantPage />;
      case "settings": return <SettingsPage />;
      case "kpi": return <KPIPage />;
      case "planning": return <PlanningPage />;
      case "docs": return <DocsViewer />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className={`h-screen flex bg-gray-200 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile Sidebar Drawer */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={toggleSidebar}
          />
          <div className="relative z-10 animate-slide-in">
            <Sidebar isMobile />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader />
        <main className={`flex-1 overflow-auto ${isMobile ? 'pb-20' : ''}`}>
          {renderPage()}
        </main>
        {!isMobile && <Footer />}
        {isMobile && <MobileBottomNav />}
      </div>

      <ModalContainer />
      <NotificationPanel />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLogin={setCurrentUser} />
    </div>
  );
}
