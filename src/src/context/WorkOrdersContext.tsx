"use client";
import React, { createContext, useContext, useState } from "react";

export interface WorkOrder {
  id?: number;
  title: string;
  status: string;
  assetId?: number;
  priority: string;
  description?: string;
  assetName?: string;
  type?: string;
  assignedTo?: string;
  scheduledDate?: string;
  estimatedHours?: string | number;
  orderNumber?: string;
}

interface ContextValue {
  orders: WorkOrder[];
  addOrder: (o: WorkOrder) => WorkOrder;
  addWorkOrder: (o: WorkOrder) => WorkOrder;
  updateOrder: (o: WorkOrder) => void;
}

const WorkOrdersContext = createContext<ContextValue | undefined>(undefined);

export function WorkOrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const addOrder = (o: WorkOrder): WorkOrder => {
    const newOrder = { ...o, id: o.id || Date.now() };
    setOrders((prev) => [...prev, newOrder]);
    return newOrder;
  };
  const addWorkOrder = addOrder;
  const updateOrder = (o: WorkOrder) => setOrders((prev) => prev.map((p) => (p.id === o.id ? o : p)));
  return <WorkOrdersContext.Provider value={{ orders, addOrder, addWorkOrder, updateOrder }}>{children}</WorkOrdersContext.Provider>;
}

export function useWorkOrders() {
  const ctx = useContext(WorkOrdersContext);
  if (!ctx) throw new Error("useWorkOrders must be inside WorkOrdersProvider");
  return ctx;
}
