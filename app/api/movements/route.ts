import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { movements, products } from "../../../db/schema";

const standardFactors: Record<string, Record<string, number>> = {
  g: { g: 1, kg: 1000 },
  ml: { ml: 1, l: 1000 },
  m: { m: 1, cm: 0.01 },
  pza: { pza: 1, par: 2 },
};

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as { productId?: number; employeeId?: number | null; kind?: string; quantity?: number; unit?: string; condition?: string; note?: string };
    if (!body.productId || !body.kind || !body.quantity || body.quantity <= 0 || !body.unit) {
      return Response.json({ error: "Completa producto, movimiento, cantidad y unidad." }, { status: 400 });
    }
    const db = getDb();
    const [product] = await db.select().from(products).where(eq(products.id, body.productId)).limit(1);
    if (!product) return Response.json({ error: "Producto no encontrado." }, { status: 404 });

    const factor = body.unit === "presentacion" ? product.presentationFactorBase : standardFactors[product.baseUnit]?.[body.unit];
    if (!factor) return Response.json({ error: `La unidad ${body.unit} no es compatible con ${product.baseUnit}.` }, { status: 400 });
    const quantityBase = body.quantity * factor;
    const subtracts = ["salida", "prestamo", "baja"].includes(body.kind);
    const adds = ["ingreso", "devolucion"].includes(body.kind);
    if (subtracts && quantityBase > product.stockBase) return Response.json({ error: "Stock insuficiente para registrar esta salida." }, { status: 409 });
    if (!subtracts && !adds) return Response.json({ error: "Tipo de movimiento no válido." }, { status: 400 });

    const delta = subtracts ? -quantityBase : quantityBase;
    await db.batch([
      db.insert(movements).values({ productId: product.id, employeeId: body.employeeId ?? null, kind: body.kind!, quantityBase, enteredQuantity: body.quantity!, enteredUnit: body.unit!, condition: body.condition ?? "bueno", note: body.note?.trim() ?? "" }),
      db.update(products).set({ stockBase: sql`${products.stockBase} + ${delta}` }).where(eq(products.id, product.id)),
    ]);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo registrar el movimiento." }, { status: 500 });
  }
}
