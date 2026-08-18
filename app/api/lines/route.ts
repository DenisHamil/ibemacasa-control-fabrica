import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { productLines } from "../../../db/schema";

export async function GET() {
  await ensureSchema();
  return Response.json(await getDb().select().from(productLines).where(eq(productLines.active, true)).orderBy(asc(productLines.name)));
}

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as { name?: string; description?: string };
    const name = body.name?.trim() ?? "";
    if (!name) return Response.json({ error: "Escribe el nombre de la línea." }, { status: 400 });
    const [line] = await getDb().insert(productLines).values({ name, description: body.description?.trim() ?? "" }).returning();
    return Response.json({ line }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo registrar la línea.";
    return Response.json({ error: /unique/i.test(message) ? "Ya existe una línea con ese nombre." : message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as { id?: number; name?: string; description?: string };
    const id = Number(body.id); const name = body.name?.trim() ?? "";
    if (!id || !name) return Response.json({ error: "Revisa la línea seleccionada." }, { status: 400 });
    const [line] = await getDb().update(productLines).set({ name, description: body.description?.trim() ?? "" }).where(eq(productLines.id, id)).returning();
    return line ? Response.json({ line }) : Response.json({ error: "Línea no encontrada." }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la línea.";
    return Response.json({ error: /unique/i.test(message) ? "Ya existe una línea con ese nombre." : message }, { status: 500 });
  }
}
