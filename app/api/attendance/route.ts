import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { attendance } from "../../../db/schema";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as { employeeId?: number; eventType?: string; source?: string };
    if (!body.employeeId || !["ingreso", "salida"].includes(body.eventType ?? "")) return Response.json({ error: "Selecciona una persona y el tipo de marcación." }, { status: 400 });
    const db = getDb();
    await db.insert(attendance).values({ employeeId: body.employeeId, eventType: body.eventType!, source: body.source ?? "manual" });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo registrar la asistencia." }, { status: 500 });
  }
}
