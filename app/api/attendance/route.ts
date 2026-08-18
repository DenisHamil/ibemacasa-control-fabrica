import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { eq } from "drizzle-orm";
import { attendance, employees } from "../../../db/schema";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as { employeeId?: number; eventType?: string; source?: string; occurredAt?: string };
    if (!body.employeeId || !["ingreso", "salida"].includes(body.eventType ?? "")) return Response.json({ error: "Selecciona una persona y el tipo de marcación." }, { status: 400 });
    const occurredAt = body.occurredAt?.trim().replace("T", " ");
    if (occurredAt && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(occurredAt)) {
      return Response.json({ error: "La fecha u hora ingresada no es válida." }, { status: 400 });
    }
    const db = getDb();
    const [employee]=await db.select().from(employees).where(eq(employees.id,body.employeeId)).limit(1);
    if(!employee||employee.status!=="activo")return Response.json({error:"El trabajador no está activo."},{status:400});
    await db.insert(attendance).values({ employeeId: body.employeeId, eventType: body.eventType!, source: body.source ?? "manual", ...(occurredAt ? { occurredAt } : {}) });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo registrar la asistencia." }, { status: 500 });
  }
}
