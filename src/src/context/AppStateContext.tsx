"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type PageId =
  | "dashboard"
  | "assets"
  | "workOrders"
  | "maintenance"
  | "failures"
  | "personnel"
  | "inventory"
  | "reports"
  | "aiAssistant"
  | "settings"
  | "notifications"
  | "kpi"
  | "planning"
  | "docs"
  | "migration";

interface CurrentUser {
  username: string;
  name: string;
  role: string;
}

interface AppStateContextType {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  modalType: string;
  setModalType: (type: string) => void;
  selectedItem: Record<string, any> | null;
  setSelectedItem: (item: Record<string, any> | null) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  notificationPanelOpen: boolean;
  toggleNotificationPanel: () => void;
  currentUser: CurrentUser | null;
  setCurrentUser: (u: CurrentUser | null) => void;
  loginOpen: boolean;
  setLoginOpen: (v: boolean) => void;
}

const AppStateContext = createContext<AppStateContextType>({
  currentPage: "dashboard",
  setCurrentPage: () => {},
  sidebarOpen: true,
  toggleSidebar: () => {},
  modalOpen: false,
  setModalOpen: () => {},
  modalType: "",
  setModalType: () => {},
  selectedItem: null,
  setSelectedItem: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
  notificationPanelOpen: false,
  toggleNotificationPanel: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  loginOpen: false,
  setLoginOpen: () => {},
});

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);
  const toggleNotificationPanel = () => setNotificationPanelOpen((prev) => !prev);

  return (
    <AppStateContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        sidebarOpen,
        toggleSidebar,
        modalOpen,
        setModalOpen,
        modalType,
        setModalType,
        selectedItem,
        setSelectedItem,
        refreshKey,
        triggerRefresh,
        notificationPanelOpen,
        toggleNotificationPanel,
        currentUser,
        setCurrentUser,
        loginOpen,
        setLoginOpen,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);
