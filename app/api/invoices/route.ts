import { inArray, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { movements, products, purchaseItems, purchases } from "../../../db/schema";

const factors: Record<string, Record<string, number>> = {
  g: { g: 1, kg: 1000 },
  ml: { ml: 1, l: 1000 },
  l: { l: 1, ml: 0.001 },
  m: { m: 1, cm: 0.01 },
  pza: { pza: 1, unidad: 1, par: 2 },
};

type InvoiceItem = { productId?: number; quantity?: number; unit?: string; unitPriceBs?: number };

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as { entryNumber?: string; supplier?: string; invoice?: string; purchaseDate?: string; items?: InvoiceItem[] };
    const entryNumber = body.entryNumber?.trim() ?? "";
    const supplier = body.supplier?.trim() ?? "";
    const invoice = body.invoice?.trim() ?? "";
    const purchaseDate = body.purchaseDate?.trim() ?? "";
    const items = body.items ?? [];
    if (!entryNumber || !supplier || !invoice || !/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate) || !items.length || items.length > 50) {
      return Response.json({ error: "Completa número de ingreso, proveedor, fecha y al menos un producto." }, { status: 400 });
    }
    const ids = [...new Set(items.map((item) => Number(item.productId)).filter(Boolean))];
    const db = getDb();
    const catalog = await db.select().from(products).where(inArray(products.id, ids));
    const normalized = items.map((item) => {
      const product = catalog.find((entry) => entry.id === Number(item.productId));
      const quantity = Number(item.quantity);
      const unitPriceBs = Number(item.unitPriceBs);
      const unit = item.unit ?? "";
      if (!product || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPriceBs) || unitPriceBs < 0) throw new Error("Revisa los productos, cantidades y precios de la factura.");
      const factor = unit === "presentacion" ? product.presentationFactorBase : factors[product.baseUnit]?.[unit];
      if (!factor) throw new Error(`La unidad ${unit} no corresponde a ${product.name}.`);
      return { product, quantity, unit, unitPriceBs, quantityBase: quantity * factor, subtotalBs: quantity * unitPriceBs };
    });
    const totalBs = normalized.reduce((sum, item) => sum + item.subtotalBs, 0);
    const [purchase] = await db.insert(purchases).values({ entryNumber, supplier, invoice, purchaseDate, totalBs, status: "recibido" }).returning({ id: purchases.id });
    const operations = normalized.flatMap((item) => [
      db.insert(purchaseItems).values({ purchaseId: purchase.id, productId: item.product.id, quantityBase: item.quantityBase, enteredQuantity: item.quantity, enteredUnit: item.unit, unitPriceBs: item.unitPriceBs, subtotalBs: item.subtotalBs }),
      db.insert(movements).values({ productId: item.product.id, employeeId: null, kind: "ingreso", quantityBase: item.quantityBase, enteredQuantity: item.quantity, enteredUnit: item.unit, note: `Ingreso ${entryNumber} · Factura ${invoice} · ${supplier}` }),
      db.update(products).set({ stockBase: sql`${products.stockBase} + ${item.quantityBase}` }).where(inArray(products.id, [item.product.id])),
    ]);
    await db.batch(operations);
    return Response.json({ ok: true, purchaseId: purchase.id, entryNumber, totalBs }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo registrar la factura." }, { status: 500 });
  }
}
