import { useState } from 'react';
import { AppProvider } from './AppProvider';
import { ToastProvider } from './components/Toast';
import { useApp } from './lib/store';
import { LoginPage } from './pages/Login';
import { Shell, type NavKey } from './pages/Shell';
import { DashboardPage } from './pages/Dashboard';
import { EquipmentPage } from './pages/Equipment';
import { WorkOrdersPage } from './pages/WorkOrders';
import { PMPage } from './pages/PM';
import { PMAnalyticsPage } from './pages/PMAnalytics';
import { PlanningPage } from './pages/Planning';
import { ServiceRequestPage } from './pages/ServiceRequest';
import { PersonnelPage } from './pages/Personnel';
import { InventoryPage } from './pages/Inventory';
import { SuppliersPage, ReportsPage, AIHubPage, NotificationsPage, ExcelRepoPage, AuditPage, SettingsPage } from './pages/Misc';
import { AdminUsersPage } from './pages/AdminUsers';
import { HelpPage } from './pages/Help';
import { ProfilePage } from './pages/Profile';
import { AIAssistant } from './components/AIAssistant';
import { OnlineStatus } from './components/OnlineStatus';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { AssistantContext } from './lib/assistant';

const navToContext: Record<NavKey, AssistantContext> = {
  dashboard: 'dashboard', equipment: 'equipment', workorders: 'workorders',
  service_request: 'workorders',
  pm: 'pm', pm_analytics: 'pm', planning: 'planning', personnel: 'personnel',
  inventory: 'inventory', suppliers: 'inventory', reports: 'reports',
  ai: 'ai', notifications: 'global', excel: 'global', audit: 'global',
  settings: 'global', admin_users: 'global', help: 'global', profile: 'global',
};

function Inner() {
  const { currentUser } = useApp();
  const [active, setActive] = useState<NavKey>('dashboard');

  if (!currentUser) return <><LoginPage /><OnlineStatus /></>;

  return (
    <>
      <Shell active={active} setActive={setActive}>
        {active === 'dashboard' && <DashboardPage onNavigate={(k) => setActive(k as NavKey)} />}
        {active === 'help' && <HelpPage />}
        {active === 'equipment' && <EquipmentPage />}
        {active === 'workorders' && <WorkOrdersPage />}
        {active === 'service_request' && <ServiceRequestPage />}
        {active === 'pm' && <PMPage />}
        {active === 'pm_analytics' && <PMAnalyticsPage />}
        {active === 'planning' && <PlanningPage />}
        {active === 'personnel' && <PersonnelPage />}
        {active === 'inventory' && <InventoryPage />}
        {active === 'suppliers' && <SuppliersPage />}
        {active === 'reports' && <ReportsPage />}
        {active === 'ai' && <AIHubPage />}
        {active === 'notifications' && <NotificationsPage />}
        {active === 'excel' && <ExcelRepoPage />}
        {active === 'audit' && <AuditPage />}
        {active === 'admin_users' && <AdminUsersPage />}
        {active === 'profile' && <ProfilePage />}
        {active === 'settings' && <SettingsPage />}
      </Shell>
      <AIAssistant context={navToContext[active]} />
      <OnlineStatus />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <ErrorBoundary>
            <Inner />
          </ErrorBoundary>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
