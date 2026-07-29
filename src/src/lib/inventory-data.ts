export interface SparePart {
  id: number;
  code?: string;
  name: string;
  quantity: number;
  supplier: string;
}

export const inventoryData: SparePart[] = [];
export const suppliersData: any[] = [];
export const purchaseOrdersData: any[] = [];

export function getInventoryStats() {
  return { total: 0, lowStock: 0, inStock: 0, outOfStock: 0, totalValue: 0, aiAlerts: 0 };
}
