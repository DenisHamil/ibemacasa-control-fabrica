import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { eq } from "drizzle-orm";
import { products } from "../../../db/schema";

const allowedBaseUnits = new Set(["pza", "g", "ml", "l", "m"]);

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as {
      code?: string; name?: string; section?: string; line?: string; trackingType?: string;
      baseUnit?: string; stockBase?: number; minStockBase?: number;
      purchasePresentation?: string; presentationFactorBase?: number; location?: string;
    };
    const code = body.code?.trim().toUpperCase() ?? "";
    const name = body.name?.trim() ?? "";
    const section = body.section?.trim() ?? "";
    const line = body.line?.trim() || "Sin línea";
    const baseUnit = body.baseUnit ?? "";
    const trackingType = body.trackingType ?? "";
    const purchasePresentation = body.purchasePresentation?.trim() ?? "";
    const factor = Number(body.presentationFactorBase);
    const stock = Number(body.stockBase ?? 0);
    const minimum = Number(body.minStockBase ?? 0);

    if (!code || !name || !section || !purchasePresentation || !allowedBaseUnits.has(baseUnit)) {
      return Response.json({ error: "Completa código, nombre, sección, presentación y unidad base." }, { status: 400 });
    }
    if (!["consumible", "retornable"].includes(trackingType) || !Number.isFinite(factor) || factor <= 0 || stock < 0 || minimum < 0) {
      return Response.json({ error: "Revisa el tipo de control y las cantidades ingresadas." }, { status: 400 });
    }
    const db = getDb();
    const [product] = await db.insert(products).values({
      code, name, category: section, section, line, trackingType, baseUnit, stockBase: stock,
      minStockBase: minimum, purchasePresentation,
      presentationFactorBase: factor, location: body.location?.trim() || "Sin asignar",
    }).returning();
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el producto.";
    const friendly = message.includes("UNIQUE") || message.includes("unique") ? "Ya existe un producto con ese código." : message;
    return Response.json({ error: friendly }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as {
      id?: number; code?: string; name?: string; section?: string; line?: string; trackingType?: string;
      baseUnit?: string; minStockBase?: number; purchasePresentation?: string;
      presentationFactorBase?: number; location?: string;
    };
    const id = Number(body.id);
    const code = body.code?.trim().toUpperCase() ?? "";
    const name = body.name?.trim() ?? "";
    const section = body.section?.trim() ?? "";
    const line = body.line?.trim() || "Sin línea";
    const baseUnit = body.baseUnit ?? "";
    const trackingType = body.trackingType ?? "";
    const purchasePresentation = body.purchasePresentation?.trim() ?? "";
    const factor = Number(body.presentationFactorBase);
    const minimum = Number(body.minStockBase ?? 0);
    if (!id || !code || !name || !section || !purchasePresentation || !allowedBaseUnits.has(baseUnit)) {
      return Response.json({ error: "Completa código, nombre, sección, presentación y unidad." }, { status: 400 });
    }
    if (!['consumible', 'retornable'].includes(trackingType) || !Number.isFinite(factor) || factor <= 0 || minimum < 0) {
      return Response.json({ error: "Revisa el tipo de producto y sus cantidades." }, { status: 400 });
    }
    const db = getDb();
    const [product] = await db.update(products).set({
      code, name, category: section, section, line, trackingType, baseUnit,
      minStockBase: minimum, purchasePresentation, presentationFactorBase: factor,
      location: body.location?.trim() || "Sin asignar",
    }).where(eq(products.id, id)).returning();
    if (!product) return Response.json({ error: "Producto no encontrado." }, { status: 404 });
    return Response.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el producto.";
    const friendly = message.includes("UNIQUE") || message.includes("unique") ? "Ya existe otro producto con ese código." : message;
    return Response.json({ error: friendly }, { status: 500 });
  }
}
