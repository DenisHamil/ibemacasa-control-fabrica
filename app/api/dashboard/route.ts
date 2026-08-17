import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { attendance, employees, movements, products, purchases } from "../../../db/schema";

async function seedIfEmpty() {
  const db = getDb();
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length) return;

  await db.insert(employees).values([
    { name: "Yasmani Herrera", ci: "8012456", area: "Carpintería", role: "trabajador", phone: "70700001", hireDate: "2025-10-01" },
    { name: "Óscar Vargas", ci: "6532109", area: "Barniz", role: "trabajador", phone: "70700002", hireDate: "2025-09-12" },
    { name: "Brayan Vargas", ci: "9045821", area: "Tapicería", role: "trabajador", phone: "70700003", hireDate: "2026-01-08" },
    { name: "Mariela Flores", ci: "7854132", area: "Almacén", role: "almacen", phone: "70700004", hireDate: "2024-06-03" },
  ]);

  await db.insert(products).values([
    { code: "ADH-001", name: "Carpicola industrial", category: "Adhesivos", trackingType: "consumible", baseUnit: "g", stockBase: 4850, minStockBase: 2000, purchasePresentation: "Galón 3,5 L", presentationFactorBase: 3500, location: "A-01" },
    { code: "BAR-018", name: "Catalizador PU Sayerlack", category: "Barnices", trackingType: "consumible", baseUnit: "ml", stockBase: 7200, minStockBase: 3600, purchasePresentation: "Lata 18 L", presentationFactorBase: 18000, location: "A-03" },
    { code: "FER-055", name: "Clavo 2 pulgadas", category: "Ferretería", trackingType: "consumible", baseUnit: "g", stockBase: 12400, minStockBase: 5000, purchasePresentation: "Bolsa 25 kg", presentationFactorBase: 25000, location: "B-02" },
    { code: "TAP-010", name: "Cuero sintético negro", category: "Tapicería", trackingType: "consumible", baseUnit: "m", stockBase: 22.5, minStockBase: 8, purchasePresentation: "Rollo 30 m", presentationFactorBase: 30, location: "C-01" },
    { code: "HER-077", name: "Lijadora eléctrica Rainani", category: "Herramientas", trackingType: "retornable", baseUnit: "pza", stockBase: 3, minStockBase: 1, purchasePresentation: "Pieza", presentationFactorBase: 1, location: "H-04" },
    { code: "EPP-011", name: "Máscara antigases completa", category: "EPP", trackingType: "retornable", baseUnit: "pza", stockBase: 6, minStockBase: 2, purchasePresentation: "Pieza", presentationFactorBase: 1, location: "E-02" },
    { code: "COR-004", name: "Cuerda de cáñamo 8 mm", category: "Tapicería", trackingType: "consumible", baseUnit: "m", stockBase: 41, minStockBase: 12, purchasePresentation: "Rollo 100 m", presentationFactorBase: 100, location: "C-03" },
  ]);

  await db.insert(purchases).values([
    { supplier: "Multibarniz", invoice: "F-181", totalBs: 2000, status: "recibido", purchaseDate: "2026-08-14" },
    { supplier: "Ferretería Central", invoice: "F-2048", totalBs: 846.5, status: "pendiente_recepcion", purchaseDate: "2026-08-16" },
  ]);

  const people = await db.select().from(employees).orderBy(asc(employees.id));
  const items = await db.select().from(products).orderBy(asc(products.id));
  await db.insert(movements).values([
    { productId: items[0].id, employeeId: people[0].id, kind: "salida", quantityBase: 650, enteredQuantity: 650, enteredUnit: "g", note: "Orden dormitorio Andino" },
    { productId: items[4].id, employeeId: people[0].id, kind: "prestamo", quantityBase: 1, enteredQuantity: 1, enteredUnit: "pza", condition: "bueno" },
    { productId: items[2].id, employeeId: people[2].id, kind: "salida", quantityBase: 1200, enteredQuantity: 1.2, enteredUnit: "kg", note: "Armado de bastidores" },
  ]);
}

export async function GET() {
  try {
    await ensureSchema();
    await seedIfEmpty();
    const db = getDb();
    const [items, people, recent, checks, buys] = await Promise.all([
      db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.name)),
      db.select().from(employees).orderBy(asc(employees.name)),
      db.select({ id: movements.id, kind: movements.kind, quantityBase: movements.quantityBase, enteredQuantity: movements.enteredQuantity, enteredUnit: movements.enteredUnit, condition: movements.condition, note: movements.note, createdAt: movements.createdAt, productName: products.name, employeeName: employees.name })
        .from(movements).leftJoin(products, eq(movements.productId, products.id)).leftJoin(employees, eq(movements.employeeId, employees.id)).orderBy(desc(movements.id)).limit(12),
      db.select({ id: attendance.id, employeeId: attendance.employeeId, employeeName: employees.name, eventType: attendance.eventType, source: attendance.source, occurredAt: attendance.occurredAt })
        .from(attendance).leftJoin(employees, eq(attendance.employeeId, employees.id)).orderBy(desc(attendance.id)).limit(12),
      db.select().from(purchases).orderBy(desc(purchases.purchaseDate)).limit(10),
    ]);
    return Response.json({ products: items, employees: people, movements: recent, attendance: checks, purchases: buys });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo cargar la información" }, { status: 500 });
  }
}
