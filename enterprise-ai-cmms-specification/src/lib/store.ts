import { createContext, useContext } from 'react';
import type { Equipment, User, WorkOrder, PMPlan, SparePart, Supplier, Notification, AuditLog, ExcelFile, ThemeMode, PendingRequest, CompanyProfile, MappingTemplate, AttendanceRecord, LeaveRequest } from './types';

export interface AppState {
  currentUser: User | null;
  theme: ThemeMode;
  users: User[];
  equipment: Equipment[];
  workOrders: WorkOrder[];
  pms: PMPlan[];
  parts: SparePart[];
  suppliers: Supplier[];
  notifications: Notification[];
  audit: AuditLog[];
  excelFiles: ExcelFile[];
  pendingRequests: PendingRequest[];
  company: CompanyProfile;
  mappingTemplates: MappingTemplate[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
}

export interface AppActions {
  setTheme: (t: ThemeMode) => void;
  loginWithPassword: (email: string, password: string) => Promise<{ ok: boolean; message?: string; mustChange?: boolean }>;
  logout: () => void;
  changePassword: (userId: string, newPassword: string) => Promise<void>;
  // users
  addUser: (u: User, plainPassword: string) => Promise<void>;
  updateUser: (id: string, patch: Partial<User>) => void;
  removeUser: (id: string) => void;
  resetUserPassword: (userId: string, newPassword: string) => Promise<void>;
  // pending requests (signup/google login approval)
  addPendingRequest: (r: Omit<PendingRequest, 'id' | 'at' | 'status'>) => void;
  approveRequest: (id: string, asRole: User['role'], password: string) => Promise<void>;
  rejectRequest: (id: string) => void;
  // company
  updateCompany: (patch: Partial<CompanyProfile>) => void;
  // equipment
  addEquipment: (e: Equipment) => void;
  updateEquipment: (id: string, patch: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  // wos
  addWO: (w: WorkOrder) => void;
  updateWO: (id: string, patch: Partial<WorkOrder>) => void;
  removeWO: (id: string) => void;
  markWOViewed: (woId: string, userId: string) => void;
  // pms
  addPM: (p: PMPlan) => void;
  updatePM: (id: string, patch: Partial<PMPlan>) => void;
  removePM: (id: string) => void;
  // parts
  addPart: (p: SparePart) => void;
  updatePart: (id: string, patch: Partial<SparePart>) => void;
  removePart: (id: string) => void;
  // suppliers
  addSupplier: (s: Supplier) => void;
  updateSupplier: (id: string, patch: Partial<Supplier>) => void;
  removeSupplier: (id: string) => void;
  // notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  pushNotification: (n: Notification) => void;
  // excel files
  addExcel: (f: ExcelFile) => void;
  removeExcel: (id: string) => void;
  // mapping templates (AI learning)
  saveMappingTemplate: (t: MappingTemplate) => void;
  deleteMappingTemplate: (id: string) => void;
  // attendance
  clockIn: (userId: string, note?: string) => void;
  clockOut: (userId: string, note?: string) => void;
  addAttendance: (r: AttendanceRecord) => void;
  updateAttendance: (id: string, patch: Partial<AttendanceRecord>) => void;
  removeAttendance: (id: string) => void;
  // leaves
  addLeave: (l: LeaveRequest) => void;
  updateLeave: (id: string, patch: Partial<LeaveRequest>) => void;
  removeLeave: (id: string) => void;
  approveLeave: (id: string, note?: string) => void;
  rejectLeave: (id: string, note?: string) => void;
  // audit
  logAction: (action: string, module: string, target?: string) => void;
  // utility
  exportFullBackup: () => string;
  importFullBackup: (json: string) => boolean;
  resetAllData: () => void;
}

export type AppContextType = AppState & AppActions;

export const AppCtx = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

const STORAGE_KEY = 'baspar_foam_v2'; // keep user data
const SEED_VERSION_KEY = 'baspar_seed_version';
const CURRENT_SEED_VERSION = '7'; // bump when seedEquipment changes — forces fresh equipment seed

export function loadState(): Partial<AppState> | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return null;

    let parsed: Partial<AppState>;
    try {
      parsed = JSON.parse(s);
    } catch (e) {
      console.warn('Corrupted localStorage, clearing:', e);
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (!parsed || typeof parsed !== 'object') return null;

    // Check seed version — if outdated, drop equipment/WO/PM so new seed is used
    const seedVer = localStorage.getItem(SEED_VERSION_KEY);
    if (seedVer !== CURRENT_SEED_VERSION) {
      delete parsed.equipment;
      delete parsed.workOrders;
      delete parsed.pms;
      delete parsed.parts;
      delete parsed.notifications;
      delete parsed.audit;
      delete parsed.attendance;
      delete parsed.leaves;
      // Also clear mock generation flags so they regenerate
      try {
        localStorage.removeItem('baspar_mock_history_v3');
        localStorage.removeItem('baspar_mock_attendance_v1');
      } catch { /* */ }
      try { localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION); } catch { /* */ }
    }

    // Sanity check: ensure arrays are arrays
    if (parsed.users && !Array.isArray(parsed.users)) delete parsed.users;
    if (parsed.equipment && !Array.isArray(parsed.equipment)) delete parsed.equipment;
    if (parsed.workOrders && !Array.isArray(parsed.workOrders)) delete parsed.workOrders;
    if (parsed.pms && !Array.isArray(parsed.pms)) delete parsed.pms;
    if (parsed.parts && !Array.isArray(parsed.parts)) delete parsed.parts;
    if (parsed.suppliers && !Array.isArray(parsed.suppliers)) delete parsed.suppliers;
    if (parsed.notifications && !Array.isArray(parsed.notifications)) delete parsed.notifications;
    if (parsed.audit && !Array.isArray(parsed.audit)) delete parsed.audit;
    if (parsed.excelFiles && !Array.isArray(parsed.excelFiles)) delete parsed.excelFiles;
    if (parsed.pendingRequests && !Array.isArray(parsed.pendingRequests)) delete parsed.pendingRequests;
    if (parsed.mappingTemplates && !Array.isArray(parsed.mappingTemplates)) delete parsed.mappingTemplates;

    return parsed;
  } catch (e) {
    console.warn('loadState failed, returning null:', e);
    return null;
  }
}

export function saveState(s: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      theme: s.theme, currentUser: s.currentUser,
      users: s.users, equipment: s.equipment, workOrders: s.workOrders,
      pms: s.pms, parts: s.parts, suppliers: s.suppliers,
      notifications: s.notifications, audit: s.audit, excelFiles: s.excelFiles,
      pendingRequests: s.pendingRequests, company: s.company,
      mappingTemplates: s.mappingTemplates,
      attendance: s.attendance, leaves: s.leaves,
    }));
  } catch { /* ignore */ }
}

export function clearStorage() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
