// Personnel with Skills, Shifts, Performance

export interface Skill {
  id: number;
  name: string;
  category: "mechanical" | "electrical" | "hydraulic" | "instrumentation" | "safety" | "management" | "software";
}

export interface Certification {
  id: number;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate?: string;
  fileUrl?: string;
}

export interface Personnel {
  id: number;
  employeeCode: string;
  fullName: string;
  nationalId?: string;
  role: "manager" | "supervisor" | "expert" | "technician" | "operator";
  department: string;
  position: string;
  email?: string;
  phone: string;
  avatar?: string;
  hireDate: string;
  isActive: boolean;

  // Skills (1-5 rating)
  skills: { skillId: number; level: 1 | 2 | 3 | 4 | 5 }[];

  // Certifications
  certifications: Certification[];

  // Shift
  currentShift: "morning" | "afternoon" | "night" | "flexible";

  // Performance
  productivity: number; // 0-100
  completedWorkOrders: number;
  totalWorkOrders: number;
  avgResponseTime: number; // hours
  workingHoursThisMonth: number;
  rating: number; // 0-5
}

export const skillsData: Skill[] = [
  { id: 1, name: "تعمیرات مکانیک", category: "mechanical" },
  { id: 2, name: "هیدرولیک", category: "hydraulic" },
  { id: 3, name: "پنوماتیک", category: "hydraulic" },
  { id: 4, name: "برق صنعتی", category: "electrical" },
  { id: 5, name: "PLC & اتوماسیون", category: "instrumentation" },
  { id: 6, name: "ابزار دقیق", category: "instrumentation" },
  { id: 7, name: "جوشکاری", category: "mechanical" },
  { id: 8, name: "پمپ و کمپرسور", category: "mechanical" },
  { id: 9, name: "بلبرینگ و انتقال قدرت", category: "mechanical" },
  { id: 10, name: "ایمنی صنعتی HSE", category: "safety" },
  { id: 11, name: "مدیریت پروژه", category: "management" },
  { id: 12, name: "SAP/CMMS", category: "software" },
  { id: 13, name: "پایش وضعیت", category: "instrumentation" },
  { id: 14, name: "دیگ بخار", category: "safety" },
];

export const personnelData: Personnel[] = [
  {
    id: 1, employeeCode: "SLN-1001", fullName: "علی محمدی",
    role: "supervisor", department: "تعمیرات مکانیک", position: "سرپرست تعمیرات",
    phone: "09121112233", hireDate: "1392/03/15", isActive: true,
    currentShift: "morning",
    skills: [
      { skillId: 1, level: 5 }, { skillId: 2, level: 5 }, { skillId: 8, level: 4 },
      { skillId: 9, level: 5 }, { skillId: 11, level: 4 }, { skillId: 12, level: 3 },
    ],
    certifications: [
      { id: 1, name: "گواهی تعمیرات صنعتی سطح ۳", issuer: "سازمان فنی و حرفه‌ای", issuedDate: "1398/04/10", expiryDate: "1405/04/10" },
      { id: 2, name: "HSE Level 2", issuer: "شرکت ایمنی سلن", issuedDate: "1401/06/15", expiryDate: "1404/06/15" },
    ],
    productivity: 94, completedWorkOrders: 45, totalWorkOrders: 48,
    avgResponseTime: 2.1, workingHoursThisMonth: 180, rating: 4.8,
  },
  {
    id: 2, employeeCode: "SLN-1002", fullName: "رضا احمدی",
    role: "technician", department: "تعمیرات برق", position: "تکنسین برق",
    phone: "09122223344", hireDate: "1394/07/20", isActive: true,
    currentShift: "afternoon",
    skills: [
      { skillId: 4, level: 5 }, { skillId: 5, level: 4 }, { skillId: 6, level: 3 },
      { skillId: 10, level: 4 },
    ],
    certifications: [
      { id: 3, name: "برق صنعتی درجه ۱", issuer: "وزارت کار", issuedDate: "1397/02/01" },
    ],
    productivity: 88, completedWorkOrders: 38, totalWorkOrders: 42,
    avgResponseTime: 2.8, workingHoursThisMonth: 165, rating: 4.5,
  },
  {
    id: 3, employeeCode: "SLN-1003", fullName: "حسن رضایی",
    role: "technician", department: "تعمیرات مکانیک", position: "تکنسین ارشد مکانیک",
    phone: "09123334455", hireDate: "1393/11/10", isActive: true,
    currentShift: "morning",
    skills: [
      { skillId: 1, level: 4 }, { skillId: 2, level: 4 }, { skillId: 7, level: 5 },
      { skillId: 9, level: 4 }, { skillId: 10, level: 3 },
    ],
    certifications: [
      { id: 4, name: "جوشکاری بین‌المللی 6G", issuer: "AWS", issuedDate: "1399/03/20", expiryDate: "1404/03/20" },
    ],
    productivity: 91, completedWorkOrders: 42, totalWorkOrders: 45,
    avgResponseTime: 2.3, workingHoursThisMonth: 172, rating: 4.6,
  },
  {
    id: 4, employeeCode: "SLN-1004", fullName: "محمد کریمی",
    role: "expert", department: "ابزار دقیق", position: "کارشناس ارشد ابزار دقیق",
    phone: "09124445566", hireDate: "1395/05/05", isActive: true,
    currentShift: "morning",
    skills: [
      { skillId: 5, level: 5 }, { skillId: 6, level: 5 }, { skillId: 13, level: 5 },
      { skillId: 12, level: 4 }, { skillId: 4, level: 3 },
    ],
    certifications: [
      { id: 5, name: "Siemens PLC S7-1500", issuer: "Siemens Academy", issuedDate: "1400/09/12" },
      { id: 6, name: "Vibration Analysis CAT-II", issuer: "Mobius Institute", issuedDate: "1401/11/01", expiryDate: "1406/11/01" },
    ],
    productivity: 86, completedWorkOrders: 35, totalWorkOrders: 40,
    avgResponseTime: 3.1, workingHoursThisMonth: 168, rating: 4.7,
  },
  {
    id: 5, employeeCode: "SLN-1005", fullName: "سعید نوری",
    role: "technician", department: "تعمیرات برق", position: "تکنسین برق",
    phone: "09125556677", hireDate: "1397/02/15", isActive: true,
    currentShift: "night",
    skills: [
      { skillId: 4, level: 4 }, { skillId: 5, level: 3 }, { skillId: 10, level: 3 },
    ],
    certifications: [],
    productivity: 82, completedWorkOrders: 30, totalWorkOrders: 36,
    avgResponseTime: 3.4, workingHoursThisMonth: 158, rating: 4.2,
  },
  {
    id: 6, employeeCode: "SLN-1006", fullName: "امیر حسینی",
    role: "supervisor", department: "تعمیرات برق", position: "سرپرست تعمیرات برق",
    phone: "09126667788", hireDate: "1391/09/01", isActive: true,
    currentShift: "morning",
    skills: [
      { skillId: 4, level: 5 }, { skillId: 5, level: 5 }, { skillId: 11, level: 4 },
      { skillId: 14, level: 5 }, { skillId: 10, level: 5 },
    ],
    certifications: [
      { id: 7, name: "دیگ بخار درجه ۱", issuer: "سازمان استاندارد", issuedDate: "1396/05/10", expiryDate: "1404/05/10" },
    ],
    productivity: 90, completedWorkOrders: 40, totalWorkOrders: 44,
    avgResponseTime: 2.2, workingHoursThisMonth: 175, rating: 4.7,
  },
  {
    id: 7, employeeCode: "SLN-1007", fullName: "مهدی عباسی",
    role: "technician", department: "تعمیرات مکانیک", position: "تکنسین هیدرولیک",
    phone: "09127778899", hireDate: "1398/04/22", isActive: true,
    currentShift: "afternoon",
    skills: [
      { skillId: 2, level: 4 }, { skillId: 3, level: 4 }, { skillId: 8, level: 3 },
      { skillId: 1, level: 3 },
    ],
    certifications: [],
    productivity: 85, completedWorkOrders: 33, totalWorkOrders: 38,
    avgResponseTime: 2.9, workingHoursThisMonth: 162, rating: 4.4,
  },
  {
    id: 8, employeeCode: "SLN-1008", fullName: "مدیر فنی سلن",
    role: "manager", department: "مدیریت فنی", position: "مدیر فنی نگهداری",
    phone: "09128889900", hireDate: "1390/01/05", isActive: true,
    currentShift: "flexible",
    skills: [
      { skillId: 11, level: 5 }, { skillId: 12, level: 4 }, { skillId: 10, level: 5 },
      { skillId: 1, level: 4 }, { skillId: 4, level: 3 },
    ],
    certifications: [
      { id: 8, name: "PMP", issuer: "PMI", issuedDate: "1395/10/01", expiryDate: "1405/10/01" },
      { id: 9, name: "CMRP", issuer: "SMRP", issuedDate: "1399/03/15", expiryDate: "1404/03/15" },
    ],
    productivity: 96, completedWorkOrders: 12, totalWorkOrders: 12,
    avgResponseTime: 1.2, workingHoursThisMonth: 200, rating: 5,
  },
];

export const roleLabels = {
  manager: "مدیر",
  supervisor: "سرپرست",
  expert: "کارشناس",
  technician: "تکنسین",
  operator: "اپراتور",
};

export const roleColors = {
  manager: "#8b5cf6",
  supervisor: "#d4a017",
  expert: "#3b82f6",
  technician: "#22c55e",
  operator: "#6b7280",
};

export const shiftLabels = {
  morning: "صبح (۶-۱۴)",
  afternoon: "عصر (۱۴-۲۲)",
  night: "شب (۲۲-۶)",
  flexible: "شناور",
};

export const skillCategoryLabels = {
  mechanical: "مکانیک",
  electrical: "برق",
  hydraulic: "هیدرولیک/پنوماتیک",
  instrumentation: "ابزار دقیق",
  safety: "ایمنی",
  management: "مدیریت",
  software: "نرم‌افزار",
};

export const skillCategoryColors = {
  mechanical: "#3b82f6",
  electrical: "#f59e0b",
  hydraulic: "#06b6d4",
  instrumentation: "#8b5cf6",
  safety: "#ef4444",
  management: "#d4a017",
  software: "#22c55e",
};
