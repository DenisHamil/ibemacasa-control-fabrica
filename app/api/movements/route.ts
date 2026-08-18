import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { employees, movements, products } from "../../../db/schema";

const standardFactors: Record<string, Record<string, number>> = {
  g: { g: 1, kg: 1000 },
  ml: { ml: 1, l: 1000 },
  l: { l: 1, ml: 0.001 },
  m: { m: 1, cm: 0.01 },
  pza: { pza: 1, unidad: 1, par: 2 },
};

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as { productId?: number; employeeId?: number | null; kind?: string; quantity?: number; unit?: string; condition?: string; note?: string; loanMovementId?: number };
    const db = getDb();
    if (body.kind === "devolucion" && body.loanMovementId) {
      const [loan] = await db.select().from(movements).where(eq(movements.id, body.loanMovementId)).limit(1);
      if (!loan || loan.kind !== "prestamo") return Response.json({ error: "El préstamo original no existe." }, { status: 404 });
      const [existingReturn] = await db.select({ id: movements.id }).from(movements).where(and(eq(movements.kind, "devolucion"), eq(movements.loanMovementId, loan.id))).limit(1);
      if (existingReturn) return Response.json({ error: "Este préstamo ya fue devuelto." }, { status: 409 });
      body.productId = loan.productId;
      body.employeeId = loan.employeeId;
      body.quantity = loan.enteredQuantity;
      body.unit = loan.enteredUnit;
    }
    if (!body.productId || !body.kind || !body.quantity || body.quantity <= 0 || !body.unit) {
      return Response.json({ error: "Completa producto, movimiento, cantidad y unidad." }, { status: 400 });
    }
    const [product] = await db.select().from(products).where(eq(products.id, body.productId)).limit(1);
    if (!product) return Response.json({ error: "Producto no encontrado." }, { status: 404 });
    if (["prestamo", "devolucion", "baja"].includes(body.kind) && product.trackingType !== "retornable") {
      return Response.json({ error: "Esta acción solo corresponde a herramientas retornables." }, { status: 400 });
    }
    if (body.kind === "salida" && product.trackingType !== "consumible") {
      return Response.json({ error: "Las salidas de producción solo usan materiales consumibles." }, { status: 400 });
    }
    if (["prestamo","salida"].includes(body.kind) && body.employeeId) {
      const [employee]=await db.select().from(employees).where(eq(employees.id,body.employeeId)).limit(1);
      if(!employee||employee.status!=="activo")return Response.json({error:"El trabajador no está activo."},{status:400});
    }

    const factor = body.unit === "presentacion" ? product.presentationFactorBase : standardFactors[product.baseUnit]?.[body.unit];
    if (!factor) return Response.json({ error: `La unidad ${body.unit} no es compatible con ${product.baseUnit}.` }, { status: 400 });
    const quantityBase = body.quantity * factor;
    const subtracts = ["salida", "prestamo", "baja"].includes(body.kind);
    const adds = ["ingreso", "devolucion"].includes(body.kind);
    if (subtracts && quantityBase > product.stockBase) return Response.json({ error: "Stock insuficiente para registrar esta salida." }, { status: 409 });
    if (!subtracts && !adds) return Response.json({ error: "Tipo de movimiento no válido." }, { status: 400 });

    const delta = subtracts ? -quantityBase : quantityBase;
    await db.batch([
      db.insert(movements).values({ productId: product.id, employeeId: body.employeeId ?? null, kind: body.kind!, quantityBase, enteredQuantity: body.quantity!, enteredUnit: body.unit!, condition: body.condition ?? "bueno", loanMovementId: body.loanMovementId ?? null, note: body.note?.trim() ?? "" }),
      db.update(products).set({ stockBase: sql`${products.stockBase} + ${delta}` }).where(eq(products.id, product.id)),
    ]);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo registrar el movimiento." }, { status: 500 });
  }
}
