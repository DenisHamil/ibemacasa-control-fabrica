import { env } from "cloudflare:workers";

let ready = false;

export async function ensureSchema() {
  if (ready) return;
  const statements = [
    `CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, ci TEXT NOT NULL UNIQUE, area TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'trabajador', phone TEXT NOT NULL DEFAULT '', hire_date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'activo')`,
    `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, category TEXT NOT NULL, tracking_type TEXT NOT NULL, base_unit TEXT NOT NULL, stock_base REAL NOT NULL DEFAULT 0, min_stock_base REAL NOT NULL DEFAULT 0, purchase_presentation TEXT NOT NULL, presentation_factor_base REAL NOT NULL DEFAULT 1, location TEXT NOT NULL DEFAULT 'Sin asignar', active INTEGER NOT NULL DEFAULT 1)`,
    `CREATE TABLE IF NOT EXISTS movements (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL REFERENCES products(id), employee_id INTEGER REFERENCES employees(id), kind TEXT NOT NULL, quantity_base REAL NOT NULL, entered_quantity REAL NOT NULL, entered_unit TEXT NOT NULL, condition TEXT NOT NULL DEFAULT 'bueno', note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL REFERENCES employees(id), event_type TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'manual', occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS purchases (id INTEGER PRIMARY KEY AUTOINCREMENT, supplier TEXT NOT NULL, invoice TEXT NOT NULL, total_bs REAL NOT NULL, status TEXT NOT NULL DEFAULT 'pendiente_recepcion', purchase_date TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE INDEX IF NOT EXISTS idx_movements_product_id ON movements(product_id)`,
    `CREATE INDEX IF NOT EXISTS idx_movements_employee_id ON movements(employee_id)`,
    `CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id)`,
    `CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date)`,
  ];
  await env.DB.batch(statements.map((statement) => env.DB.prepare(statement)));
  await env.DB.prepare("PRAGMA optimize").run();
  ready = true;
}
