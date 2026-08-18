import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ci: text("ci").notNull().unique(),
  area: text("area").notNull(),
  role: text("role").notNull().default("trabajador"),
  phone: text("phone").notNull().default(""),
  sex: text("sex").notNull().default(""),
  birthDate: text("birth_date").notNull().default(""),
  birthPlace: text("birth_place").notNull().default(""),
  occupation: text("occupation").notNull().default(""),
  maritalStatus: text("marital_status").notNull().default(""),
  children: integer("children").notNull().default(0),
  address: text("address").notNull().default(""),
  personalReference: text("personal_reference").notNull().default(""),
  otherReferences: text("other_references").notNull().default(""),
  transport: text("transport").notNull().default(""),
  academicBackground: text("academic_background").notNull().default(""),
  workExperience: text("work_experience").notNull().default(""),
  healthBackground: text("health_background").notNull().default(""),
  dailyWageBs: real("daily_wage_bs").notNull().default(0),
  registrationPlace: text("registration_place").notNull().default("Cochabamba"),
  hireDate: text("hire_date").notNull(),
  status: text("status").notNull().default("activo"),
});

export const employeeStatusHistory = sqliteTable("employee_status_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  eventType: text("event_type").notNull(),
  effectiveDate: text("effective_date").notNull(),
  note: text("note").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_employee_status_employee").on(table.employeeId)]);

export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  nit: text("nit").notNull().default(""),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull().default(""),
  contact: text("contact").notNull().default(""),
  email: text("email").notNull().default(""),
  notes: text("notes").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const productLines = sqliteTable("product_lines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  section: text("section").notNull().default("Sin sección"),
  line: text("line").notNull().default("Sin línea"),
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
  loanMovementId: integer("loan_movement_id"),
  note: text("note").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_movements_product_id").on(table.productId),
  index("idx_movements_employee_id").on(table.employeeId),
  index("idx_movements_loan_id").on(table.loanMovementId),
]);

export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  eventType: text("event_type").notNull(),
  source: text("source").notNull().default("manual"),
  occurredAt: text("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_attendance_employee_id").on(table.employeeId)]);

export const workOrders = sqliteTable("work_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  client: text("client").notNull().default(""),
  quantity: integer("quantity").notNull().default(1),
  model: text("model").notNull().default(""),
  responsibleEmployeeId: integer("responsible_employee_id").notNull().references(() => employees.id),
  area: text("area").notNull(),
  progress: integer("progress").notNull().default(0),
  status: text("status").notNull().default("en_proceso"),
  startDate: text("start_date").notNull().default(""),
  dueDate: text("due_date").notNull(),
  notes: text("notes").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_work_orders_responsible").on(table.responsibleEmployeeId),
  index("idx_work_orders_status").on(table.status),
]);

export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entryNumber: text("entry_number").notNull().default(""),
  supplier: text("supplier").notNull(),
  invoice: text("invoice").notNull(),
  totalBs: real("total_bs").notNull(),
  status: text("status").notNull().default("pendiente_recepcion"),
  purchaseDate: text("purchase_date").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_purchases_date").on(table.purchaseDate)]);

export const purchaseItems = sqliteTable("purchase_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  purchaseId: integer("purchase_id").notNull().references(() => purchases.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantityBase: real("quantity_base").notNull(),
  enteredQuantity: real("entered_quantity").notNull(),
  enteredUnit: text("entered_unit").notNull(),
  unitPriceBs: real("unit_price_bs").notNull(),
  subtotalBs: real("subtotal_bs").notNull(),
}, (table) => [
  index("idx_purchase_items_purchase_id").on(table.purchaseId),
  index("idx_purchase_items_product_id").on(table.productId),
]);
