export interface HistoryRecord {
  id: number;
  date: string;
  action: string;
  user: string;
}

export const migrationStats = { totalRecords: 0 };
export const historyRecordsData: HistoryRecord[] = [];
export const activityTypes: string[] = [];
export const standardSubsystems: string[] = [];
export const wizardQuestions: any[] = [];

export function getLastRecordDate(): string {
  return new Date().toISOString();
}

export function calculateMigrationStats() {
  return {
    totalAssets: 0,
    migrated: 0,
    pending: 0,
    errors: 0,
  };
}
