export interface ParsedSheet {
  name: string;
  headers: string[];
  rows: Record<string, any>[];
  rowCount: number;
}

export function parseFile(file: File | Buffer | string): ParsedSheet[] {
  return [
    { name: "Sheet1", headers: ["code", "name", "status"], rows: [{ code: "T1", name: "تست", status: "active" }], rowCount: 1 },
  ];
}
