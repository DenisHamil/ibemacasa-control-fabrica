import { env } from "cloudflare:workers";

let ready = false;

export async function ensureSchema() {
  if (ready) return;
  const statements = [
    `CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, ci TEXT NOT NULL UNIQUE, area TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'trabajador', phone TEXT NOT NULL DEFAULT '', sex TEXT NOT NULL DEFAULT '', birth_date TEXT NOT NULL DEFAULT '', birth_place TEXT NOT NULL DEFAULT '', occupation TEXT NOT NULL DEFAULT '', marital_status TEXT NOT NULL DEFAULT '', children INTEGER NOT NULL DEFAULT 0, address TEXT NOT NULL DEFAULT '', personal_reference TEXT NOT NULL DEFAULT '', other_references TEXT NOT NULL DEFAULT '', transport TEXT NOT NULL DEFAULT '', academic_background TEXT NOT NULL DEFAULT '', work_experience TEXT NOT NULL DEFAULT '', health_background TEXT NOT NULL DEFAULT '', daily_wage_bs REAL NOT NULL DEFAULT 0, registration_place TEXT NOT NULL DEFAULT 'Cochabamba', hire_date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'activo')`,
    `CREATE TABLE IF NOT EXISTS employee_status_history (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL REFERENCES employees(id), event_type TEXT NOT NULL, effective_date TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS suppliers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, nit TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', contact TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1)`,
    `CREATE TABLE IF NOT EXISTS product_lines (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1)`,
    `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, category TEXT NOT NULL, section TEXT NOT NULL DEFAULT 'Sin sección', line TEXT NOT NULL DEFAULT 'Sin línea', tracking_type TEXT NOT NULL, base_unit TEXT NOT NULL, stock_base REAL NOT NULL DEFAULT 0, min_stock_base REAL NOT NULL DEFAULT 0, purchase_presentation TEXT NOT NULL, presentation_factor_base REAL NOT NULL DEFAULT 1, location TEXT NOT NULL DEFAULT 'Sin asignar', active INTEGER NOT NULL DEFAULT 1)`,
    `CREATE TABLE IF NOT EXISTS movements (id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL REFERENCES products(id), employee_id INTEGER REFERENCES employees(id), kind TEXT NOT NULL, quantity_base REAL NOT NULL, entered_quantity REAL NOT NULL, entered_unit TEXT NOT NULL, condition TEXT NOT NULL DEFAULT 'bueno', loan_movement_id INTEGER, note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL REFERENCES employees(id), event_type TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'manual', occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS work_orders (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, title TEXT NOT NULL, client TEXT NOT NULL DEFAULT '', quantity INTEGER NOT NULL DEFAULT 1, model TEXT NOT NULL DEFAULT '', responsible_employee_id INTEGER NOT NULL REFERENCES employees(id), area TEXT NOT NULL, progress INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'en_proceso', start_date TEXT NOT NULL DEFAULT '', due_date TEXT NOT NULL, notes TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS purchases (id INTEGER PRIMARY KEY AUTOINCREMENT, entry_number TEXT NOT NULL DEFAULT '', supplier TEXT NOT NULL, invoice TEXT NOT NULL, total_bs REAL NOT NULL, status TEXT NOT NULL DEFAULT 'pendiente_recepcion', purchase_date TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS purchase_items (id INTEGER PRIMARY KEY AUTOINCREMENT, purchase_id INTEGER NOT NULL REFERENCES purchases(id), product_id INTEGER NOT NULL REFERENCES products(id), quantity_base REAL NOT NULL, entered_quantity REAL NOT NULL, entered_unit TEXT NOT NULL, unit_price_bs REAL NOT NULL, subtotal_bs REAL NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS idx_movements_product_id ON movements(product_id)`,
    `CREATE INDEX IF NOT EXISTS idx_movements_employee_id ON movements(employee_id)`,
    `CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id)`,
    `CREATE INDEX IF NOT EXISTS idx_employee_status_employee ON employee_status_history(employee_id)`,
    `CREATE INDEX IF NOT EXISTS idx_work_orders_responsible ON work_orders(responsible_employee_id)`,
    `CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date)`,
  ];
  await env.DB.batch(statements.map((statement) => env.DB.prepare(statement)));
  const employeeColumns = await env.DB.prepare("PRAGMA table_info(employees)").all<{ name: string }>();
  const employeeAdditions = [
    ["sex", "ALTER TABLE employees ADD COLUMN sex TEXT NOT NULL DEFAULT ''"],
    ["birth_date", "ALTER TABLE employees ADD COLUMN birth_date TEXT NOT NULL DEFAULT ''"],
    ["birth_place", "ALTER TABLE employees ADD COLUMN birth_place TEXT NOT NULL DEFAULT ''"],
    ["occupation", "ALTER TABLE employees ADD COLUMN occupation TEXT NOT NULL DEFAULT ''"],
    ["marital_status", "ALTER TABLE employees ADD COLUMN marital_status TEXT NOT NULL DEFAULT ''"],
    ["children", "ALTER TABLE employees ADD COLUMN children INTEGER NOT NULL DEFAULT 0"],
    ["address", "ALTER TABLE employees ADD COLUMN address TEXT NOT NULL DEFAULT ''"],
    ["personal_reference", "ALTER TABLE employees ADD COLUMN personal_reference TEXT NOT NULL DEFAULT ''"],
    ["other_references", "ALTER TABLE employees ADD COLUMN other_references TEXT NOT NULL DEFAULT ''"],
    ["transport", "ALTER TABLE employees ADD COLUMN transport TEXT NOT NULL DEFAULT ''"],
    ["academic_background", "ALTER TABLE employees ADD COLUMN academic_background TEXT NOT NULL DEFAULT ''"],
    ["work_experience", "ALTER TABLE employees ADD COLUMN work_experience TEXT NOT NULL DEFAULT ''"],
    ["health_background", "ALTER TABLE employees ADD COLUMN health_background TEXT NOT NULL DEFAULT ''"],
    ["daily_wage_bs", "ALTER TABLE employees ADD COLUMN daily_wage_bs REAL NOT NULL DEFAULT 0"],
    ["registration_place", "ALTER TABLE employees ADD COLUMN registration_place TEXT NOT NULL DEFAULT 'Cochabamba'"],
  ] as const;
  for (const [column, statement] of employeeAdditions) {
    if (!employeeColumns.results.some((item) => item.name === column)) await env.DB.prepare(statement).run();
  }
  const productColumns = await env.DB.prepare("PRAGMA table_info(products)").all<{ name: string }>();
  if (!productColumns.results.some((column) => column.name === "section")) {
    await env.DB.prepare("ALTER TABLE products ADD COLUMN section TEXT NOT NULL DEFAULT 'Sin sección'").run();
    await env.DB.prepare("UPDATE products SET section = category WHERE section = 'Sin sección'").run();
  }
  if (!productColumns.results.some((column) => column.name === "line")) {
    await env.DB.prepare("ALTER TABLE products ADD COLUMN line TEXT NOT NULL DEFAULT 'Sin línea'").run();
  }
  const movementColumns = await env.DB.prepare("PRAGMA table_info(movements)").all<{ name: string }>();
  if (!movementColumns.results.some((column) => column.name === "loan_movement_id")) {
    await env.DB.prepare("ALTER TABLE movements ADD COLUMN loan_movement_id INTEGER").run();
  }
  const purchaseColumns = await env.DB.prepare("PRAGMA table_info(purchases)").all<{ name: string }>();
  if (!purchaseColumns.results.some((column) => column.name === "entry_number")) {
    await env.DB.prepare("ALTER TABLE purchases ADD COLUMN entry_number TEXT NOT NULL DEFAULT ''").run();
    await env.DB.prepare("UPDATE purchases SET entry_number = printf('%06d', id) WHERE entry_number = ''").run();
  }
  const workOrderColumns = await env.DB.prepare("PRAGMA table_info(work_orders)").all<{ name: string }>();
  if (!workOrderColumns.results.some((column) => column.name === "quantity")) await env.DB.prepare("ALTER TABLE work_orders ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1").run();
  if (!workOrderColumns.results.some((column) => column.name === "model")) await env.DB.prepare("ALTER TABLE work_orders ADD COLUMN model TEXT NOT NULL DEFAULT ''").run();
  if (!workOrderColumns.results.some((column) => column.name === "start_date")) await env.DB.prepare("ALTER TABLE work_orders ADD COLUMN start_date TEXT NOT NULL DEFAULT ''").run();
  if (!workOrderColumns.results.some((column) => column.name === "notes")) await env.DB.prepare("ALTER TABLE work_orders ADD COLUMN notes TEXT NOT NULL DEFAULT ''").run();
  await env.DB.batch([
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_movements_loan_id ON movements(loan_movement_id)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON purchase_items(product_id)"),
  ]);
  await env.DB.prepare("PRAGMA optimize").run();
  ready = true;
}
