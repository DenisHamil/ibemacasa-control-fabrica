import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ci: text("ci").notNull().unique(),
  area: text("area").notNull(),
  role: text("role").notNull().default("trabajador"),
  phone: text("phone").notNull().default(""),
  hireDate: text("hire_date").notNull(),
  status: text("status").notNull().default("activo"),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  trackingType: text("tracking_type").notNull(),
  baseUnit: text("base_unit").notNull(),
  stockBase: real("stock_base").notNull().default(0),
  minStockBase: real("min_stock_base").notNull().default(0),
  purchasePresentation: text("purchase_presentation").notNull(),
  presentationFactorBase: real("presentation_factor_base").notNull().default(1),
  location: text("location").notNull().default("Sin asignar"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const movements = sqliteTable("movements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().references(() => products.id),
  employeeId: integer("employee_id").references(() => employees.id),
  kind: text("kind").notNull(),
  quantityBase: real("quantity_base").notNull(),
  enteredQuantity: real("entered_quantity").notNull(),
  enteredUnit: text("entered_unit").notNull(),
  condition: text("condition").notNull().default("bueno"),
  note: text("note").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_movements_product_id").on(table.productId),
  index("idx_movements_employee_id").on(table.employeeId),
]);

export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  eventType: text("event_type").notNull(),
  source: text("source").notNull().default("manual"),
  occurredAt: text("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_attendance_employee_id").on(table.employeeId)]);

export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  supplier: text("supplier").notNull(),
  invoice: text("invoice").notNull(),
  totalBs: real("total_bs").notNull(),
  status: text("status").notNull().default("pendiente_recepcion"),
  purchaseDate: text("purchase_date").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_purchases_date").on(table.purchaseDate)]);
