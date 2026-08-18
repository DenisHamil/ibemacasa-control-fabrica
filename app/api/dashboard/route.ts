import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { attendance, employees, movements, productLines, products, purchases, suppliers, workOrders } from "../../../db/schema";

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
    { code: "ADH-001", name: "Carpicola industrial", category: "Carpintería", section: "Carpintería", line: "Adhesivos", trackingType: "consumible", baseUnit: "g", stockBase: 4850, minStockBase: 2000, purchasePresentation: "Galón 3,5 L", presentationFactorBase: 3500, location: "A-01" },
    { code: "BAR-018", name: "Catalizador PU Sayerlack", category: "Barniz", section: "Barniz", trackingType: "consumible", baseUnit: "l", stockBase: 7.2, minStockBase: 3.6, purchasePresentation: "Lata 18 L", presentationFactorBase: 18, location: "A-03" },
    { code: "FER-055", name: "Clavo 2 pulgadas", category: "Carpintería", section: "Carpintería", trackingType: "consumible", baseUnit: "g", stockBase: 12400, minStockBase: 5000, purchasePresentation: "Bolsa 25 kg", presentationFactorBase: 25000, location: "B-02" },
    { code: "TAP-010", name: "Cuero sintético negro", category: "Tapicería", section: "Tapicería", trackingType: "consumible", baseUnit: "m", stockBase: 22.5, minStockBase: 8, purchasePresentation: "Rollo 30 m", presentationFactorBase: 30, location: "C-01" },
    { code: "HER-077", name: "Lijadora eléctrica Rainani", category: "Carpintería", section: "Carpintería", trackingType: "retornable", baseUnit: "pza", stockBase: 3, minStockBase: 1, purchasePresentation: "Pieza", presentationFactorBase: 1, location: "H-04" },
    { code: "EPP-011", name: "Máscara antigases completa", category: "Acabados", section: "Acabados", trackingType: "retornable", baseUnit: "pza", stockBase: 6, minStockBase: 2, purchasePresentation: "Pieza", presentationFactorBase: 1, location: "E-02" },
    { code: "COR-004", name: "Cuerda de cáñamo 8 mm", category: "Tapicería", section: "Tapicería", trackingType: "consumible", baseUnit: "m", stockBase: 41, minStockBase: 12, purchasePresentation: "Rollo 100 m", presentationFactorBase: 100, location: "C-03" },
    { code: "ACC-022", name: "Bisagra cierre suave", category: "Carpintería", section: "Carpintería", trackingType: "consumible", baseUnit: "pza", stockBase: 168, minStockBase: 40, purchasePresentation: "Caja 100 unidades", presentationFactorBase: 100, location: "B-05" },
  ]);

  await db.insert(suppliers).values([
    { name: "Multibarniz", phone: "", address: "Cochabamba" },
    { name: "Ferretería Central", phone: "", address: "Cochabamba" },
  ]).onConflictDoNothing();
  await db.insert(productLines).values([
    { name: "Adhesivos", description: "Colas y pegamentos" },
    { name: "Ferretería", description: "Clavos, tornillos y accesorios" },
    { name: "Barnices", description: "Barnices, pinturas y solventes" },
    { name: "Tapicería", description: "Telas, cueros y cuerdas" },
  ]).onConflictDoNothing();

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

async function seedWorkOrdersIfEmpty() {
  const db = getDb();
  const existing = await db.select({ id: workOrders.id }).from(workOrders).limit(1);
  if (existing.length) return;
  const people = await db.select().from(employees).orderBy(asc(employees.id));
  if (people.length < 3) return;
  await db.insert(workOrders).values([
    { code: "OT-0261", title: "Dormitorio Andino", client: "Pedido showroom", quantity:1, model:"Andino", responsibleEmployeeId: people[0].id, area: "Carpintería", progress: 68, status: "en_proceso", startDate:"2026-08-10", dueDate: "2026-08-24",notes:"" },
    { code: "OT-0262", title: "Juego de comedor Roble", client: "Familia Vargas", quantity:1, model:"Roble", responsibleEmployeeId: people[2].id, area: "Carpintería", progress: 35, status: "en_proceso", startDate:"2026-08-11", dueDate: "2026-08-29",notes:"" },
    { code: "OT-0257", title: "Sillón tres cuerpos", client: "Pedido tienda", quantity:1, model:"Premium", responsibleEmployeeId: people[1].id, area: "Barniz", progress: 100, status: "completado", startDate:"2026-08-07", dueDate: "2026-08-18",notes:"Concluido" },
  ]);
}

async function seedCatalogsIfEmpty() {
  const db=getDb();
  const [provider,line]=await Promise.all([db.select({id:suppliers.id}).from(suppliers).limit(1),db.select({id:productLines.id}).from(productLines).limit(1)]);
  if(!provider.length)await db.insert(suppliers).values([{ name:"Multibarniz",address:"Cochabamba" },{ name:"Ferretería Central",address:"Cochabamba" }]);
  if(!line.length)await db.insert(productLines).values([{name:"Adhesivos",description:"Colas y pegamentos"},{name:"Ferretería",description:"Clavos, tornillos y accesorios"},{name:"Barnices",description:"Barnices, pinturas y solventes"},{name:"Tapicería",description:"Telas, cueros y cuerdas"}]);
}

export async function GET() {
  try {
    await ensureSchema();
    await seedIfEmpty();
    await seedWorkOrdersIfEmpty();
    await seedCatalogsIfEmpty();
    const db = getDb();
    const [items, people, recentRaw, checks, buys, jobs, providerRows, lineRows] = await Promise.all([
      db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.name)),
      db.select().from(employees).orderBy(asc(employees.name)),
      db.select({ id: movements.id, productId: movements.productId, employeeId: movements.employeeId, loanMovementId: movements.loanMovementId, kind: movements.kind, quantityBase: movements.quantityBase, enteredQuantity: movements.enteredQuantity, enteredUnit: movements.enteredUnit, condition: movements.condition, note: movements.note, createdAt: movements.createdAt, productName: products.name, trackingType: products.trackingType, employeeName: employees.name })
        .from(movements).leftJoin(products, eq(movements.productId, products.id)).leftJoin(employees, eq(movements.employeeId, employees.id)).orderBy(desc(movements.id)),
      db.select({ id: attendance.id, employeeId: attendance.employeeId, employeeName: employees.name, eventType: attendance.eventType, source: attendance.source, occurredAt: attendance.occurredAt })
        .from(attendance).leftJoin(employees, eq(attendance.employeeId, employees.id)).orderBy(desc(attendance.id)).limit(12),
      db.select().from(purchases).orderBy(desc(purchases.purchaseDate)),
      db.select({ id: workOrders.id, code: workOrders.code, title: workOrders.title, client: workOrders.client, quantity:workOrders.quantity, model:workOrders.model, responsibleEmployeeId: workOrders.responsibleEmployeeId, responsibleName: employees.name, area: workOrders.area, progress: workOrders.progress, status: workOrders.status, startDate:workOrders.startDate, dueDate: workOrders.dueDate, notes:workOrders.notes, updatedAt: workOrders.updatedAt })
        .from(workOrders).leftJoin(employees, eq(workOrders.responsibleEmployeeId, employees.id)).orderBy(desc(workOrders.id)),
      db.select().from(suppliers).where(eq(suppliers.active, true)).orderBy(asc(suppliers.name)),
      db.select().from(productLines).where(eq(productLines.active, true)).orderBy(asc(productLines.name)),
    ]);
    const returnedLoanIds = new Set(recentRaw.filter((movement) => movement.kind === "devolucion" && movement.loanMovementId).map((movement) => movement.loanMovementId));
    const recent = recentRaw.map((movement) => ({ ...movement, returned: movement.kind === "prestamo" && returnedLoanIds.has(movement.id) }));
    return Response.json({ products: items, employees: people, movements: recent, attendance: checks, purchases: buys, workOrders: jobs, suppliers: providerRows, lines: lineRows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo cargar la información" }, { status: 500 });
  }
}
