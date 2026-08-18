import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { ensureSchema } from "../../../db/ensure";
import { employeeStatusHistory, employees } from "../../../db/schema";

export async function POST(request: Request) {
  try {
    await ensureSchema();
    const body=await request.json() as Record<string,unknown>;
    const value=(key:string)=>typeof body[key]==="string"?(body[key] as string).trim():"";
    const name=value("name"); const ci=value("ci"); const area=value("area"); const phone=value("phone"); const sex=value("sex");
    const birthDate=value("birthDate"); const birthPlace=value("birthPlace"); const occupation=value("occupation"); const maritalStatus=value("maritalStatus");
    const address=value("address"); const personalReference=value("personalReference"); const otherReferences=value("otherReferences"); const transport=value("transport");
    const academicBackground=value("academicBackground"); const workExperience=value("workExperience"); const healthBackground=value("healthBackground");
    const registrationPlace=value("registrationPlace")||"Cochabamba"; const hireDate=value("hireDate");
    const children=Math.max(0,Math.round(Number(body.children)||0)); const dailyWageBs=Math.max(0,Number(body.dailyWageBs)||0);
    if(!name||!ci||!area||!sex||!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)||!/^\d{4}-\d{2}-\d{2}$/.test(hireDate))return Response.json({error:"Completa nombre, C.I., sexo, fecha de nacimiento, área y fecha de ingreso."},{status:400});
    const db=getDb();
    const [employee]=await db.insert(employees).values({name,ci,area,phone,sex,birthDate,birthPlace,occupation,maritalStatus,children,address,personalReference,otherReferences,transport,academicBackground,workExperience,healthBackground,dailyWageBs,registrationPlace,hireDate,role:"trabajador",status:"activo"}).returning();
    await db.insert(employeeStatusHistory).values({employeeId:employee.id,eventType:"alta",effectiveDate:hireDate,note:"Registro inicial"});
    return Response.json({employee},{status:201});
  } catch(error) {
    const message=error instanceof Error?error.message:"No se pudo registrar al trabajador.";
    return Response.json({error:/unique/i.test(message)?"Ya existe un trabajador con esa C.I.":message},{status:500});
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureSchema();
    const body=await request.json() as {id?:number;status?:string;effectiveDate?:string;note?:string};
    const id=Number(body.id); const status=body.status??""; const effectiveDate=body.effectiveDate?.trim()??"";
    if(!id||!["activo","inactivo"].includes(status)||!/^\d{4}-\d{2}-\d{2}$/.test(effectiveDate))return Response.json({error:"Revisa el trabajador, estado y fecha."},{status:400});
    const db=getDb(); const current=await db.select().from(employees).where(eq(employees.id,id)).limit(1);
    if(!current.length)return Response.json({error:"Trabajador no encontrado."},{status:404});
    const [employee]=await db.update(employees).set({status,...(status==="activo"?{hireDate:effectiveDate}:{})}).where(eq(employees.id,id)).returning();
    await db.insert(employeeStatusHistory).values({employeeId:id,eventType:status==="activo"?"recontratacion":"baja",effectiveDate,note:body.note?.trim()??""});
    return Response.json({employee});
  } catch(error) {
    return Response.json({error:error instanceof Error?error.message:"No se pudo cambiar el estado."},{status:500});
  }
}
