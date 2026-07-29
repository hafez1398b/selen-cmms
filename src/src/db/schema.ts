import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  varchar,
  jsonb,
  PgNumeric,
} from "drizzle-orm/pg-core";
import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";

// ==================== ROLES ====================

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  nameEn: text("name_en").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== USERS ====================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  avatar: text("avatar"),
  roleId: integer("role_id").references(() => roles.id),
  department: text("department"),
  position: text("position"),
  employeeCode: text("employee_code").unique(),
  isActive: boolean("is_active").default(true).notNull(),
  productivity: decimal("productivity", { precision: 5, scale: 2 }).default("0"),
  totalWorkOrders: integer("total_work_orders").default(0),
  completedWorkOrders: integer("completed_work_orders").default(0),
  workingHours: decimal("working_hours", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  workOrders: many(workOrders),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

// ==================== ASSET TYPES ====================

export const assetTypes = pgTable("asset_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  icon: text("icon"),
  color: text("color"),
  level: integer("level").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assetTypesRelations = relations(assetTypes, ({ many }) => ({
  assets: many(assets),
}));

// ==================== ASSETS ====================

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  parentId: integer("parent_id"),
  typeId: integer("type_id").references(() => assetTypes.id),
  level: integer("level").default(0).notNull(),
  path: text("path").default(""),
  serialNumber: text("serial_number"),
  manufacturer: text("manufacturer"),
  model: text("model"),
  yearManufactured: integer("year_manufactured"),
  installationLocation: text("installation_location"),
  specifications: jsonb("specifications").default("{}"),
  status: text("status").default("active").notNull(),
  healthScore: decimal("health_score", { precision: 5, scale: 2 }).default("100"),
  criticality: text("criticality").default("medium"),
  totalDowntime: decimal("total_downtime", { precision: 10, scale: 2 }).default("0"),
  totalFailures: integer("total_failures").default(0),
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  mtbf: decimal("mtbf", { precision: 10, scale: 2 }).default("0"),
  mttr: decimal("mttr", { precision: 10, scale: 2 }).default("0"),
  availability: decimal("availability", { precision: 5, scale: 2 }).default("100"),
  reliability: decimal("reliability", { precision: 5, scale: 2 }).default("100"),
  failureRate: decimal("failure_rate", { precision: 5, scale: 2 }).default("0"),
  oee: decimal("oee", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assetsRelations = relations(assets, ({ one, many }) => ({
  type: one(assetTypes, { fields: [assets.typeId], references: [assetTypes.id] }),
  workOrders: many(workOrders),
  maintenanceOrders: many(maintenanceOrders),
  failures: many(failures),
  spareParts: many(spareParts),
  downtimes: many(downtimes),
}));

// ==================== WORK ORDERS ====================

export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  assetId: integer("asset_id").references(() => assets.id),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  priority: text("priority").default("medium").notNull(),
  type: text("type").default("corrective").notNull(),
  status: text("status").default("open").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  startDate: timestamp("start_date"),
  completedDate: timestamp("completed_date"),
  estimatedHours: decimal("estimated_hours", { precision: 8, scale: 2 }).default("0"),
  actualHours: decimal("actual_hours", { precision: 8, scale: 2 }).default("0"),
  estimatedCost: decimal("estimated_cost", { precision: 12, scale: 2 }).default("0"),
  actualCost: decimal("actual_cost", { precision: 12, scale: 2 }).default("0"),
  failureMode: text("failure_mode"),
  rootCause: text("root_cause"),
  correctiveAction: text("corrective_action"),
  notes: text("notes"),
  checklist: jsonb("checklist").default("[]"),
  partsUsed: jsonb("parts_used").default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workOrdersRelations = relations(workOrders, ({ one }) => ({
  asset: one(assets, { fields: [workOrders.assetId], references: [assets.id] }),
  assignedTo: one(users, { fields: [workOrders.assignedToId], references: [users.id] }),
}));

// ==================== MAINTENANCE ORDERS (PM Schedules) ====================

export const maintenanceOrders = pgTable("maintenance_orders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  assetId: integer("asset_id").references(() => assets.id),
  type: text("type").default("time").notNull(),
  interval: integer("interval").default(30),
  intervalUnit: text("interval_unit").default("days"),
  lastExecuted: timestamp("last_executed"),
  nextDue: timestamp("next_due"),
  isActive: boolean("is_active").default(true).notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  checklists: jsonb("checklists").default("[]"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const maintenanceOrdersRelations = relations(maintenanceOrders, ({ one, many }) => ({
  asset: one(assets, { fields: [maintenanceOrders.assetId], references: [assets.id] }),
  assignedTo: one(users, { fields: [maintenanceOrders.assignedToId], references: [users.id] }),
  executions: many(pmExecutions),
}));

// ==================== PM EXECUTIONS ====================

export const pmExecutions = pgTable("pm_executions", {
  id: serial("id").primaryKey(),
  maintenanceOrderId: integer("maintenance_order_id").references(() => maintenanceOrders.id),
  executedBy: integer("executed_by").references(() => users.id),
  executionDate: timestamp("execution_date").defaultNow().notNull(),
  status: text("status").default("completed").notNull(),
  notes: text("notes"),
  findings: text("findings"),
  checklistsResults: jsonb("checklists_results").default("[]"),
  partsUsed: jsonb("parts_used").default("[]"),
  hoursSpent: decimal("hours_spent", { precision: 8, scale: 2 }).default("0"),
  cost: decimal("cost", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pmExecutionsRelations = relations(pmExecutions, ({ one }) => ({
  maintenanceOrder: one(maintenanceOrders, { fields: [pmExecutions.maintenanceOrderId], references: [maintenanceOrders.id] }),
  executor: one(users, { fields: [pmExecutions.executedBy], references: [users.id] }),
}));

// ==================== FAILURES ====================

export const failures = pgTable("failures", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id),
  title: text("title").notNull(),
  description: text("description"),
  failureType: text("failure_type").default("mechanical"),
  failureMode: text("failure_mode"),
  severity: text("severity").default("medium"),
  status: text("status").default("open").notNull(),
  rootCause: text("root_cause"),
  correctiveAction: text("corrective_action"),
  preventiveAction: text("preventive_action"),
  downtimeStart: timestamp("downtime_start"),
  downtimeEnd: timestamp("downtime_end"),
  downtimeHours: decimal("downtime_hours", { precision: 10, scale: 2 }).default("0"),
  cost: decimal("cost", { precision: 12, scale: 2 }).default("0"),
  reportedBy: integer("reported_by").references(() => users.id),
  workOrderId: integer("work_order_id").references(() => workOrders.id),
  aiAnalysis: jsonb("ai_analysis").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const failuresRelations = relations(failures, ({ one }) => ({
  asset: one(assets, { fields: [failures.assetId], references: [assets.id] }),
  reporter: one(users, { fields: [failures.reportedBy], references: [users.id] }),
  workOrder: one(workOrders, { fields: [failures.workOrderId], references: [workOrders.id] }),
}));

// ==================== DOWNTIME ====================

export const downtimes = pgTable("downtimes", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: decimal("duration", { precision: 10, scale: 2 }).default("0"),
  category: text("category").default("unplanned"),
  reason: text("reason"),
  impact: text("impact").default("low"),
  cost: decimal("cost", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const downtimesRelations = relations(downtimes, ({ one }) => ({
  asset: one(assets, { fields: [downtimes.assetId], references: [assets.id] }),
}));

// ==================== SUPPLIERS ====================

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  spareParts: many(spareParts),
}));

// ==================== CATEGORIES ====================

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  spareParts: many(spareParts),
}));

// ==================== SPARE PARTS ====================

export const spareParts = pgTable("spare_parts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  currentStock: integer("current_stock").default(0).notNull(),
  minimumStock: integer("minimum_stock").default(0),
  maximumStock: integer("maximum_stock").default(0),
  unit: text("unit").default("عدد"),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).default("0"),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).default("0"),
  location: text("location"),
  status: text("status").default("in_stock"),
  assetId: integer("asset_id").references(() => assets.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sparePartsRelations = relations(spareParts, ({ one }) => ({
  category: one(categories, { fields: [spareParts.categoryId], references: [categories.id] }),
  supplier: one(suppliers, { fields: [spareParts.supplierId], references: [suppliers.id] }),
  asset: one(assets, { fields: [spareParts.assetId], references: [assets.id] }),
}));

// ==================== INVENTORY TRANSACTIONS ====================

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  sparePartId: integer("spare_part_id").references(() => spareParts.id),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull(),
  reference: text("reference"),
  referenceType: text("reference_type"),
  performedBy: integer("performed_by").references(() => users.id),
  notes: text("notes"),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).default("0"),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  sparePart: one(spareParts, { fields: [inventoryTransactions.sparePartId], references: [spareParts.id] }),
  performer: one(users, { fields: [inventoryTransactions.performedBy], references: [users.id] }),
}));

// ==================== NOTIFICATIONS ====================

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info"),
  isRead: boolean("is_read").default(false).notNull(),
  priority: text("priority").default("medium"),
  relatedType: text("related_type"),
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// ==================== AUDIT LOGS ====================

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: integer("entity_id"),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

// ==================== EXPORT TYPES ====================

export type Role = InferSelectModel<typeof roles>;
export type NewRole = InferInsertModel<typeof roles>;
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type AssetType = InferSelectModel<typeof assetTypes>;
export type NewAssetType = InferInsertModel<typeof assetTypes>;
export type Asset = InferSelectModel<typeof assets>;
export type NewAsset = InferInsertModel<typeof assets>;
export type WorkOrder = InferSelectModel<typeof workOrders>;
export type NewWorkOrder = InferInsertModel<typeof workOrders>;
export type MaintenanceOrder = InferSelectModel<typeof maintenanceOrders>;
export type NewMaintenanceOrder = InferInsertModel<typeof maintenanceOrders>;
export type PMExecution = InferSelectModel<typeof pmExecutions>;
export type NewPMExecution = InferInsertModel<typeof pmExecutions>;
export type Failure = InferSelectModel<typeof failures>;
export type NewFailure = InferInsertModel<typeof failures>;
export type Downtime = InferSelectModel<typeof downtimes>;
export type NewDowntime = InferInsertModel<typeof downtimes>;
export type Supplier = InferSelectModel<typeof suppliers>;
export type NewSupplier = InferInsertModel<typeof suppliers>;
export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;
export type SparePart = InferSelectModel<typeof spareParts>;
export type NewSparePart = InferInsertModel<typeof spareParts>;
export type InventoryTransaction = InferSelectModel<typeof inventoryTransactions>;
export type NewInventoryTransaction = InferInsertModel<typeof inventoryTransactions>;
export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;
export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
