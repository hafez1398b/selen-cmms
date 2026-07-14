export type Role = 'admin' | 'manager' | 'supervisor' | 'technician' | 'operator' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  jobTitle: string;
  phone: string;
  avatar?: string;
  skills: string[];
  certifications: { name: string; expiry: string }[];
  performance: number; // 0-100
  active: boolean;
  joinedAt: string;
  lastLoginAt?: string;
  passwordHash: string; // SHA-256 hash of password
  mustChangePassword?: boolean;
  loginProvider?: 'password' | 'google';
}

export interface PendingRequest {
  id: string;
  type: 'signup' | 'google_login' | 'password_reset';
  name: string;
  email: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  message?: string;
  at: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CompanyProfile {
  name: string;
  nameEn: string;
  industry: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  ceo: string;
  established: string;
  employeeCount: number;
  factories: string[];
  description: string;
}

export type EquipmentStatus = 'active' | 'maintenance' | 'inactive' | 'scrapped';
export type Criticality = 'critical' | 'high' | 'medium' | 'low';

export interface EquipmentDocument {
  id: string;
  name: string;
  type: 'manual' | 'certificate' | 'photo' | 'datasheet' | 'invoice' | 'other';
  url: string; // data URL or external URL
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Equipment {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  category: string;
  department: string;
  location: string;
  manufacturer: string;
  model: string;
  serial: string;
  year: number;
  purchaseDate: string;
  purchaseCost: number;
  status: EquipmentStatus;
  criticality: Criticality;
  healthScore: number; // 0-100
  rulDays: number; // remaining useful life in days
  predictedFailure?: string;
  notes?: string;
  // Extended technical specs (optional)
  capacity?: string;
  power?: string;
  voltage?: string;
  weight?: string;
  customFields?: Record<string, string>;
  documents?: EquipmentDocument[];
  sourceFile?: string; // name of the Excel file it was imported from
}

export interface MappingTemplate {
  id: string;
  name: string;
  target: 'equipment' | 'workorders' | 'pm' | 'inventory' | 'personnel' | 'suppliers';
  fingerprint: string; // hash of sorted headers
  headers: string[];
  mapping: Record<string, string | null>;
  usageCount: number;
  createdAt: string;
  lastUsedAt: string;
}

// ====== Attendance / Leave Management ======
export interface AttendanceRecord {
  id: string;
  userId: string;
  type: 'clock_in' | 'clock_out';
  at: string; // ISO datetime
  note?: string;
  source?: 'manual' | 'auto' | 'admin';
}

export type LeaveType = 'استحقاقی' | 'استعلاجی' | 'بدون حقوق' | 'ساعتی' | 'مأموریت' | 'سایر';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  /** ISO date or datetime */
  startDate: string;
  endDate: string;
  /** for hourly leaves */
  startTime?: string;
  endTime?: string;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export type WOType = 'corrective' | 'preventive' | 'predictive' | 'emergency' | 'improvement' | 'inspection' | 'project';
export type WOStatus = 'draft' | 'submitted' | 'approved' | 'assigned' | 'in_progress' | 'verification' | 'completed' | 'closed';
export type WOPriority = 'critical' | 'high' | 'medium' | 'low';

export interface WorkOrder {
  id: string;
  number: string;
  title: string;
  description: string;
  type: WOType;
  priority: WOPriority;
  status: WOStatus;
  equipmentId?: string;
  department: string;
  requestedBy: string;
  assignedTo: string[];
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  estimatedCost: number;
  actualCost: number;
  laborHours: number;
  partsUsed: { partId: string; qty: number }[];
  attachmentsBefore: string[]; // data URLs
  attachmentsAfter: string[];
  voiceNotes: { url: string; transcript?: string; at: string }[];
  textNotes: { author: string; text: string; at: string }[];
  viewedAt?: { userId: string; at: string }[];
  rootCause?: string;
  correctiveAction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PMPlan {
  id: string;
  name: string;
  equipmentId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  taskType: 'inspection' | 'lubrication' | 'calibration' | 'cleaning' | 'replacement' | 'adjustment' | 'testing' | 'overhaul';
  checklist: { item: string; done: boolean }[];
  assignedTo: string;
  nextDue: string;
  lastDone?: string;
  compliance: number; // 0-100
  active: boolean;
}

export interface SparePart {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  unitCost: number;
  stock: number;
  min: number;
  max: number;
  warehouse: string;
  bin: string;
  supplierId?: string;
  consumptionForecast30: number;
  consumptionForecast90: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  rating: number;
  leadDays: number;
}

export interface Notification {
  id: string;
  type: 'wo_new' | 'wo_assigned' | 'wo_due' | 'wo_overdue' | 'pm_due' | 'inventory_low' | 'approval' | 'ai_insight';
  title: string;
  body: string;
  at: string;
  read: boolean;
  channel: ('inapp' | 'email' | 'whatsapp' | 'bale' | 'sms' | 'push')[];
  link?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  target?: string;
  at: string;
  ip?: string;
}

export interface ExcelFile {
  id: string;
  name: string;
  size: number;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  sheets: string[];
  checksum: string;
  preview?: string;
}

export interface DashboardKPI {
  label: string;
  value: number | string;
  delta?: number;
  unit?: string;
  icon?: string;
}

export type ThemeMode = 'dark' | 'light';
