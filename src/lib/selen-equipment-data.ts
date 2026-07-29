export interface PMActivity {
  id: number;
  name: string;
  frequencyDays: number;
  lastDone?: string;
  estimatedMinutes?: number;
  activity?: string;
  standard?: string;
  requiredParts?: string[];
}

export function getEquipmentByIdentity(code: string) {
  return { id: 0, code, name: "", status: "active", category: "default" };
}

export interface PMTemplate {
  pending: number;
  completed: number;
  totalActivities: number;
  standard: string;
  totalHoursPerYear: number;
  groups: Record<string, PMActivity[]>;
}

export function getPMSummary(category?: string): PMTemplate {
  return {
    pending: 0,
    completed: 0,
    totalActivities: 12,
    standard: "ISO 14224+API 610",
    totalHoursPerYear: 48,
    groups: {
      "روزانه": [
        { id: 1, name: "بازرسی بصری", frequencyDays: 1, estimatedMinutes: 15 },
        { id: 2, name: "چک دما", frequencyDays: 1, estimatedMinutes: 10 },
      ],
      "هفتگی": [
        { id: 3, name: "روغن‌کاری", frequencyDays: 7, estimatedMinutes: 30 },
        { id: 4, name: "تنظیم تسمه", frequencyDays: 7, estimatedMinutes: 20 },
      ],
      "ماهانه": [
        { id: 5, name: "تعویض فیلتر", frequencyDays: 30, estimatedMinutes: 45 },
      ],
    },
  };
}
