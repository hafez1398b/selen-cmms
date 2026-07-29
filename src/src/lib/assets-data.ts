// Extended Asset Data - Selen Industrial Group (بسپار فوم غرب)
// Structure: Company → Plant → Bespar (1-6) → Location → Category → Equipment → SubSystem → Part → SubPart

export type AssetTypeKey =
  | "company"
  | "plant"
  | "bespar"
  | "location"
  | "category"
  | "equipment"
  | "subsystem"
  | "part"
  | "subpart";

export interface AssetNode {
  id: number;
  code: string;
  name: string;
  nameEn?: string;
  parentId: number | null;
  typeKey: AssetTypeKey;
  level: number;
  path: string; // "1.2.5"

  // Physical info
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  yearManufactured?: number;
  yearInstalled?: number;
  location?: string;

  // Status
  status: "active" | "inactive" | "maintenance" | "failed";
  healthScore: number; // 0-100
  criticality: "low" | "medium" | "high" | "critical";

  // Metrics (KPI)
  mtbf?: number;
  mttr?: number;
  availability?: number;
  reliability?: number;
  failureRate?: number;
  oee?: number;
  totalFailures?: number;
  totalDowntime?: number;

  // Additional
  purchasePrice?: number;
  identityNumber?: string;
  quantity?: number;
  installDate?: string;
  warrantyEnd?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  tags?: string[];
  specifications?: Record<string, string>;
  category?: string;
}

export const assetTypes: Record<AssetTypeKey, { label: string; icon: string; color: string; level: number }> = {
  company: { label: "شرکت", icon: "🏛️", color: "#8b5cf6", level: 0 },
  plant: { label: "کارخانه", icon: "🏭", color: "#3b82f6", level: 1 },
  bespar: { label: "خط تولید بسپار", icon: "🏗️", color: "#d4a017", level: 2 },
  location: { label: "موقعیت", icon: "📍", color: "#22c55e", level: 3 },
  category: { label: "دسته تجهیز", icon: "📂", color: "#f59e0b", level: 4 },
  equipment: { label: "تجهیز", icon: "⚙️", color: "#ef4444", level: 5 },
  subsystem: { label: "زیرسیستم", icon: "🔧", color: "#06b6d4", level: 6 },
  part: { label: "قطعه", icon: "🔩", color: "#ec4899", level: 7 },
  subpart: { label: "زیرقطعه", icon: "🔗", color: "#84cc16", level: 8 },
};

// ============================================================================
// COMPLETE ASSET TREE - SELEN
// ============================================================================
export const assetsTreeData: AssetNode[] = [
  // ═══════════════════════════════════════════════
  // ROOT: Company
  // ═══════════════════════════════════════════════
  {
    id: 1,
    code: "SIG",
    name: "گروه صنعتی سلن",
    nameEn: "Selen Industrial Group",
    parentId: null,
    typeKey: "company",
    level: 0,
    path: "1",
    status: "active",
    healthScore: 91,
    criticality: "critical",
    yearInstalled: 1392,
    location: "ایران",
  },

  // ═══════════════════════════════════════════════
  // PLANT
  // ═══════════════════════════════════════════════
  {
    id: 2,
    code: "PLANT-01",
    name: "کارخانه بسپار فوم غرب",
    nameEn: "Bespar Foam Gharb Factory",
    parentId: 1,
    typeKey: "plant",
    level: 1,
    path: "1.2",
    status: "active",
    healthScore: 89,
    criticality: "critical",
    location: "کرمانشاه",
    yearInstalled: 1392,
  },

  // ═══════════════════════════════════════════════
  // BESPAR 1 - فوم
  // ═══════════════════════════════════════════════
  {
    id: 10,
    code: "BSP-01",
    name: "بسپار ۱ (فوم)",
    nameEn: "Bespar 1 - Foam",
    parentId: 2,
    typeKey: "bespar",
    level: 2,
    path: "1.2.10",
    status: "active",
    healthScore: 92,
    criticality: "critical",
    availability: 94,
    reliability: 91,
    oee: 87,
    tags: ["Production", "Foam"],
  },
  { id: 11, code: "BSP-01-L1", name: "خط تولید اصلی", parentId: 10, typeKey: "location", level: 3, path: "1.2.10.11", status: "active", healthScore: 90, criticality: "high" },
  { id: 12, code: "BSP-01-C1", name: "دسته میکسر", parentId: 11, typeKey: "category", level: 4, path: "1.2.10.11.12", status: "active", healthScore: 88, criticality: "high" },
  {
    id: 13, code: "MX-101", name: "میکسر اصلی MX-101", parentId: 12, typeKey: "equipment", level: 5, path: "1.2.10.11.12.13",
    manufacturer: "Cannon", model: "A80", serialNumber: "SN-2019-4521", yearManufactured: 2019,
    status: "active", healthScore: 85, criticality: "critical",
    mtbf: 420, mttr: 4.2, availability: 91, reliability: 88, failureRate: 2.4, oee: 82, totalFailures: 4, totalDowntime: 24,
    specifications: { "ظرفیت": "80 kg/min", "توان": "45 kW", "دور موتور": "1450 rpm" }
  },
  { id: 14, code: "MX-101-M1", name: "موتور اصلی", parentId: 13, typeKey: "subsystem", level: 6, path: "1.2.10.11.12.13.14", status: "active", healthScore: 89, criticality: "high", manufacturer: "ABB", model: "M3BP-200" },
  { id: 15, code: "MX-101-M1-B1", name: "بلبرینگ 6205", parentId: 14, typeKey: "part", level: 7, path: "1.2.10.11.12.13.14.15", status: "active", healthScore: 78, criticality: "medium", manufacturer: "SKF" },
  { id: 16, code: "MX-101-M1-B1-S1", name: "سیل روغن", parentId: 15, typeKey: "subpart", level: 8, path: "1.2.10.11.12.13.14.15.16", status: "active", healthScore: 75, criticality: "low" },
  { id: 17, code: "MX-101-P1", name: "پمپ هیدرولیک", parentId: 13, typeKey: "subsystem", level: 6, path: "1.2.10.11.12.13.17", status: "maintenance", healthScore: 68, criticality: "high", manufacturer: "Rexroth" },
  { id: 18, code: "MX-101-C1", name: "کنترل پنل PLC", parentId: 13, typeKey: "subsystem", level: 6, path: "1.2.10.11.12.13.18", status: "active", healthScore: 92, criticality: "critical", manufacturer: "Siemens", model: "S7-1500" },

  { id: 19, code: "BSP-01-C2", name: "دسته کانوایر", parentId: 11, typeKey: "category", level: 4, path: "1.2.10.11.19", status: "active", healthScore: 91, criticality: "high" },
  {
    id: 20, code: "CV-101", name: "نوار نقاله اصلی CV-101", parentId: 19, typeKey: "equipment", level: 5, path: "1.2.10.11.19.20",
    manufacturer: "Metso", model: "CV-500", serialNumber: "SN-2020-7832", yearManufactured: 2020,
    status: "active", healthScore: 91, criticality: "high",
    mtbf: 520, mttr: 2.8, availability: 94, reliability: 92, failureRate: 1.9, oee: 85, totalFailures: 2, totalDowntime: 12,
  },
  { id: 21, code: "CV-101-B1", name: "تسمه اصلی", parentId: 20, typeKey: "part", level: 6, path: "1.2.10.11.19.20.21", status: "active", healthScore: 82, criticality: "high" },
  { id: 22, code: "CV-101-R1", name: "رولر انتقال", parentId: 20, typeKey: "part", level: 6, path: "1.2.10.11.19.20.22", status: "active", healthScore: 88, criticality: "medium" },

  { id: 23, code: "BSP-01-L2", name: "خط تولید فرعی", parentId: 10, typeKey: "location", level: 3, path: "1.2.10.23", status: "active", healthScore: 87, criticality: "medium" },
  {
    id: 24, code: "MX-102", name: "میکسر فرعی MX-102", parentId: 23, typeKey: "equipment", level: 5, path: "1.2.10.23.24",
    manufacturer: "Cannon", model: "A60", serialNumber: "SN-2018-3211", yearManufactured: 2018,
    status: "active", healthScore: 82, criticality: "high",
    mtbf: 380, mttr: 3.5, availability: 89, reliability: 85, failureRate: 2.8, oee: 79, totalFailures: 6, totalDowntime: 32,
  },

  // ═══════════════════════════════════════════════
  // BESPAR 2 - مموری
  // ═══════════════════════════════════════════════
  {
    id: 30, code: "BSP-02", name: "بسپار ۲ (مموری)", nameEn: "Bespar 2 - Memory",
    parentId: 2, typeKey: "bespar", level: 2, path: "1.2.30",
    status: "active", healthScore: 88, criticality: "critical",
    availability: 91, reliability: 89, oee: 84, tags: ["Production", "Memory Foam"],
  },
  { id: 31, code: "BSP-02-L1", name: "سالن تولید", parentId: 30, typeKey: "location", level: 3, path: "1.2.30.31", status: "active", healthScore: 88, criticality: "high" },
  { id: 32, code: "BSP-02-C1", name: "دسته پرس", parentId: 31, typeKey: "category", level: 4, path: "1.2.30.31.32", status: "active", healthScore: 90, criticality: "high" },
  {
    id: 33, code: "PR-201", name: "پرس مموری PR-201", parentId: 32, typeKey: "equipment", level: 5, path: "1.2.30.31.32.33",
    manufacturer: "Hennecke", model: "MEMORY-2000", serialNumber: "SN-2021-1834", yearManufactured: 2021,
    status: "active", healthScore: 90, criticality: "critical",
    mtbf: 580, mttr: 2.5, availability: 95, reliability: 93, failureRate: 1.5, oee: 88, totalFailures: 1, totalDowntime: 6,
    specifications: { "ظرفیت": "2000 kg", "فشار": "150 bar" }
  },
  { id: 34, code: "PR-201-H1", name: "سیستم هیدرولیک", parentId: 33, typeKey: "subsystem", level: 6, path: "1.2.30.31.32.33.34", status: "active", healthScore: 92, criticality: "critical" },
  { id: 35, code: "PR-201-C1", name: "سیستم خنک‌کننده", parentId: 33, typeKey: "subsystem", level: 6, path: "1.2.30.31.32.33.35", status: "active", healthScore: 85, criticality: "high" },

  // ═══════════════════════════════════════════════
  // BESPAR 3 - اسفنج
  // ═══════════════════════════════════════════════
  {
    id: 40, code: "BSP-03", name: "بسپار ۳ (اسفنج)", nameEn: "Bespar 3 - Sponge",
    parentId: 2, typeKey: "bespar", level: 2, path: "1.2.40",
    status: "maintenance", healthScore: 76, criticality: "high",
    availability: 82, reliability: 78, oee: 72, tags: ["Production", "Sponge"],
  },
  { id: 41, code: "BSP-03-L1", name: "خط برش", parentId: 40, typeKey: "location", level: 3, path: "1.2.40.41", status: "active", healthScore: 82, criticality: "high" },
  {
    id: 42, code: "CT-301", name: "دستگاه برش CT-301", parentId: 41, typeKey: "equipment", level: 5, path: "1.2.40.41.42",
    manufacturer: "Bäumer", model: "MBC-2500", serialNumber: "SN-2019-9012", yearManufactured: 2019,
    status: "active", healthScore: 82, criticality: "high",
    mtbf: 450, mttr: 3.2, availability: 92, reliability: 88, failureRate: 2.2, oee: 84, totalFailures: 3, totalDowntime: 15,
  },
  { id: 43, code: "BSP-03-L2", name: "خط بسته‌بندی", parentId: 40, typeKey: "location", level: 3, path: "1.2.40.43", status: "maintenance", healthScore: 70, criticality: "medium" },
  {
    id: 44, code: "PK-301", name: "دستگاه بسته‌بندی PK-301", parentId: 43, typeKey: "equipment", level: 5, path: "1.2.40.43.44",
    manufacturer: "Ashima", model: "VP-800", serialNumber: "SN-2018-6789", yearManufactured: 2018,
    status: "maintenance", healthScore: 70, criticality: "high",
    mtbf: 310, mttr: 5.5, availability: 85, reliability: 78, failureRate: 3.5, oee: 72, totalFailures: 7, totalDowntime: 45,
  },

  // ═══════════════════════════════════════════════
  // BESPAR 4
  // ═══════════════════════════════════════════════
  {
    id: 50, code: "BSP-04", name: "بسپار ۴", parentId: 2, typeKey: "bespar", level: 2, path: "1.2.50",
    status: "active", healthScore: 86, criticality: "high",
    availability: 90, reliability: 87, oee: 82,
  },
  { id: 51, code: "BSP-04-L1", name: "خط اصلی", parentId: 50, typeKey: "location", level: 3, path: "1.2.50.51", status: "active", healthScore: 86, criticality: "high" },
  {
    id: 52, code: "EQ-401", name: "پمپ فرآیند EQ-401", parentId: 51, typeKey: "equipment", level: 5, path: "1.2.50.51.52",
    manufacturer: "Grundfos", model: "CR-95", serialNumber: "SN-2020-4531", yearManufactured: 2020,
    status: "active", healthScore: 86, criticality: "high",
    mtbf: 490, mttr: 3.0, availability: 93, reliability: 90, failureRate: 2.0, oee: 85, totalFailures: 2, totalDowntime: 10,
  },

  // ═══════════════════════════════════════════════
  // BESPAR 5
  // ═══════════════════════════════════════════════
  {
    id: 60, code: "BSP-05", name: "بسپار ۵", parentId: 2, typeKey: "bespar", level: 2, path: "1.2.60",
    status: "active", healthScore: 89, criticality: "high",
    availability: 92, reliability: 90, oee: 85,
  },
  { id: 61, code: "BSP-05-L1", name: "سالن تولید", parentId: 60, typeKey: "location", level: 3, path: "1.2.60.61", status: "active", healthScore: 89, criticality: "high" },
  {
    id: 62, code: "CM-501", name: "کمپرسور CM-501", parentId: 61, typeKey: "equipment", level: 5, path: "1.2.60.61.62",
    manufacturer: "Atlas Copco", model: "GA-75", serialNumber: "SN-2020-5678", yearManufactured: 2020,
    status: "active", healthScore: 88, criticality: "medium",
    mtbf: 600, mttr: 3.0, availability: 93, reliability: 91, failureRate: 1.7, oee: 84, totalFailures: 2, totalDowntime: 10,
  },
  { id: 63, code: "CM-501-F1", name: "فیلتر هوا", parentId: 62, typeKey: "part", level: 6, path: "1.2.60.61.62.63", status: "active", healthScore: 82, criticality: "medium" },
  { id: 64, code: "CM-501-O1", name: "سیستم روغن", parentId: 62, typeKey: "subsystem", level: 6, path: "1.2.60.61.62.64", status: "active", healthScore: 90, criticality: "high" },

  // ═══════════════════════════════════════════════
  // BESPAR 6
  // ═══════════════════════════════════════════════
  {
    id: 70, code: "BSP-06", name: "بسپار ۶", parentId: 2, typeKey: "bespar", level: 2, path: "1.2.70",
    status: "active", healthScore: 87, criticality: "medium",
    availability: 91, reliability: 88, oee: 83,
  },
  { id: 71, code: "BSP-06-L1", name: "خط جدید", parentId: 70, typeKey: "location", level: 3, path: "1.2.70.71", status: "active", healthScore: 87, criticality: "medium" },
  {
    id: 72, code: "GN-601", name: "ژنراتور کمکی GN-601", parentId: 71, typeKey: "equipment", level: 5, path: "1.2.70.71.72",
    manufacturer: "Caterpillar", model: "C15", serialNumber: "SN-2022-8834", yearManufactured: 2022,
    status: "active", healthScore: 94, criticality: "high",
    mtbf: 720, mttr: 2.0, availability: 96, reliability: 94, failureRate: 1.2, oee: 89, totalFailures: 1, totalDowntime: 4,
  },

  // ═══════════════════════════════════════════════
  // UTILITIES (Cross-cutting)
  // ═══════════════════════════════════════════════
  {
    id: 80, code: "UTIL", name: "تأسیسات جانبی", parentId: 2, typeKey: "bespar", level: 2, path: "1.2.80",
    status: "active", healthScore: 90, criticality: "high",
  },
  { id: 81, code: "UTIL-L1", name: "دیگ بخار", parentId: 80, typeKey: "location", level: 3, path: "1.2.80.81", status: "active", healthScore: 91, criticality: "critical" },
  {
    id: 82, code: "BL-801", name: "دیگ بخار BL-801", parentId: 81, typeKey: "equipment", level: 5, path: "1.2.80.81.82",
    manufacturer: "Bosch", model: "UL-S-8000", yearManufactured: 2015,
    status: "active", healthScore: 91, criticality: "critical",
    mtbf: 850, mttr: 4.0, availability: 96, reliability: 93, oee: 88,
  },
  { id: 83, code: "UTIL-L2", name: "برج خنک‌کننده", parentId: 80, typeKey: "location", level: 3, path: "1.2.80.83", status: "active", healthScore: 89, criticality: "high" },
];

// Helper functions
export function getAssetById(id: number): AssetNode | undefined {
  return assetsTreeData.find(a => a.id === id);
}

export function getAssetPath(id: number): AssetNode[] {
  const asset = getAssetById(id);
  if (!asset) return [];
  const path: AssetNode[] = [asset];
  let current = asset;
  while (current.parentId) {
    const parent = getAssetById(current.parentId);
    if (!parent) break;
    path.unshift(parent);
    current = parent;
  }
  return path;
}

export function getAssetChildren(parentId: number | null): AssetNode[] {
  return assetsTreeData.filter(a => a.parentId === parentId);
}

export function getAssetDescendants(parentId: number): AssetNode[] {
  const descendants: AssetNode[] = [];
  const children = getAssetChildren(parentId);
  for (const child of children) {
    descendants.push(child);
    descendants.push(...getAssetDescendants(child.id));
  }
  return descendants;
}

export function countAssetsByType(): Record<AssetTypeKey, number> {
  const counts: Record<string, number> = {};
  for (const asset of assetsTreeData) {
    counts[asset.typeKey] = (counts[asset.typeKey] || 0) + 1;
  }
  return counts as Record<AssetTypeKey, number>;
}

// Missing exports reconstructed
export type CategoryKey = string;

export const assetCategories: Record<CategoryKey, { label: string; icon: string; color: string; description?: string }> = {
  "دسته میکسر": { label: "دسته میکسر", icon: "📂", color: "#f59e0b" },
  "دسته کانوایر": { label: "دسته کانوایر", icon: "📂", color: "#f59e0b" },
  "دسته پرس": { label: "دسته پرس", icon: "📂", color: "#f59e0b" },
  "میکسر": { label: "میکسر", icon: "📂", color: "#f59e0b" },
  "کانوایر": { label: "کانوایر", icon: "📂", color: "#f59e0b" },
  "پرس": { label: "پرس", icon: "📂", color: "#f59e0b" },
};

export function countByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const asset of assetsTreeData) {
    if (asset.typeKey === "category") {
      counts[asset.name] = (counts[asset.name] || 0) + 1;
    }
  }
  return counts;
}

export function getAssetsByCategory(categoryName: string): AssetNode[] {
  const category = assetsTreeData.find(a => a.typeKey === "category" && a.name === categoryName);
  if (!category) return [];
  return getAssetDescendants(category.id).filter(a => a.id !== category.id);
}

export function isStructural(node: AssetNode | AssetTypeKey): boolean {
  const key = typeof node === "string" ? node : node.typeKey;
  return ["company", "plant", "bespar", "location", "category"].includes(key);
}

export function countRealEquipment(): number {
  return assetsTreeData.filter(a => a.typeKey === "equipment").length;
}

export function getAllRealEquipment(): AssetNode[] {
  return assetsTreeData.filter(a => a.typeKey === "equipment");
}
