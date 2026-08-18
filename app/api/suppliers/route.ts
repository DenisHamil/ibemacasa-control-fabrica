import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { suppliers } from "../../../db/schema";

function values(body: Record<string, unknown>) {
  return {
    name: String(body.name ?? "").trim(),
    nit: String(body.nit ?? "").trim(),
    address: String(body.address ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    contact: String(body.contact ?? "").trim(),
    email: String(body.email ?? "").trim(),
    notes: String(body.notes ?? "").trim(),
  };
}

export async function GET() {
  await ensureSchema();
  return Response.json(await getDb().select().from(suppliers).where(eq(suppliers.active, true)).orderBy(asc(suppliers.name)));
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const data = values(await request.json());
    if (!data.name) return Response.json({ error: "Escribe el nombre del proveedor." }, { status: 400 });
    const [supplier] = await getDb().insert(suppliers).values(data).returning();
    return Response.json({ supplier }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo registrar el proveedor.";
    return Response.json({ error: /unique/i.test(message) ? "Ya existe un proveedor con ese nombre." : message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as Record<string, unknown>;
    const id = Number(body.id);
    const data = values(body);
    if (!id || !data.name) return Response.json({ error: "Revisa el proveedor seleccionado." }, { status: 400 });
    const [supplier] = await getDb().update(suppliers).set(data).where(eq(suppliers.id, id)).returning();
    return supplier ? Response.json({ supplier }) : Response.json({ error: "Proveedor no encontrado." }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el proveedor.";
    return Response.json({ error: /unique/i.test(message) ? "Ya existe un proveedor con ese nombre." : message }, { status: 500 });
  }
}
