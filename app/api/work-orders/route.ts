import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { employees, workOrders } from "../../../db/schema";

type WorkPayload={code?:string;title?:string;client?:string;quantity?:number;model?:string;responsibleEmployeeId?:number;area?:string;progress?:number;startDate?:string;dueDate?:string;notes?:string};

function normalize(body:WorkPayload){return {code:body.code?.trim().toUpperCase()??"",title:body.title?.trim()??"",client:body.client?.trim()??"",quantity:Math.round(Number(body.quantity)),model:body.model?.trim()??"",responsibleEmployeeId:Number(body.responsibleEmployeeId),area:body.area?.trim()??"",progress:Math.round(Number(body.progress??0)),startDate:body.startDate?.trim()??"",dueDate:body.dueDate?.trim()??"",notes:body.notes?.trim()??""}}

function valid(data:ReturnType<typeof normalize>){return data.code&&data.title&&data.client&&data.quantity>0&&data.responsibleEmployeeId&&data.area&&data.progress>=0&&data.progress<=100&&/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)&&/^\d{4}-\d{2}-\d{2}$/.test(data.dueDate)}

export async function POST(request:Request){
  try{
    await ensureSchema();const data=normalize(await request.json());
    if(!valid(data))return Response.json({error:"Completa O.P., cliente, mueble, cantidad, responsable y fechas."},{status:400});
    const db=getDb();const person=await db.select().from(employees).where(eq(employees.id,data.responsibleEmployeeId)).limit(1);
    if(!person.length||person[0].status!=="activo"||person[0].role!=="trabajador")return Response.json({error:"Selecciona un trabajador de producción activo."},{status:400});
    const status=data.progress>=100?"completado":data.progress===0?"pendiente":"en_proceso";
    const [workOrder]=await db.insert(workOrders).values({...data,status}).returning();
    return Response.json({workOrder},{status:201});
  }catch(error){const message=error instanceof Error?error.message:"No se pudo registrar el trabajo.";return Response.json({error:/unique/i.test(message)?"Ya existe una orden con ese número de O.P.":message},{status:500})}
}

export async function PATCH(request: Request) {
  try {
    await ensureSchema();
    const body = await request.json() as WorkPayload & { id?: number };
    const progress = Math.round(Number(body.progress));
    if (!body.id || !Number.isFinite(progress) || progress < 0 || progress > 100) {
      return Response.json({ error: "El avance debe estar entre 0 y 100%." }, { status: 400 });
    }
    const status = progress >= 100 ? "completado" : progress === 0 ? "pendiente" : "en_proceso";
    const details=body.code?normalize(body):null;
    if(details&&!valid(details))return Response.json({error:"Completa todos los datos del trabajo."},{status:400});
    if(details){const person=await getDb().select().from(employees).where(eq(employees.id,details.responsibleEmployeeId)).limit(1);if(!person.length||person[0].status!=="activo"||person[0].role!=="trabajador")return Response.json({error:"Selecciona un trabajador de producción activo."},{status:400});}
    await getDb().update(workOrders).set(details?{...details,status,updatedAt:sql`CURRENT_TIMESTAMP`}:{ progress, status, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(workOrders.id, body.id));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo actualizar el trabajo." }, { status: 500 });
  }
}
