"use client";
/* eslint-disable jsx-a11y/no-autofocus */

import { FormEvent, useEffect, useMemo, useState } from "react";

type Product = { id:number; code:string; name:string; section:string; line?:string; trackingType:string; baseUnit:string; stockBase:number; minStockBase:number; purchasePresentation:string; presentationFactorBase:number; location:string };
type Employee = { id:number; name:string; ci:string; area:string; role:string; phone:string; hireDate:string; status:string; sex?:string; birthDate?:string; birthPlace?:string; occupation?:string; maritalStatus?:string; children?:number; address?:string; personalReference?:string; otherReferences?:string; transport?:string; academicBackground?:string; workExperience?:string; healthBackground?:string; dailyWageBs?:number; registrationPlace?:string };
type Movement = { id:number; productId:number; employeeId:number|null; loanMovementId:number|null; kind:string; quantityBase:number; enteredQuantity:number; enteredUnit:string; condition:string; note:string; createdAt:string; productName:string; trackingType:string; employeeName:string | null; returned?:boolean };
type Attendance = { id:number; employeeId:number; employeeName:string; eventType:string; source:string; occurredAt:string };
type Purchase = { id:number; entryNumber?:string; supplier:string; invoice:string; totalBs:number; status:string; purchaseDate:string };
type Supplier = { id:number; name:string; nit:string; address:string; phone:string; contact:string; email:string; notes:string; active:boolean };
type ProductLine = { id:number; name:string; description:string; active:boolean };
type InvoicePayload = { entryNumber:string; supplier:string; invoice:string; purchaseDate:string; items:{productId:number;quantity:number;unit:string;unitPriceBs:number}[] };
type ProductPayload = { code:string; name:string; section:string; line:string; trackingType:string; baseUnit:string; purchasePresentation:string; presentationFactorBase:number; stockBase:number; minStockBase:number; location:string };
type WorkOrder = { id:number; code:string; title:string; client:string; quantity?:number; model?:string; responsibleEmployeeId:number; responsibleName:string; area:string; progress:number; status:string; startDate?:string; dueDate:string; notes?:string; updatedAt:string };
type WorkPayload = {code:string;title:string;client:string;quantity:number;model:string;responsibleEmployeeId:number;area:string;progress:number;startDate:string;dueDate:string;notes:string};
type DashboardData = { products:Product[]; employees:Employee[]; movements:Movement[]; attendance:Attendance[]; purchases:Purchase[]; workOrders:WorkOrder[]; suppliers:Supplier[]; lines:ProductLine[] };
type View = "resultados" | "inventario" | "kardex" | "herramientas" | "salidas" | "catalogos" | "reportes" | "personal" | "asistencia" | "planificacion" | "compras";

const demoData: DashboardData = {
  products: [
    { id:1, code:"ADH-001", name:"Carpicola industrial", section:"Carpintería", trackingType:"consumible", baseUnit:"g", stockBase:4850, minStockBase:2000, purchasePresentation:"Galón 3,5 L", presentationFactorBase:3500, location:"A-01" },
    { id:2, code:"BAR-018", name:"Catalizador PU Sayerlack", section:"Barniz", trackingType:"consumible", baseUnit:"l", stockBase:7.2, minStockBase:3.6, purchasePresentation:"Lata 18 L", presentationFactorBase:18, location:"A-03" },
    { id:3, code:"FER-055", name:"Clavo 2 pulgadas", section:"Carpintería", trackingType:"consumible", baseUnit:"g", stockBase:12400, minStockBase:5000, purchasePresentation:"Bolsa 25 kg", presentationFactorBase:25000, location:"B-02" },
    { id:4, code:"TAP-010", name:"Cuero sintético negro", section:"Tapicería", trackingType:"consumible", baseUnit:"m", stockBase:22.5, minStockBase:8, purchasePresentation:"Rollo 30 m", presentationFactorBase:30, location:"C-01" },
    { id:5, code:"HER-077", name:"Lijadora eléctrica Rainani", section:"Carpintería", trackingType:"retornable", baseUnit:"pza", stockBase:3, minStockBase:1, purchasePresentation:"Pieza", presentationFactorBase:1, location:"H-04" },
    { id:6, code:"EPP-011", name:"Máscara antigases completa", section:"Acabados", trackingType:"retornable", baseUnit:"pza", stockBase:6, minStockBase:2, purchasePresentation:"Pieza", presentationFactorBase:1, location:"E-02" },
    { id:7, code:"COR-004", name:"Cuerda de cáñamo 8 mm", section:"Tapicería", trackingType:"consumible", baseUnit:"m", stockBase:41, minStockBase:12, purchasePresentation:"Rollo 100 m", presentationFactorBase:100, location:"C-03" },
    { id:8, code:"ACC-022", name:"Bisagra cierre suave", section:"Carpintería", trackingType:"consumible", baseUnit:"pza", stockBase:168, minStockBase:40, purchasePresentation:"Caja 100 unidades", presentationFactorBase:100, location:"B-05" },
  ],
  employees: [
    { id:1, name:"Yasmani Herrera", ci:"8012456", area:"Carpintería", role:"trabajador", phone:"70700001", hireDate:"2025-10-01", status:"activo" },
    { id:2, name:"Óscar Vargas", ci:"6532109", area:"Barniz", role:"trabajador", phone:"70700002", hireDate:"2025-09-12", status:"activo" },
    { id:3, name:"Brayan Vargas", ci:"9045821", area:"Tapicería", role:"trabajador", phone:"70700003", hireDate:"2026-01-08", status:"activo" },
    { id:4, name:"Mariela Flores", ci:"7854132", area:"Almacén", role:"almacen", phone:"70700004", hireDate:"2024-06-03", status:"activo" },
  ],
  movements: [
    { id:3, productId:3, employeeId:3, loanMovementId:null, kind:"salida", quantityBase:1200, enteredQuantity:1.2, enteredUnit:"kg", condition:"bueno", note:"Armado de bastidores", createdAt:"2026-08-17 09:42", productName:"Clavo 2 pulgadas", trackingType:"consumible", employeeName:"Brayan Vargas" },
    { id:2, productId:5, employeeId:1, loanMovementId:null, kind:"prestamo", quantityBase:1, enteredQuantity:1, enteredUnit:"pza", condition:"bueno", note:"", createdAt:"2026-08-17 08:31", productName:"Lijadora eléctrica Rainani", trackingType:"retornable", employeeName:"Yasmani Herrera", returned:false },
    { id:1, productId:1, employeeId:1, loanMovementId:null, kind:"salida", quantityBase:650, enteredQuantity:650, enteredUnit:"g", condition:"bueno", note:"Orden dormitorio Andino", createdAt:"2026-08-16 15:18", productName:"Carpicola industrial", trackingType:"consumible", employeeName:"Yasmani Herrera" },
  ],
  attendance: [],
  purchases: [
    { id:1, supplier:"Multibarniz", invoice:"F-181", totalBs:2000, status:"recibido", purchaseDate:"2026-08-14" },
    { id:2, supplier:"Ferretería Central", invoice:"F-2048", totalBs:846.5, status:"pendiente_recepcion", purchaseDate:"2026-08-16" },
  ],
  workOrders: [
    { id:1, code:"OT-0261", title:"Dormitorio Andino", client:"Pedido showroom",quantity:1,model:"Andino", responsibleEmployeeId:1, responsibleName:"Yasmani Herrera", area:"Carpintería", progress:68, status:"en_proceso",startDate:"2026-08-10", dueDate:"2026-08-24",notes:"", updatedAt:"2026-08-17 09:20" },
    { id:2, code:"OT-0262", title:"Juego de comedor Roble", client:"Familia Vargas",quantity:1,model:"Roble", responsibleEmployeeId:3, responsibleName:"Brayan Vargas", area:"Carpintería", progress:35, status:"en_proceso",startDate:"2026-08-11", dueDate:"2026-08-29",notes:"", updatedAt:"2026-08-17 08:40" },
    { id:3, code:"OT-0257", title:"Sillón tres cuerpos", client:"Pedido tienda",quantity:1,model:"Premium", responsibleEmployeeId:2, responsibleName:"Óscar Vargas", area:"Barniz", progress:100, status:"completado",startDate:"2026-08-07", dueDate:"2026-08-18",notes:"Concluido", updatedAt:"2026-08-16 16:00" },
  ],
  suppliers: [
    {id:1,name:"Multibarniz",nit:"",address:"Cochabamba",phone:"",contact:"",email:"",notes:"",active:true},
    {id:2,name:"Ferretería Central",nit:"",address:"Cochabamba",phone:"",contact:"",email:"",notes:"",active:true},
  ],
  lines: [
    {id:1,name:"Adhesivos",description:"Colas y pegamentos",active:true},
    {id:2,name:"Ferretería",description:"Clavos, tornillos y accesorios",active:true},
    {id:3,name:"Barnices",description:"Barnices, pinturas y solventes",active:true},
  ],
};

const nav: {id:View; label:string; icon:string; roles:string[]}[] = [
  { id:"resultados", label:"Resultados", icon:"▦", roles:["gerencia"] },
  { id:"inventario", label:"Inventario", icon:"□", roles:["almacen"] },
  { id:"kardex", label:"Kardex", icon:"▤", roles:["almacen"] },
  { id:"herramientas", label:"Préstamo de herramientas", icon:"⇄", roles:["almacen"] },
  { id:"salidas", label:"Salidas de producción", icon:"↗", roles:["almacen"] },
  { id:"catalogos", label:"Catálogos de almacén", icon:"＋", roles:["almacen"] },
  { id:"reportes", label:"Reportes", icon:"▥", roles:["almacen"] },
  { id:"planificacion", label:"Planificación", icon:"%", roles:["planificacion"] },
  { id:"personal", label:"Personal", icon:"○", roles:["planificacion"] },
  { id:"asistencia", label:"Asistencia", icon:"◷", roles:["almacen","planificacion"] },
  { id:"compras", label:"Caja y compras", icon:"Bs", roles:["caja"] },
];

function fmt(value:number, unit:string) {
  if (unit === "g" && value >= 1000) return `${(value/1000).toLocaleString("es-BO",{maximumFractionDigits:2})} kg`;
  if (unit === "ml" && value >= 1000) return `${(value/1000).toLocaleString("es-BO",{maximumFractionDigits:2})} L`;
  const label = unit === "pza" ? (value === 1 ? "unidad" : "unidades") : unit;
  return `${value.toLocaleString("es-BO",{maximumFractionDigits:2})} ${label}`;
}

function niceDate(raw:string) {
  const date = new Date(raw.replace(" ","T") + (raw.includes("T") ? "" : ""));
  if (Number.isNaN(date.getTime())) return raw;
  const months=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${String(date.getDate()).padStart(2,"0")} ${months[date.getMonth()]} · ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
}

function dateOnly(raw:string) {
  const [year,month,day]=raw.slice(0,10).split("-");
  return `${day}/${month}/${year}`;
}

export default function IbemaApp() {
  const [data,setData] = useState<DashboardData>(demoData);
  const [view,setView] = useState<View>("inventario");
  const [role,setRole] = useState("almacen");
  const [searchByView,setSearchByView] = useState<Partial<Record<View,string>>>({});
  const [workerFilter,setWorkerFilter] = useState("todos");
  const [movementMode,setMovementMode] = useState<"prestamo"|"salida"|null>(null);
  const [returnLoan,setReturnLoan] = useState<Movement|null>(null);
  const [invoiceOpen,setInvoiceOpen] = useState(false);
  const [productOpen,setProductOpen] = useState(false);
  const [editingProduct,setEditingProduct] = useState<Product|null>(null);
  const [kardexProduct,setKardexProduct] = useState("todos");
  const [attendanceOpen,setAttendanceOpen] = useState(false);
  const [attendanceDate,setAttendanceDate] = useState("");
  const [attendanceTime,setAttendanceTime] = useState("");
  const [supplierOpen,setSupplierOpen] = useState(false);
  const [lineOpen,setLineOpen] = useState(false);
  const [editingSupplier,setEditingSupplier] = useState<Supplier|null>(null);
  const [editingLine,setEditingLine] = useState<ProductLine|null>(null);
  const [employeeOpen,setEmployeeOpen] = useState(false);
  const [employeeStatus,setEmployeeStatus] = useState<Employee|null>(null);
  const [viewingEmployee,setViewingEmployee] = useState<Employee|null>(null);
  const [workOpen,setWorkOpen] = useState(false);
  const [editingWork,setEditingWork] = useState<WorkOrder|null>(null);
  const [toast,setToast] = useState("");
  const [loading,setLoading] = useState(false);

  async function refresh() {
    try {
      const response = await fetch("/api/dashboard",{cache:"no-store"});
      if (response.ok) setData(await response.json());
    } catch { /* El modo demostración sigue disponible sin conexión. */ }
  }
  useEffect(() => { void fetch("/api/dashboard",{cache:"no-store"}).then(response=>response.ok?response.json():null).then(result=>{if(result)setData(result)}).catch(()=>{}); }, []);
  useEffect(() => { if (toast) { const id=setTimeout(()=>setToast(""),3200); return ()=>clearTimeout(id); } },[toast]);
  useEffect(() => { if(attendanceOpen){const id=setTimeout(()=>{const now=new Date();setAttendanceDate(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`);setAttendanceTime(`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`)},0);return()=>clearTimeout(id)} },[attendanceOpen]);

  const search=searchByView[view]??"";
  const searchPlaceholders:Record<View,string>={resultados:"Buscar trabajo o trabajador",inventario:"Buscar producto en inventario",kardex:"Buscar en el historial",herramientas:"Buscar herramienta o trabajador",salidas:"Buscar material o trabajador",catalogos:"Buscar proveedor, línea o producto",reportes:"Buscar en reportes",personal:"Buscar trabajador",asistencia:"Buscar trabajador",planificacion:"Buscar trabajo o responsable",compras:"Buscar proveedor o factura"};
  const visibleNav = nav.filter(item=>item.roles.includes(role));
  const filteredProducts = data.products.filter(p=>`${p.name} ${p.code} ${p.section}`.toLowerCase().includes(search.toLowerCase()));
  const filteredSuppliers=data.suppliers.filter(item=>`${item.name} ${item.nit} ${item.address} ${item.phone} ${item.contact}`.toLowerCase().includes(search.toLowerCase()));
  const filteredLines=data.lines.filter(item=>`${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
  const workers=data.employees.filter(employee=>employee.role==="trabajador");
  const filteredEmployees=workers.filter(item=>`${item.name} ${item.ci} ${item.area} ${item.occupation||""} ${item.status}`.toLowerCase().includes(search.toLowerCase()));
  const filteredWorkOrders=data.workOrders.filter(item=>`${item.code} ${item.title} ${item.client} ${item.model||""} ${item.responsibleName} ${item.area} ${item.notes||""}`.toLowerCase().includes(search.toLowerCase()));
  const visibleMovements = useMemo(()=>data.movements.filter(m=>`${m.productName} ${m.employeeName ?? ""}`.toLowerCase().includes(search.toLowerCase())),[data.movements,search]);
  const toolMovements = visibleMovements.filter(m=>m.trackingType==="retornable"&&["prestamo","devolucion","baja"].includes(m.kind)&&(workerFilter==="todos"||String(m.employeeId)===workerFilter));
  const productionOutputs = visibleMovements.filter(m=>m.trackingType==="consumible"&&m.kind==="salida"&&(workerFilter==="todos"||String(m.employeeId)===workerFilter));
  const kardexRows = useMemo(()=>{
    const balances=new Map(data.products.map(product=>[product.id,product.stockBase]));
    return data.movements.map(movement=>{
      const balanceAfter=balances.get(movement.productId)??0;
      const adds=["ingreso","devolucion"].includes(movement.kind);
      const subtracts=["salida","prestamo","baja"].includes(movement.kind);
      balances.set(movement.productId,balanceAfter-(adds?movement.quantityBase:subtracts?-movement.quantityBase:0));
      return {...movement,balanceAfter};
    }).filter(movement=>(kardexProduct==="todos"||String(movement.productId)===kardexProduct)&&`${movement.productName} ${movement.employeeName??""} ${movement.note}`.toLowerCase().includes(search.toLowerCase()));
  },[data.products,data.movements,kardexProduct,search]);
  const averageProgress = data.workOrders.length ? Math.round(data.workOrders.reduce((sum,job)=>sum+job.progress,0)/data.workOrders.length) : 0;
  const activeEmployees=data.employees.filter(employee=>employee.status==="activo");
  const activeWorkers=workers.filter(employee=>employee.status==="activo");
  const latestAttendance = new Map<number,Attendance>();
  data.attendance.forEach(mark=>{ if(!latestAttendance.has(mark.employeeId)) latestAttendance.set(mark.employeeId,mark); });
  const workingNow = activeEmployees.filter(employee=>latestAttendance.get(employee.id)?.eventType==="ingreso");
  const attendanceRate = activeEmployees.length ? Math.round((new Set(data.attendance.filter(mark=>mark.eventType==="ingreso"&&activeEmployees.some(employee=>employee.id===mark.employeeId)).map(mark=>mark.employeeId)).size/activeEmployees.length)*100) : 0;

  async function submitMovement(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true);
    const fd=new FormData(event.currentTarget);
    const payload={ productId:Number(fd.get("productId")), employeeId:Number(fd.get("employeeId"))||null, kind:String(fd.get("kind")), quantity:Number(fd.get("quantity")), unit:String(fd.get("unit")), condition:String(fd.get("condition")), note:String(fd.get("note")) };
    try {
      const response=await fetch("/api/movements",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
      const result=await response.json(); if(!response.ok) throw new Error(result.error);
      await refresh(); setMovementMode(null); setToast(payload.kind==="prestamo"?"Préstamo registrado correctamente.":"Salida registrada y saldo actualizado.");
    } catch(error) { setToast(error instanceof Error?error.message:"No se pudo registrar."); }
    finally { setLoading(false); }
  }

  async function submitAttendance(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); const fd=new FormData(event.currentTarget);
    try {
      const response=await fetch("/api/attendance",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({employeeId:Number(fd.get("employeeId")),eventType:String(fd.get("eventType")),source:"manual",occurredAt:`${fd.get("date")} ${fd.get("time")}:00`})});
      const result=await response.json(); if(!response.ok) throw new Error(result.error);
      await refresh(); setAttendanceOpen(false); setToast("Marcación guardada correctamente.");
    } catch(error) { setToast(error instanceof Error?error.message:"No se pudo marcar."); }
    finally { setLoading(false); }
  }

  async function createProduct(payload:ProductPayload) {
    setLoading(true);
    try {
      const response=await fetch("/api/products",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
      const result=await response.json(); if(!response.ok) throw new Error(result.error);
      const product=result.product as Product;
      setData(current=>({...current,products:[...current.products,product]}));
      setToast("Producto creado. Ya está seleccionado en la factura.");
      return product;
    } catch(error) { setToast(error instanceof Error?error.message:"No se pudo crear el producto."); }
    finally { setLoading(false); }
    return null;
  }

  async function updateProduct(payload:ProductPayload) {
    if(!editingProduct)return null;
    setLoading(true);
    try {
      const response=await fetch("/api/products",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({...payload,id:editingProduct.id})});
      const result=await response.json(); if(!response.ok) throw new Error(result.error);
      const product=result.product as Product;
      setData(current=>({...current,products:current.products.map(item=>item.id===product.id?product:item)}));
      setEditingProduct(null); setToast("Cambios del producto guardados correctamente.");
      return product;
    } catch(error) { setToast(error instanceof Error?error.message:"No se pudo actualizar el producto."); }
    finally { setLoading(false); }
    return null;
  }

  async function submitInvoice(payload:InvoicePayload) {
    setLoading(true);
    try {
      const response=await fetch("/api/invoices",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
      const result=await response.json(); if(!response.ok) throw new Error(result.error);
      await refresh(); setInvoiceOpen(false); setToast(`Ingreso N.º ${result.entryNumber} guardado por Bs ${Number(result.totalBs).toLocaleString("es-BO",{minimumFractionDigits:2})}.`);
    } catch(error) { setToast(error instanceof Error?error.message:"No se pudo registrar la factura."); }
    finally { setLoading(false); }
  }

  async function submitReturn(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(!returnLoan)return; setLoading(true); const fd=new FormData(event.currentTarget);
    try {
      const response=await fetch("/api/movements",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({kind:"devolucion",loanMovementId:returnLoan.id,condition:String(fd.get("condition")),note:String(fd.get("note"))})});
      const result=await response.json(); if(!response.ok) throw new Error(result.error);
      await refresh(); setReturnLoan(null); setToast(`Devolución registrada a nombre de ${returnLoan.employeeName}.`);
    } catch(error) { setToast(error instanceof Error?error.message:"No se pudo registrar la devolución."); }
    finally { setLoading(false); }
  }

  async function updateProgress(id:number, progress:number) {
    if(role!=="planificacion") return;
    setLoading(true);
    try {
      const response=await fetch("/api/work-orders",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,progress})});
      const result=await response.json(); if(!response.ok) throw new Error(result.error);
      await refresh(); setToast(`Avance actualizado al ${progress}%.`);
    } catch(error) { setToast(error instanceof Error?error.message:"No se pudo actualizar el avance."); }
    finally { setLoading(false); }
  }

  async function saveSupplier(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); const fd=new FormData(event.currentTarget);
    const payload={id:editingSupplier?.id,name:String(fd.get("name")),nit:String(fd.get("nit")),address:String(fd.get("address")),phone:String(fd.get("phone")),contact:String(fd.get("contact")),email:String(fd.get("email")),notes:String(fd.get("notes"))};
    try {
      const response=await fetch("/api/suppliers",{method:editingSupplier?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
      const result=await response.json(); if(!response.ok)throw new Error(result.error);
      await refresh(); setSupplierOpen(false); setEditingSupplier(null); setToast(editingSupplier?"Proveedor actualizado.":"Proveedor registrado correctamente.");
    } catch(error){setToast(error instanceof Error?error.message:"No se pudo guardar el proveedor.");} finally{setLoading(false);}
  }

  async function saveLine(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); const fd=new FormData(event.currentTarget);
    const payload={id:editingLine?.id,name:String(fd.get("name")),description:String(fd.get("description"))};
    try {
      const response=await fetch("/api/lines",{method:editingLine?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
      const result=await response.json(); if(!response.ok)throw new Error(result.error);
      await refresh(); setLineOpen(false); setEditingLine(null); setToast(editingLine?"Línea actualizada.":"Línea registrada correctamente.");
    } catch(error){setToast(error instanceof Error?error.message:"No se pudo guardar la línea.");} finally{setLoading(false);}
  }

  async function saveEmployee(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setLoading(true);const fd=new FormData(event.currentTarget);
    try{const response=await fetch("/api/employees",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(fd.entries()))});const result=await response.json();if(!response.ok)throw new Error(result.error);await refresh();setEmployeeOpen(false);setToast("Ficha personal guardada; el trabajador ya está disponible también para Almacén.");}catch(error){setToast(error instanceof Error?error.message:"No se pudo registrar al trabajador.");}finally{setLoading(false)}
  }

  async function changeEmployeeStatus(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!employeeStatus)return;setLoading(true);const fd=new FormData(event.currentTarget);const nextStatus=employeeStatus.status==="activo"?"inactivo":"activo";
    try{const response=await fetch("/api/employees",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id:employeeStatus.id,status:nextStatus,effectiveDate:String(fd.get("effectiveDate")),note:String(fd.get("note"))})});const result=await response.json();if(!response.ok)throw new Error(result.error);await refresh();setEmployeeStatus(null);setToast(nextStatus==="activo"?"Trabajador recontratado y habilitado en Almacén.":"Baja registrada; ya no aparecerá en nuevas entregas ni marcaciones.");}catch(error){setToast(error instanceof Error?error.message:"No se pudo cambiar el estado.");}finally{setLoading(false)}
  }

  async function saveWork(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setLoading(true);const fd=new FormData(event.currentTarget);const payload:WorkPayload={code:String(fd.get("code")),title:String(fd.get("title")),client:String(fd.get("client")),quantity:Number(fd.get("quantity")),model:String(fd.get("model")),responsibleEmployeeId:Number(fd.get("responsibleEmployeeId")),area:String(fd.get("area")),progress:Number(fd.get("progress")),startDate:String(fd.get("startDate")),dueDate:String(fd.get("dueDate")),notes:String(fd.get("notes"))};
    try{const response=await fetch("/api/work-orders",{method:editingWork?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(editingWork?{...payload,id:editingWork.id}:payload)});const result=await response.json();if(!response.ok)throw new Error(result.error);await refresh();setWorkOpen(false);setEditingWork(null);setToast(editingWork?"Trabajo actualizado para Planificación y Gerencia.":"Trabajo añadido al tablero de producción.");}catch(error){setToast(error instanceof Error?error.message:"No se pudo guardar el trabajo.");}finally{setLoading(false)}
  }

  function changeRole(nextRole:string) {
    setRole(nextRole);
    const first=nav.find(item=>item.roles.includes(nextRole));
    if(first) setView(first.id);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><img src="/ibema-home.jpg" alt="IBEMA HOME"/><div><small>Control de fábrica</small><em>Sistema interno</em></div></div>
      <div className="role-card"><span>Vista de rol (desarrollo)</span><select value={role} onChange={e=>changeRole(e.target.value)} aria-label="Vista de rol"><option value="almacen">Encargado de almacén</option><option value="planificacion">Planificación</option><option value="caja">Caja / Compras</option><option value="gerencia">Gerencia</option></select></div>
      <nav>{visibleNav.map(item=><button key={item.id} onClick={()=>setView(item.id)} className={view===item.id?"active":""}><span>{item.icon}</span>{item.label}</button>)}</nav>
      <div className="sidebar-foot"><div className="avatar">MF</div><div><b>Mariela Flores</b><small>Sesión activa</small></div><span className="online" /></div>
    </aside>

    <main className={role==="almacen"?"warehouse-ui":""}>
      <header className="topbar"><div><p className="eyebrow">FÁBRICA · COCHABAMBA</p><h1>{nav.find(n=>n.id===view)?.label}</h1></div><div className="top-actions"><label className="search"><span>⌕</span><input value={search} onChange={e=>setSearchByView(current=>({...current,[view]:e.target.value}))} placeholder={searchPlaceholders[view]} aria-label={`Buscar en ${nav.find(n=>n.id===view)?.label}`} /></label></div></header>

      {view==="resultados"&&<section className="content">
        <div className="welcome"><div><span className="kicker">TABLERO EJECUTIVO</span><h2>Resultados de la fábrica</h2><p>Gerencia consulta asistencia y avance general sin modificar registros operativos.</p></div><span className="status ok">Solo lectura</span></div>
        <div className="metrics">
          <Metric label="Asistencia registrada" value={`${attendanceRate}%`} note={`${workingNow.length} personas trabajando ahora`} tone="green" />
          <Metric label="Avance promedio" value={`${averageProgress}%`} note={`${data.workOrders.length} trabajos planificados`} tone="navy" />
          <Metric label="Trabajos terminados" value={String(data.workOrders.filter(job=>job.progress===100).length)} note="Con avance del 100%" tone="blue" />
          <Metric label="Trabajos en proceso" value={String(data.workOrders.filter(job=>job.progress<100).length)} note="Seguimiento de Planificación" tone="orange" />
        </div>
        <div className="dashboard-grid"><div className="panel span2"><PanelHead title="Estado de producción" subtitle="Misma pizarra actualizada por Planificación, en modo consulta" /><WorkOrdersTable rows={filteredWorkOrders} editable={false} loading={false} onUpdate={()=>{}} /></div><div className="panel"><PanelHead title="Quiénes están trabajando" subtitle="Solamente personal activo" />{activeEmployees.map(employee=>{const mark=latestAttendance.get(employee.id);return <div className="stock-alert" key={employee.id}><span>{employee.name.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><div><b>{employee.name}</b><small>{mark?`${mark.eventType} · ${niceDate(mark.occurredAt)}`:"Sin marcación registrada"}</small></div><span className={`status ${mark?.eventType==="ingreso"?"ok":"neutral"}`}>{mark?.eventType==="ingreso"?"Trabajando":"Fuera"}</span></div>})}</div></div>
      </section>}

      {view==="inventario"&&<section className="content"><div className="section-tools"><div><h2>Inventario de materiales</h2><p>Consulta lo que existe actualmente en almacén y registra aquí los nuevos ingresos.</p></div></div><div className="familiar-toolbar"><b>Acciones de almacén</b><button onClick={()=>setInvoiceOpen(true)}>＋ Nuevo ingreso</button><button onClick={()=>setView("kardex")}>▤ Ver historial Kardex</button><button onClick={()=>setView("catalogos")}>＋ Catálogos</button><button onClick={()=>setView("reportes")}>▥ Reportes</button><span>En cada ingreso puedes elegir fecha y número automáticos o manuales.</span></div><div className="unit-examples"><span><b>Unidad → unidad</b> bisagras, chapas, patas</span><span><b>Litros y mililitros</b> barnices, adhesivos y solventes</span><span><b>Bolsa → gramos</b> clavos y tornillos pesados</span><span><b>Rollo → metros</b> tela, cuero y cuerda</span></div><div className="panel table-panel"><table><thead><tr><th>Código y producto</th><th>Sección / línea</th><th>Tipo</th><th>Presentación de compra</th><th>Saldo actual</th><th>Ubicación</th><th>Estado</th></tr></thead><tbody>{filteredProducts.map(p=><tr key={p.id}><td><b>{p.name}</b><small>{p.code}</small></td><td>{p.section}<small>{p.line||"Sin línea"}</small></td><td><span className={`pill ${p.trackingType}`}>{p.trackingType==="retornable"?"Herramienta":"Material"}</span></td><td>{p.purchasePresentation}<small>1 presentación = {fmt(p.presentationFactorBase,p.baseUnit)}</small></td><td className="quantity">{fmt(p.stockBase,p.baseUnit)}</td><td>{p.location}</td><td><span className={`status ${p.stockBase<=p.minStockBase*1.35?"warning":"ok"}`}>{p.stockBase<=p.minStockBase*1.35?"Reponer":"Disponible"}</span></td></tr>)}</tbody></table></div></section>}

      {view==="catalogos"&&<section className="content"><div className="section-tools"><div><h2>Catálogos de almacén</h2><p>Registra y corrige productos, proveedores y líneas desde un solo lugar.</p></div></div><div className="simple-steps"><span><b>1</b> Registra el proveedor</span><span><b>2</b> Registra la línea</span><span><b>3</b> Añade el producto</span></div><div className="panel table-panel catalog-products"><PanelHead title="Productos" subtitle="Añade productos nuevos o corrige sus datos; el saldo se modifica solamente mediante ingresos y salidas" action="Añadir producto" onClick={()=>{setEditingProduct(null);setProductOpen(true)}}/><CatalogProductTable rows={filteredProducts} onEdit={product=>{setEditingProduct(product);setProductOpen(true)}}/></div><div className="catalog-grid"><div className="panel table-panel"><PanelHead title="Proveedores" subtitle="Nombre, dirección, teléfono y datos de contacto" action="Nuevo proveedor" onClick={()=>{setEditingSupplier(null);setSupplierOpen(true)}}/><CatalogSupplierTable rows={filteredSuppliers} onEdit={supplier=>{setEditingSupplier(supplier);setSupplierOpen(true)}}/></div><div className="panel table-panel"><PanelHead title="Líneas" subtitle="Agrupa productos como adhesivos, ferretería o barnices" action="Nueva línea" onClick={()=>{setEditingLine(null);setLineOpen(true)}}/><CatalogLineTable rows={filteredLines} onEdit={line=>{setEditingLine(line);setLineOpen(true)}}/></div></div></section>}

      {view==="reportes"&&<ReportsView products={data.products} movements={data.movements} purchases={data.purchases} search={search}/>}

      {view==="kardex"&&<section className="content"><div className="section-tools"><div><h2>Kardex de almacén</h2><p>Historial automático de todo lo que ingresó y salió. El saldo se calcula después de cada movimiento.</p></div><div className="section-actions"><label className="worker-filter">Producto<select value={kardexProduct} onChange={event=>setKardexProduct(event.target.value)}><option value="todos">Todos los productos</option>{data.products.map(product=><option key={product.id} value={product.id}>{product.code} · {product.name}</option>)}</select></label></div></div><div className="flow-note"><span>▤</span><div><b>El Kardex no registra movimientos</b><p>Los ingresos vienen de Inventario; las salidas vienen de Producción y los préstamos. Aquí solamente se consulta el historial y el saldo.</p></div></div><div className="panel table-panel"><KardexTable rows={kardexRows} products={data.products}/></div></section>}

      {view==="herramientas"&&<section className="content"><div className="section-tools"><div><h2>Préstamo de herramientas</h2><p>Solo equipos retornables: quién los recibió, estado de entrega y estado al devolver.</p></div><div className="section-actions"><WorkerFilter value={workerFilter} onChange={setWorkerFilter} employees={data.employees}/><button className="primary" onClick={()=>setMovementMode("prestamo")}>＋ Nuevo préstamo</button></div></div><div className="flow-note"><span>⇄</span><div><b>La devolución se registra desde el préstamo abierto</b><p>Usa “Marcar devolución” para conservar automáticamente la herramienta y el mismo trabajador.</p></div></div><div className="panel table-panel"><MovementTable rows={toolMovements} onReturn={setReturnLoan}/></div></section>}

      {view==="salidas"&&<section className="content"><div className="section-tools"><div><h2>Salidas para producción</h2><p>Materiales consumibles entregados a cada trabajador, separados del préstamo de herramientas.</p></div><div className="section-actions"><WorkerFilter value={workerFilter} onChange={setWorkerFilter} employees={data.employees}/><button className="primary" onClick={()=>setMovementMode("salida")}>＋ Nueva salida</button></div></div><div className="metrics small"><Metric label="Salidas visibles" value={String(productionOutputs.length)} note="Con trabajador responsable" tone="navy"/><Metric label="Trabajadores atendidos" value={String(new Set(productionOutputs.map(m=>m.employeeId)).size)} note="Historial individual disponible" tone="green"/><Metric label="Unidades compatibles" value="5" note="Unidad, peso, litros y metros" tone="blue"/></div><div className="panel table-panel"><MovementTable rows={productionOutputs}/></div></section>}

      {view==="personal"&&<section className="content"><div className="section-tools"><div><h2>Gestión del personal</h2><p>Planificación registra la ficha personal completa, bajas y recontrataciones. Los cambios se reflejan automáticamente en Almacén.</p></div><button className="primary" onClick={()=>setEmployeeOpen(true)}>＋ Añadir trabajador</button></div><div className="metrics small"><Metric label="Trabajadores activos" value={String(activeWorkers.length)} note="Disponibles para almacén y producción" tone="green"/><Metric label="Trabajadores inactivos" value={String(workers.length-activeWorkers.length)} note="Conservan todo su historial" tone="orange"/><Metric label="Total registrado" value={String(workers.length)} note="Activos y dados de baja" tone="navy"/></div><div className="panel table-panel"><EmployeeTable rows={filteredEmployees} onView={setViewingEmployee} onStatus={setEmployeeStatus}/></div></section>}

      {view==="asistencia"&&<section className="content"><div className="biometric-banner"><div className="fingerprint">◎</div><div><span className="kicker">{role==="almacen"?"REGISTRO MANUAL · ALMACÉN":"CONSULTA · PLANIFICACIÓN"}</span><h2>Control de asistencia</h2><p>{role==="almacen"?"Almacén registra entradas y salidas. El origen queda preparado para integrar huella o reconocimiento facial.":"Planificación puede consultar quién asistió y sus horarios, pero no puede insertar ni modificar marcaciones."}</p></div>{role==="almacen"&&<button className="primary" onClick={()=>setAttendanceOpen(true)}>Marcar ahora</button>}</div><div className="panel table-panel"><PanelHead title="Marcaciones recientes" subtitle="Entradas y salidas del personal" />{data.attendance.length?<table><thead><tr><th>Trabajador</th><th>Movimiento</th><th>Fecha y hora</th><th>Origen</th></tr></thead><tbody>{data.attendance.map(a=><tr key={a.id}><td><b>{a.employeeName}</b></td><td><span className={`status ${a.eventType==="ingreso"?"ok":"neutral"}`}>{a.eventType}</span></td><td>{niceDate(a.occurredAt)}</td><td>{a.source==="manual"?"Registro manual":"Biométrico"}</td></tr>)}</tbody></table>:<div className="empty large">Aún no hay marcaciones registradas.{role==="almacen"&&<><br/><button onClick={()=>setAttendanceOpen(true)}>Registrar la primera</button></>}</div>}</div></section>}

      {view==="planificacion"&&<section className="content"><div className="section-tools"><div><h2>Estado de producción</h2><p>Tablero digital basado en la pizarra de carpintería; Gerencia recibe los mismos avances en modo consulta.</p></div><button className="primary" onClick={()=>{setEditingWork(null);setWorkOpen(true)}}>＋ Añadir trabajo</button></div><div className="metrics small"><Metric label="Avance promedio" value={`${averageProgress}%`} note="Todos los trabajos registrados" tone="navy"/><Metric label="En proceso" value={String(data.workOrders.filter(job=>job.progress<100).length)} note="Requieren seguimiento" tone="orange"/><Metric label="Completados" value={String(data.workOrders.filter(job=>job.progress===100).length)} note="Trabajo terminado" tone="green"/></div><div className="panel table-panel production-board"><WorkOrdersTable rows={filteredWorkOrders} editable loading={loading} onUpdate={updateProgress} onEdit={job=>{setEditingWork(job);setWorkOpen(true)}}/></div></section>}

      {view==="compras"&&<section className="content"><div className="section-tools"><div><h2>Compras y rendición de caja</h2><p>Caja registra el gasto; almacén confirma la recepción y el ingreso físico.</p></div>{role!=="almacen"&&<button className="primary" onClick={()=>setToast("Formulario de compra preparado para la siguiente etapa.")}>＋ Registrar compra</button>}</div><div className="metrics small"><Metric label="Comprado este mes" value={`Bs ${data.purchases.reduce((s,p)=>s+p.totalBs,0).toLocaleString("es-BO")}`} note="Con factura registrada" tone="navy"/><Metric label="Por recibir" value={String(data.purchases.filter(p=>p.status!=="recibido").length)} note="Almacén debe confirmar" tone="orange"/><Metric label="Rendiciones abiertas" value="1" note="Pendiente de gerencia" tone="blue"/></div><div className="panel table-panel"><table><thead><tr><th>Fecha</th><th>Proveedor</th><th>Factura</th><th>Total</th><th>Responsable actual</th><th>Estado</th></tr></thead><tbody>{data.purchases.map(p=><tr key={p.id}><td>{dateOnly(p.purchaseDate)}</td><td><b>{p.supplier}</b></td><td>{p.invoice}</td><td className="quantity">Bs {p.totalBs.toLocaleString("es-BO",{minimumFractionDigits:2})}</td><td>{p.status==="recibido"?"Caja / Gerencia":"Almacén"}</td><td><span className={`status ${p.status==="recibido"?"ok":"warning"}`}>{p.status==="recibido"?"Recibido":"Por recibir"}</span></td></tr>)}</tbody></table></div></section>}
    </main>

    {movementMode&&role==="almacen"&&<Modal title={movementMode==="prestamo"?"Nuevo préstamo":"Nueva salida de producción"} subtitle={movementMode==="prestamo"?"Entrega una herramienta a un trabajador y registra su estado.":"Entrega material consumible y descuéntalo del inventario."} onClose={()=>setMovementMode(null)}><MovementForm mode={movementMode} products={data.products} employees={activeEmployees} onSubmit={submitMovement} onCancel={()=>setMovementMode(null)} loading={loading}/></Modal>}
    {returnLoan&&role==="almacen"&&<Modal title="Marcar devolución" subtitle={`La devolución quedará a nombre de ${returnLoan.employeeName}.`} onClose={()=>setReturnLoan(null)}><form className="form" onSubmit={submitReturn}><div className="stock-summary"><span>Herramienta</span><strong>{returnLoan.productName}</strong><small>Prestado: {returnLoan.enteredQuantity} {returnLoan.enteredUnit} · Estado de entrega: {returnLoan.condition}</small></div><label>Estado al devolver<select name="condition" defaultValue="bueno"><option value="bueno">Bueno</option><option value="regular">Regular</option><option value="malo">Malo</option></select></label><label>Observación<textarea name="note" rows={3} placeholder="Daños, mantenimiento pendiente o constancia…"/></label><div className="form-actions"><button type="button" className="secondary" onClick={()=>setReturnLoan(null)}>Cancelar</button><button className="primary" disabled={loading}>{loading?"Guardando…":"Confirmar devolución"}</button></div></form></Modal>}
    {invoiceOpen&&role==="almacen"&&<Modal title="Nueva compra / ingreso" subtitle="Registra una compra con factura o sin factura y agrega todos sus productos." onClose={()=>setInvoiceOpen(false)}><InvoiceForm products={data.products} sections={[...new Set(data.products.map(product=>product.section))]} productLines={data.lines.map(line=>line.name)} suppliers={data.suppliers.map(supplier=>supplier.name)} nextEntryNumber={Math.max(0,...data.purchases.map(purchase=>purchase.id))+1} onCreateProduct={createProduct} onSubmit={submitInvoice} onCancel={()=>setInvoiceOpen(false)} loading={loading}/></Modal>}
    {(productOpen||editingProduct)&&role==="almacen"&&<Modal title={editingProduct?"Editar producto":"Añadir producto"} subtitle={editingProduct?"Corrige sus datos sin alterar el saldo del Kardex.":"Registra el producto en el catálogo; el stock se añadirá después mediante un ingreso."} onClose={()=>{setProductOpen(false);setEditingProduct(null)}}><ProductForm sections={[...new Set(data.products.map(product=>product.section))]} productLines={data.lines.map(line=>line.name)} initialProduct={editingProduct||undefined} onSubmit={editingProduct?updateProduct:async payload=>{const product=await createProduct(payload);if(product)setProductOpen(false);return product}} onCancel={()=>{setProductOpen(false);setEditingProduct(null)}} loading={loading}/></Modal>}
    {supplierOpen&&role==="almacen"&&<Modal title={editingSupplier?"Editar proveedor":"Nuevo proveedor"} subtitle="Guarda los datos de contacto para reutilizarlos en las compras." onClose={()=>{setSupplierOpen(false);setEditingSupplier(null)}}><SupplierForm supplier={editingSupplier} onSubmit={saveSupplier} onCancel={()=>{setSupplierOpen(false);setEditingSupplier(null)}} loading={loading}/></Modal>}
    {lineOpen&&role==="almacen"&&<Modal title={editingLine?"Editar línea":"Nueva línea"} subtitle="Las líneas ayudan a ordenar y encontrar los productos." onClose={()=>{setLineOpen(false);setEditingLine(null)}}><LineForm line={editingLine} onSubmit={saveLine} onCancel={()=>{setLineOpen(false);setEditingLine(null)}} loading={loading}/></Modal>}
    {employeeOpen&&role==="planificacion"&&<Modal title="Ficha personal del trabajador" subtitle="Completa los datos de contratación según la ficha física de IBEMACASA." onClose={()=>setEmployeeOpen(false)}><EmployeeForm onSubmit={saveEmployee} onCancel={()=>setEmployeeOpen(false)} loading={loading}/></Modal>}
    {viewingEmployee&&role==="planificacion"&&<Modal title="Ficha personal" subtitle="Información registrada del trabajador." onClose={()=>setViewingEmployee(null)}><EmployeeProfile employee={viewingEmployee}/></Modal>}
    {employeeStatus&&role==="planificacion"&&<Modal title={employeeStatus.status==="activo"?"Dar de baja":"Recontratar trabajador"} subtitle={`${employeeStatus.name} conservará todo su historial anterior.`} onClose={()=>setEmployeeStatus(null)}><EmployeeStatusForm employee={employeeStatus} onSubmit={changeEmployeeStatus} onCancel={()=>setEmployeeStatus(null)} loading={loading}/></Modal>}
    {(workOpen||editingWork)&&role==="planificacion"&&<Modal title={editingWork?"Editar trabajo":"Añadir trabajo"} subtitle="Los cambios aparecerán también en el tablero de Gerencia." onClose={()=>{setWorkOpen(false);setEditingWork(null)}}><WorkForm employees={activeWorkers} work={editingWork} onSubmit={saveWork} onCancel={()=>{setWorkOpen(false);setEditingWork(null)}} loading={loading}/></Modal>}
    {attendanceOpen&&role==="almacen"&&<Modal title="Marcar asistencia" subtitle="Almacén puede registrar la fecha y hora indicadas." onClose={()=>setAttendanceOpen(false)}><form className="form" onSubmit={submitAttendance}><label>Trabajador<select name="employeeId" required defaultValue=""><option value="" disabled>Seleccionar persona</option>{activeEmployees.map(e=><option key={e.id} value={e.id}>{e.name} · {e.area}</option>)}</select></label><div className="segmented"><label><input type="radio" name="eventType" value="ingreso" defaultChecked/><span>Entrada</span></label><label><input type="radio" name="eventType" value="salida"/><span>Salida</span></label></div><div className="form-row"><label>Fecha<input name="date" type="date" required value={attendanceDate} onChange={event=>setAttendanceDate(event.target.value)}/></label><label>Hora<input name="time" type="time" required value={attendanceTime} onChange={event=>setAttendanceTime(event.target.value)}/></label></div><div className="conversion-hint">La hora puede escribirse manualmente para corregir una marcación anotada en papel.</div><div className="form-actions"><button type="button" className="secondary" onClick={()=>setAttendanceOpen(false)}>Cancelar</button><button className="primary" disabled={loading}>{loading?"Guardando…":"Confirmar marcación"}</button></div></form></Modal>}
    {toast&&<div className="toast">✓ <span>{toast}</span></div>}
  </div>;
}

function Metric({label,value,note,tone}:{label:string;value:string;note:string;tone:string}) { return <article className={`metric ${tone}`}><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div><span className="metric-icon">{tone==="orange"?"!":tone==="green"?"✓":tone==="blue"?"↗":"▦"}</span></article> }
function PanelHead({title,subtitle,action,onClick}:{title:string;subtitle:string;action?:string;onClick?:()=>void}) { return <div className="panel-head"><div><h3>{title}</h3><p>{subtitle}</p></div>{action&&<button onClick={onClick}>{action} →</button>}</div> }
function WorkerFilter({value,onChange,employees}:{value:string;onChange:(value:string)=>void;employees:Employee[]}) { return <label className="worker-filter">Historial de<select value={value} onChange={event=>onChange(event.target.value)}><option value="todos">Todos los trabajadores</option>{employees.map(employee=><option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label> }
function MovementTable({rows,onReturn}:{rows:Movement[];onReturn?:(movement:Movement)=>void}) { return rows.length?<div className="table-scroll"><table><thead><tr><th>Fecha</th><th>Artículo</th><th>Trabajador</th><th>Movimiento</th><th>Cantidad</th><th>Detalle</th>{onReturn&&<th>Acción</th>}</tr></thead><tbody>{rows.map(m=><tr key={m.id}><td>{niceDate(m.createdAt)}</td><td><b>{m.productName}</b></td><td>{m.employeeName||"Almacén"}</td><td><span className={`status ${["ingreso","devolucion"].includes(m.kind)?"ok":m.kind==="prestamo"?"info":"neutral"}`}>{m.kind}</span></td><td className="quantity">{m.enteredQuantity.toLocaleString("es-BO")} {m.enteredUnit==="presentacion"?"presentación":m.enteredUnit}</td><td><small>Estado: {m.condition}{m.note?` · ${m.note}`:""}</small></td>{onReturn&&<td>{m.kind==="prestamo"?(m.returned?<span className="status ok">Devuelto</span>:<button className="table-action" onClick={()=>onReturn(m)}>Marcar devolución</button>):<span className="muted-action">—</span>}</td>}</tr>)}</tbody></table></div>:<div className="empty large">No se encontraron movimientos.</div> }
function KardexTable({rows,products}:{rows:(Movement&{balanceAfter:number})[];products:Product[]}) { return rows.length?<div className="table-scroll"><table><thead><tr><th>Fecha</th><th>Código y producto</th><th>Detalle</th><th>Entrada</th><th>Salida</th><th>Saldo</th></tr></thead><tbody>{rows.map(m=>{const product=products.find(item=>item.id===m.productId);const isEntry=["ingreso","devolucion"].includes(m.kind);return <tr key={m.id}><td>{niceDate(m.createdAt)}</td><td><b>{m.productName}</b><small>{product?.code}</small></td><td><b>{m.kind==="ingreso"?"Compra / ingreso":m.kind==="salida"?"Entrega a trabajador":m.kind==="prestamo"?"Préstamo":"Devolución"}</b><small>{m.employeeName||"Almacén"}{m.note?` · ${m.note}`:""}</small></td><td className="kardex-entry">{isEntry?fmt(m.quantityBase,product?.baseUnit||m.enteredUnit):"—"}</td><td className="kardex-output">{!isEntry?fmt(m.quantityBase,product?.baseUnit||m.enteredUnit):"—"}</td><td className="quantity">{fmt(m.balanceAfter,product?.baseUnit||m.enteredUnit)}</td></tr>})}</tbody></table></div>:<div className="empty large">No hay movimientos para este producto.</div> }
function WorkOrdersTable({rows,editable,loading,onUpdate,onEdit}:{rows:WorkOrder[];editable:boolean;loading:boolean;onUpdate:(id:number,progress:number)=>void;onEdit?:(job:WorkOrder)=>void}) { return rows.length?<div className="table-scroll"><table className="production-table"><thead><tr><th>Maestro</th><th>O.P.</th><th>Cliente</th><th>Cant.</th><th>Mueble / modelo</th><th>Fecha inicio</th><th>Conclusión estimada</th><th>Porcentaje / Obs.</th>{editable&&<th>Acción</th>}</tr></thead><tbody>{rows.map(job=><tr key={job.id}><td><b>{job.responsibleName}</b><small>{job.area}</small></td><td><b>{job.code}</b></td><td>{job.client}</td><td className="quantity">{job.quantity||1}</td><td><b>{job.title}</b><small>{job.model||"Sin modelo"}</small></td><td>{dateOnly(job.startDate||job.updatedAt)}</td><td>{dateOnly(job.dueDate)}</td><td className="progress-cell"><div className="bar"><i style={{width:`${job.progress}%`}}/></div>{editable?<input aria-label={`Avance de ${job.title}`} type="number" min="0" max="100" defaultValue={job.progress} disabled={loading} onBlur={event=>{const value=Math.max(0,Math.min(100,Number(event.target.value)));if(value!==job.progress)onUpdate(job.id,value)}}/>:<b>{job.progress}%</b>}<small>{job.notes||(job.progress===100?"Concluido":"En proceso")}</small></td>{editable&&<td><button className="table-action" onClick={()=>onEdit?.(job)}>Editar</button></td>}</tr>)}</tbody></table></div>:<div className="empty large">No hay trabajos planificados.</div> }

function EmployeeTable({rows,onView,onStatus}:{rows:Employee[];onView:(employee:Employee)=>void;onStatus:(employee:Employee)=>void}) {return rows.length?<div className="table-scroll"><table><thead><tr><th>Trabajador</th><th>C.I.</th><th>Área</th><th>Teléfono</th><th>Último ingreso</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{rows.map(employee=><tr key={employee.id}><td><b>{employee.name}</b><small>{employee.occupation||"Ocupación no registrada"}</small></td><td>{employee.ci}</td><td>{employee.area}</td><td>{employee.phone||"—"}</td><td>{dateOnly(employee.hireDate)}</td><td><span className={`status ${employee.status==="activo"?"ok":"neutral"}`}>{employee.status==="activo"?"Activo":"Inactivo"}</span></td><td><div className="table-buttons"><button className="table-action" onClick={()=>onView(employee)}>Ver ficha</button><button className={`table-action ${employee.status==="activo"?"danger-action":""}`} onClick={()=>onStatus(employee)}>{employee.status==="activo"?"Dar de baja":"Recontratar"}</button></div></td></tr>)}</tbody></table></div>:<div className="empty large">No se encontraron trabajadores.</div>}

function EmployeeForm({onSubmit,onCancel,loading}:{onSubmit:(event:FormEvent<HTMLFormElement>)=>void;onCancel:()=>void;loading:boolean}){
  const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const [birthDate,setBirthDate]=useState("");
  const age=birthDate?(()=>{const birth=new Date(`${birthDate}T12:00:00`);const passed=now.getMonth()>birth.getMonth()||(now.getMonth()===birth.getMonth()&&now.getDate()>=birth.getDate());return Math.max(0,now.getFullYear()-birth.getFullYear()-(passed?0:1))})():0;
  return <form className="form employee-form" onSubmit={onSubmit}>
    <fieldset className="form-section"><legend><span>1</span> Datos personales</legend><label>Nombres y apellidos<input name="name" required autoFocus placeholder="Nombre completo"/></label><div className="form-grid-3"><label>Cédula de identidad<input name="ci" required placeholder="Número de C.I."/></label><label>Sexo<select name="sex" required defaultValue=""><option value="" disabled>Seleccionar</option><option value="Femenino">Femenino</option><option value="Masculino">Masculino</option><option value="Otro">Otro</option></select></label><label>Estado civil<select name="maritalStatus" defaultValue=""><option value="">No especificado</option><option>Soltero/a</option><option>Casado/a</option><option>Divorciado/a</option><option>Viudo/a</option><option>Unión libre</option></select></label></div><div className="form-grid-3"><label>Fecha de nacimiento<input name="birthDate" type="date" required value={birthDate} onChange={event=>setBirthDate(event.target.value)}/></label><label>Edad<input value={age||""} readOnly placeholder="Se calcula sola"/></label><label>Lugar de nacimiento<input name="birthPlace" placeholder="Ciudad o localidad"/></label></div><div className="form-row"><label>Profesión u ocupación<input name="occupation" placeholder="Ej.: Maestro carpintero"/></label><label>Número de hijos<input name="children" type="number" min="0" step="1" defaultValue="0"/></label></div></fieldset>
    <fieldset className="form-section"><legend><span>2</span> Contacto y referencias</legend><div className="form-row"><label>Teléfonos<input name="phone" placeholder="Número de contacto"/></label><label>Domicilio<input name="address" placeholder="Zona, calle y número"/></label></div><div className="form-row"><label>Referencia personal<textarea name="personalReference" rows={2} placeholder="Nombre, parentesco y teléfono"/></label><label>Otras referencias<textarea name="otherReferences" rows={2} placeholder="Referencias adicionales"/></label></div><label>Medio de transporte<input name="transport" placeholder="Ej.: transporte público, motocicleta"/></label></fieldset>
    <fieldset className="form-section"><legend><span>3</span> Antecedentes</legend><label>Antecedentes académicos<textarea name="academicBackground" rows={3} placeholder="Estudios, cursos o formación técnica"/></label><label>Experiencia laboral<textarea name="workExperience" rows={3} placeholder="Trabajos anteriores y funciones"/></label><label>Antecedentes de salud<textarea name="healthBackground" rows={3} placeholder="Alergias, enfermedades o información importante"/></label></fieldset>
    <fieldset className="form-section"><legend><span>4</span> Datos de contratación</legend><div className="form-grid-3"><label>Área o sección<input name="area" required list="employee-areas" placeholder="Ej.: Carpintería"/><datalist id="employee-areas"><option value="Carpintería"/><option value="Barniz"/><option value="Tapicería"/><option value="Acabados"/></datalist></label><label>Fecha de ingreso<input name="hireDate" type="date" required defaultValue={today}/></label><label>Haber diario · jornada 8 horas<input name="dailyWageBs" type="number" min="0" step="0.01" placeholder="Bs 0,00"/></label></div><label>Lugar de registro<input name="registrationPlace" defaultValue="Cochabamba"/></label></fieldset>
    <div className="conversion-hint">Al guardar, la ficha quedará en Planificación y el trabajador aparecerá automáticamente en asistencia, préstamos, salidas y responsables de producción.</div><div className="form-actions sticky-actions"><button type="button" className="secondary" onClick={onCancel}>Cancelar</button><button className="primary" disabled={loading}>{loading?"Guardando ficha…":"Guardar ficha y contratar"}</button></div>
  </form>
}

function EmployeeProfile({employee}:{employee:Employee}){const rows=[
  ["Cédula de identidad",employee.ci],["Sexo",employee.sex],["Fecha de nacimiento",employee.birthDate?dateOnly(employee.birthDate):""],["Lugar de nacimiento",employee.birthPlace],["Estado civil",employee.maritalStatus],["Hijos",String(employee.children??0)],["Profesión u ocupación",employee.occupation],["Teléfonos",employee.phone],["Domicilio",employee.address],["Referencia personal",employee.personalReference],["Otras referencias",employee.otherReferences],["Medio de transporte",employee.transport],["Antecedentes académicos",employee.academicBackground],["Experiencia laboral",employee.workExperience],["Antecedentes de salud",employee.healthBackground],["Área o sección",employee.area],["Fecha de ingreso",dateOnly(employee.hireDate)],["Haber diario",employee.dailyWageBs?`Bs ${employee.dailyWageBs.toLocaleString("es-BO",{minimumFractionDigits:2})}`:""],["Lugar de registro",employee.registrationPlace]
];return <div className="employee-profile"><div className="profile-heading"><div className="person-avatar">{employee.name.split(" ").map(part=>part[0]).slice(0,2).join("")}</div><div><h3>{employee.name}</h3><p>{employee.area} · <span className={`status ${employee.status==="activo"?"ok":"neutral"}`}>{employee.status}</span></p></div></div><dl>{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||"No registrado"}</dd></div>)}</dl><div className="form-actions"><button type="button" className="secondary" onClick={()=>window.print()}>Imprimir ficha</button></div></div>}

function EmployeeStatusForm({employee,onSubmit,onCancel,loading}:{employee:Employee;onSubmit:(event:FormEvent<HTMLFormElement>)=>void;onCancel:()=>void;loading:boolean}){const now=new Date();const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;const rehire=employee.status!=="activo";return <form className="form" onSubmit={onSubmit}><div className="stock-summary"><span>Trabajador</span><strong>{employee.name}</strong><small>{employee.area} · C.I. {employee.ci}</small></div><label>Fecha efectiva<input name="effectiveDate" type="date" required defaultValue={today}/></label><label>{rehire?"Observación de recontratación":"Motivo u observación de la baja"}<textarea name="note" rows={3} placeholder="Opcional"/></label><div className="conversion-hint">{rehire?"Volverá a aparecer en las listas de Almacén y podrá ser responsable de nuevos trabajos.":"Dejará de aparecer en nuevas entregas y marcaciones, pero su historial no se borrará."}</div><div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancelar</button><button className="primary" disabled={loading}>{loading?"Guardando…":rehire?"Confirmar recontratación":"Confirmar baja"}</button></div></form>}

function WorkForm({employees,work,onSubmit,onCancel,loading}:{employees:Employee[];work:WorkOrder|null;onSubmit:(event:FormEvent<HTMLFormElement>)=>void;onCancel:()=>void;loading:boolean}){const firstId=work?.responsibleEmployeeId||employees[0]?.id||0;const [employeeId,setEmployeeId]=useState(firstId);const selected=employees.find(employee=>employee.id===employeeId);return <form className="form work-form" onSubmit={onSubmit}><div className="form-row"><label>Número O.P.<input name="code" required defaultValue={work?.code} placeholder="Ej.: 101"/></label><label>Cliente<input name="client" required defaultValue={work?.client} placeholder="Cliente o Stock"/></label></div><div className="form-row"><label>Maestro responsable<select name="responsibleEmployeeId" required value={employeeId} onChange={event=>setEmployeeId(Number(event.target.value))}><option value="" disabled>Seleccionar trabajador</option>{employees.map(employee=><option key={employee.id} value={employee.id}>{employee.name} · {employee.area}</option>)}</select></label><label>Área<input name="area" required key={selected?.area||work?.area} defaultValue={selected?.area||work?.area} placeholder="Carpintería"/></label></div><div className="work-furniture"><label>Cantidad<input name="quantity" type="number" min="1" required defaultValue={work?.quantity||1}/></label><label>Mueble o trabajo<input name="title" required defaultValue={work?.title} placeholder="Ej.: Sillas"/></label><label>Modelo<input name="model" defaultValue={work?.model} placeholder="Ej.: Mabel"/></label></div><div className="form-row"><label>Fecha de inicio<input name="startDate" type="date" required defaultValue={work?.startDate}/></label><label>Conclusión estimada<input name="dueDate" type="date" required defaultValue={work?.dueDate}/></label></div><label>Porcentaje de avance<input name="progress" type="number" min="0" max="100" required defaultValue={work?.progress||0}/></label><label>Observaciones<textarea name="notes" rows={3} defaultValue={work?.notes} placeholder="Retrasos, revisiones o trabajo por concluir…"/></label><div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancelar</button><button className="primary" disabled={loading||!employees.length}>{loading?"Guardando…":work?"Guardar cambios":"Añadir al tablero"}</button></div></form>}
function Modal({title,subtitle,onClose,children}:{title:string;subtitle:string;onClose:()=>void;children:React.ReactNode}) { return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}><div className="modal" role="dialog" aria-modal="true" aria-label={title}><button className="close" onClick={onClose} aria-label="Cerrar">×</button><h2>{title}</h2><p>{subtitle}</p>{children}</div></div> }

function unitsFor(product?:Product) {
  if(product?.baseUnit==="g")return ["g","kg","presentacion"];
  if(product?.baseUnit==="ml")return ["ml","l","presentacion"];
  if(product?.baseUnit==="l")return ["l","ml","presentacion"];
  if(product?.baseUnit==="m")return ["m","cm","presentacion"];
  return ["pza","par","presentacion"];
}

function unitLabel(unit:string,product?:Product) { return unit==="presentacion"?(product?.purchasePresentation||"Presentación"):unit==="pza"?"Unidad":unit==="par"?"Par (2 unidades)":unit==="l"?"Litros":unit==="ml"?"Mililitros":unit; }

function MovementForm({mode,products,employees,onSubmit,onCancel,loading}:{mode:"prestamo"|"salida";products:Product[];employees:Employee[];onSubmit:(e:FormEvent<HTMLFormElement>)=>void;onCancel:()=>void;loading:boolean}) {
  const eligible=products.filter(product=>product.trackingType===(mode==="prestamo"?"retornable":"consumible"));
  const [productId,setProductId]=useState(eligible[0]?.id||0); const selected=eligible.find(p=>p.id===productId); const units=unitsFor(selected);
  if(!selected)return <div className="empty large">No hay artículos compatibles registrados.</div>;
  return <form className="form" onSubmit={onSubmit}><input type="hidden" name="kind" value={mode}/><label>{mode==="prestamo"?"Herramienta":"Material"}<select name="productId" value={productId} onChange={e=>setProductId(Number(e.target.value))}>{eligible.map(p=><option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}</select></label><div className="stock-summary"><span>Saldo disponible</span><strong>{fmt(selected.stockBase,selected.baseUnit)}</strong><small>Sección: {selected.section} · Compra: {selected.purchasePresentation}</small></div><label>Trabajador<select name="employeeId" required defaultValue=""><option value="" disabled>Seleccionar trabajador</option>{employees.filter(employee=>employee.role==="trabajador").map(e=><option key={e.id} value={e.id}>{e.name} · {e.area}</option>)}</select></label><div className="form-row"><label>Cantidad<input name="quantity" type="number" min="0.001" step="0.001" required defaultValue={mode==="prestamo"?1:undefined} placeholder="0"/></label><label>Unidad<select name="unit">{units.map(unit=><option key={unit} value={unit}>{unitLabel(unit,selected)}</option>)}</select></label></div>{mode==="prestamo"&&<label>Estado de entrega<select name="condition"><option value="nuevo">Nuevo</option><option value="bueno">Bueno</option><option value="regular">Regular</option><option value="malo">Malo</option></select></label>}<label>Observación<textarea name="note" rows={3} placeholder={mode==="prestamo"?"Trabajo o motivo del préstamo…":"Trabajo, mueble o destino del material…"}/></label><div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancelar</button><button className="primary" disabled={loading}>{loading?"Guardando…":mode==="prestamo"?"Registrar préstamo":"Registrar salida"}</button></div></form>
}

function ProductForm({sections,productLines,onSubmit,onCancel,loading,insideInvoice=false,initialProduct}:{sections:string[];productLines:string[];onSubmit:(payload:ProductPayload)=>Promise<Product|null>;onCancel:()=>void;loading:boolean;insideInvoice?:boolean;initialProduct?:Product}) {
  const [baseUnit,setBaseUnit]=useState(initialProduct?.baseUnit||"pza");
  const baseLabel=baseUnit==="pza"?"unidades":baseUnit==="l"?"litros":baseUnit==="ml"?"mililitros":baseUnit==="g"?"gramos":"metros";
  const sectionOptions=[...new Set(["Carpintería","Acabados","Barniz","Tapicería",...sections])];
  return <form className="form product-form" onSubmit={event=>{event.preventDefault();const fd=new FormData(event.currentTarget);void onSubmit({code:String(fd.get("code")),name:String(fd.get("name")),section:String(fd.get("section")),line:String(fd.get("line")),trackingType:String(fd.get("trackingType")),baseUnit:String(fd.get("baseUnit")),purchasePresentation:String(fd.get("purchasePresentation")),presentationFactorBase:Number(fd.get("presentationFactorBase")),stockBase:initialProduct?.stockBase??0,minStockBase:Number(fd.get("minStockBase")),location:String(fd.get("location"))})}}>
    {insideInvoice&&<div className="inline-product-head"><button type="button" className="back-button" onClick={onCancel}>← Volver a la compra</button><div><b>Crear producto nuevo</b><small>Úsalo solamente si el producto no aparece en la lista.</small></div></div>}
    <div className="form-row"><label>Código<input name="code" required defaultValue={initialProduct?.code} placeholder="Ej.: ACC-023"/></label><label>Ubicación<input name="location" defaultValue={initialProduct?.location} placeholder="Ej.: B-05"/></label></div>
    <label>Nombre del producto<input name="name" required defaultValue={initialProduct?.name} placeholder="Ej.: Bisagra cierre suave"/></label>
    <div className="form-row"><label>Sección<input name="section" required list="section-options" defaultValue={initialProduct?.section} placeholder="Ej.: Carpintería"/><datalist id="section-options">{sectionOptions.map(section=><option key={section} value={section}/>)}</datalist><small className="field-help">Área física: carpintería, acabados, barniz…</small></label><label>Línea<select name="line" required defaultValue={initialProduct?.line||productLines[0]||"Sin línea"}><option value="Sin línea">Sin línea</option>{productLines.map(line=><option key={line} value={line}>{line}</option>)}</select><small className="field-help">Las líneas se administran en esta misma pantalla de catálogos.</small></label></div>
    <label>Tipo de producto<select name="trackingType" defaultValue={initialProduct?.trackingType||"consumible"}><option value="consumible">Material que se consume</option><option value="retornable">Herramienta que se devuelve</option></select></label>
    <div className="form-row"><label>Unidad en la que se entrega<select name="baseUnit" value={baseUnit} onChange={e=>setBaseUnit(e.target.value)}><option value="pza">Unidad / pieza</option><option value="g">Gramos</option><option value="l">Litros</option><option value="ml">Mililitros</option><option value="m">Metros</option></select></label><label>Cómo viene comprado<input name="purchasePresentation" required defaultValue={initialProduct?.purchasePresentation} placeholder="Ej.: Caja de 100 o lata de 18 L"/></label></div>
    <label>Contenido de cada presentación<input name="presentationFactorBase" type="number" min="0.001" step="0.001" required defaultValue={initialProduct?.presentationFactorBase} placeholder="Ej.: 100"/><small className="field-help">¿Cuántos {baseLabel} contiene una caja, bolsa, lata o rollo?</small></label>
    <label>Alerta de stock mínimo ({baseLabel})<input name="minStockBase" type="number" min="0" step="0.001" defaultValue={initialProduct?.minStockBase||0}/></label>
    {initialProduct?<div className="stock-summary"><span>Saldo actual protegido por el Kardex</span><strong>{fmt(initialProduct.stockBase,initialProduct.baseUnit)}</strong><small>Para cambiar este saldo usa Nuevo ingreso o registra una salida.</small></div>:<div className="conversion-hint"><b>El producto se creará con saldo cero.</b> Después usa “Nuevo ingreso” en Inventario para añadir las cantidades recibidas.</div>}
    <div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancelar</button><button className="primary" disabled={loading}>{loading?"Guardando…":initialProduct?"Guardar cambios":insideInvoice?"Crear y usar en el ingreso":"Añadir producto"}</button></div>
  </form>
}

function InvoiceForm({products,sections,productLines,suppliers,nextEntryNumber,onCreateProduct,onSubmit,onCancel,loading}:{products:Product[];sections:string[];productLines:string[];suppliers:string[];nextEntryNumber:number;onCreateProduct:(payload:ProductPayload)=>Promise<Product|null>;onSubmit:(payload:InvoicePayload)=>void;onCancel:()=>void;loading:boolean}) {
  const [catalog,setCatalog]=useState(products);
  const [lines,setLines]=useState([{key:1,productId:products[0]?.id||0,quantity:1,unit:"presentacion",unitPriceBs:0}]);
  const [nextKey,setNextKey]=useState(2);
  const [creatingProduct,setCreatingProduct]=useState(false);
  const [supplier,setSupplier]=useState("");
  const [invoice,setInvoice]=useState("");
  const [hasInvoice,setHasInvoice]=useState(true);
  const today=()=>{const date=new Date();return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`};
  const [purchaseDate,setPurchaseDate]=useState(today);
  const [numberMode,setNumberMode]=useState<"auto"|"manual">("auto");
  const [dateMode,setDateMode]=useState<"auto"|"manual">("auto");
  const automaticNumber=String(nextEntryNumber).padStart(6,"0");
  const [manualNumber,setManualNumber]=useState("");
  const total=lines.reduce((sum,line)=>sum+(Number(line.quantity)||0)*(Number(line.unitPriceBs)||0),0);
  function updateLine(key:number,changes:Partial<(typeof lines)[number]>) { setLines(current=>current.map(line=>line.key===key?{...line,...changes}:line)); }
  function addLine(productId=catalog[0]?.id||0){setLines(current=>[...current,{key:nextKey,productId,quantity:1,unit:"presentacion",unitPriceBs:0}]);setNextKey(value=>value+1)}
  async function createAndSelect(payload:ProductPayload){const product=await onCreateProduct(payload);if(product){setCatalog(current=>[...current,product]);setLines(current=>current.length===1&&!current[0].productId?[{...current[0],productId:product.id}]:[...current,{key:nextKey,productId:product.id,quantity:1,unit:"presentacion",unitPriceBs:0}]);setNextKey(value=>value+1);setCreatingProduct(false)}return product}
  if(creatingProduct)return <ProductForm sections={sections} productLines={productLines} onSubmit={createAndSelect} onCancel={()=>setCreatingProduct(false)} loading={loading} insideInvoice/>;
  return <form className="form invoice-form" onSubmit={event=>{event.preventDefault();onSubmit({entryNumber:numberMode==="auto"?automaticNumber:manualNumber,supplier,invoice:hasInvoice?invoice:`SIN-FACTURA-${numberMode==="auto"?automaticNumber:manualNumber}`,purchaseDate:dateMode==="auto"?today():purchaseDate,items:lines.map(({productId,quantity,unit,unitPriceBs})=>({productId,quantity:Number(quantity),unit,unitPriceBs:Number(unitPriceBs)}))})}}>
    <div className="form-step"><span>1</span><div><b>Datos del ingreso</b><small>Elige si el número y la fecha serán automáticos o manuales.</small></div></div>
    <div className="entry-settings"><div><label>Número de ingreso<select value={numberMode} onChange={event=>setNumberMode(event.target.value as "auto"|"manual")}><option value="auto">Automático</option><option value="manual">Manual</option></select></label>{numberMode==="auto"?<strong>N.º {automaticNumber}</strong>:<input aria-label="Número manual de ingreso" required value={manualNumber} onChange={event=>setManualNumber(event.target.value)} placeholder="Ej.: 000245"/>}</div><div><label>Fecha del ingreso<select value={dateMode} onChange={event=>setDateMode(event.target.value as "auto"|"manual")}><option value="auto">Automática (hoy)</option><option value="manual">Manual</option></select></label>{dateMode==="auto"?<strong>{dateOnly(today())}</strong>:<input aria-label="Fecha manual del ingreso" type="date" required value={purchaseDate} onChange={event=>setPurchaseDate(event.target.value)}/>}</div></div>
    <div className="segmented document-choice"><label><input type="radio" name="documentType" checked={hasInvoice} onChange={()=>setHasInvoice(true)}/><span>Con factura</span></label><label><input type="radio" name="documentType" checked={!hasInvoice} onChange={()=>setHasInvoice(false)}/><span>Sin factura</span></label></div>
    <div className="form-row"><label>Proveedor<input name="supplier" required list="supplier-options" value={supplier} onChange={event=>setSupplier(event.target.value)} placeholder="Escribe o selecciona un proveedor"/><datalist id="supplier-options">{suppliers.map(item=><option key={item} value={item}/>)}</datalist><small className="field-help">Los proveedores se administran desde Catálogos.</small></label>{hasInvoice&&<label>Número de factura<input name="invoice" required value={invoice} onChange={event=>setInvoice(event.target.value)} placeholder="Ej.: F-181"/></label>}</div>
    <div className="form-step"><span>2</span><div><b>Productos que llegaron</b><small>Puedes registrar uno o varios productos en el mismo ingreso.</small></div></div>
    <div className="invoice-lines"><div className="invoice-lines-head"><b>{lines.length} {lines.length===1?"producto":"productos"} en este ingreso</b><button type="button" className="secondary" onClick={()=>addLine()}>＋ Agregar otro producto</button></div>{lines.map((line,index)=>{const product=catalog.find(item=>item.id===line.productId);return <div className="invoice-line" key={line.key}><label>Producto<select required value={line.productId||""} onChange={event=>updateLine(line.key,{productId:Number(event.target.value),unit:"presentacion"})}><option value="" disabled>Seleccionar producto</option>{catalog.map(item=><option key={item.id} value={item.id}>{item.code} · {item.name} · {item.purchasePresentation}</option>)}</select></label><label>Cantidad<input type="number" min="0.001" step="0.001" required value={line.quantity} onChange={event=>updateLine(line.key,{quantity:Number(event.target.value)})}/></label><label>Cómo ingresó<select value={line.unit} onChange={event=>updateLine(line.key,{unit:event.target.value})}>{unitsFor(product).map(unit=><option key={unit} value={unit}>{unitLabel(unit,product)}</option>)}</select></label><label>Precio unitario (Bs)<input type="number" min="0" step="0.01" required value={line.unitPriceBs} onChange={event=>updateLine(line.key,{unitPriceBs:Number(event.target.value)})}/></label><div className="line-subtotal"><span>Subtotal automático</span><b>Bs {(line.quantity*line.unitPriceBs).toLocaleString("es-BO",{minimumFractionDigits:2})}</b></div>{lines.length>1&&<button type="button" className="remove-line" aria-label={`Quitar producto ${index+1}`} onClick={()=>setLines(current=>current.filter(item=>item.key!==line.key))}>×</button>}</div>})}<div className="new-product-help"><div><b>¿El producto no aparece en la lista?</b><small>Créalo aquí y vuelve automáticamente a este ingreso.</small></div><button type="button" className="secondary" onClick={()=>setCreatingProduct(true)}>＋ Crear producto nuevo</button></div></div>
    <div className="form-step"><span>3</span><div><b>Revisar y guardar</b><small>El ingreso aparecerá automáticamente en el historial Kardex.</small></div></div><div className="invoice-total"><span>Total de la compra</span><strong>Bs {total.toLocaleString("es-BO",{minimumFractionDigits:2})}</strong></div><div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancelar</button><button className="primary final-action" disabled={loading||!catalog.length}>{loading?"Guardando…":"Guardar ingreso y actualizar inventario"}</button></div>
  </form>
}

function CatalogProductTable({rows,onEdit}:{rows:Product[];onEdit:(product:Product)=>void}) {
  return rows.length?<div className="table-scroll"><table><thead><tr><th>Producto</th><th>Sección / línea</th><th>Tipo</th><th>Unidad y presentación</th><th>Ubicación</th><th>Acción</th></tr></thead><tbody>{rows.map(product=><tr key={product.id}><td><b>{product.name}</b><small>{product.code}</small></td><td>{product.section}<small>{product.line||"Sin línea"}</small></td><td>{product.trackingType==="retornable"?"Herramienta":"Material"}</td><td>{unitLabel(product.baseUnit,product)}<small>{product.purchasePresentation}</small></td><td>{product.location}</td><td><button className="table-action" onClick={()=>onEdit(product)}>Editar</button></td></tr>)}</tbody></table></div>:<div className="empty large">No se encontraron productos.</div>
}

function CatalogSupplierTable({rows,onEdit}:{rows:Supplier[];onEdit:(supplier:Supplier)=>void}) {
  return rows.length?<div className="table-scroll"><table><thead><tr><th>Proveedor</th><th>Dirección</th><th>Teléfono</th><th>Contacto</th><th>Acción</th></tr></thead><tbody>{rows.map(supplier=><tr key={supplier.id}><td><b>{supplier.name}</b><small>{supplier.nit?`NIT: ${supplier.nit}`:"Sin NIT registrado"}</small></td><td>{supplier.address||"—"}</td><td>{supplier.phone||"—"}</td><td>{supplier.contact||supplier.email||"—"}</td><td><button className="table-action" onClick={()=>onEdit(supplier)}>Editar</button></td></tr>)}</tbody></table></div>:<div className="empty large">Todavía no hay proveedores.<br/><b>Registra el primero con el botón de arriba.</b></div>
}

function CatalogLineTable({rows,onEdit}:{rows:ProductLine[];onEdit:(line:ProductLine)=>void}) {
  return rows.length?<div className="table-scroll"><table><thead><tr><th>Línea</th><th>Descripción</th><th>Acción</th></tr></thead><tbody>{rows.map(line=><tr key={line.id}><td><b>{line.name}</b></td><td>{line.description||"Sin descripción"}</td><td><button className="table-action" onClick={()=>onEdit(line)}>Editar</button></td></tr>)}</tbody></table></div>:<div className="empty large">Todavía no hay líneas registradas.</div>
}

function SupplierForm({supplier,onSubmit,onCancel,loading}:{supplier:Supplier|null;onSubmit:(event:FormEvent<HTMLFormElement>)=>void;onCancel:()=>void;loading:boolean}) {
  return <form className="form" onSubmit={onSubmit}><label>Nombre del proveedor<input name="name" required autoFocus defaultValue={supplier?.name} placeholder="Ej.: Ferretería Central"/></label><div className="form-row"><label>NIT<input name="nit" defaultValue={supplier?.nit} placeholder="Opcional"/></label><label>Teléfono<input name="phone" defaultValue={supplier?.phone} placeholder="Ej.: 70700000"/></label></div><label>Dirección<input name="address" defaultValue={supplier?.address} placeholder="Zona, calle y número"/></label><div className="form-row"><label>Persona de contacto<input name="contact" defaultValue={supplier?.contact} placeholder="Nombre del vendedor"/></label><label>Correo electrónico<input name="email" type="email" defaultValue={supplier?.email} placeholder="Opcional"/></label></div><label>Otros datos<textarea name="notes" rows={3} defaultValue={supplier?.notes} placeholder="Horarios, forma de pago u observaciones…"/></label><div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancelar</button><button className="primary" disabled={loading}>{loading?"Guardando…":"Guardar proveedor"}</button></div></form>
}

function LineForm({line,onSubmit,onCancel,loading}:{line:ProductLine|null;onSubmit:(event:FormEvent<HTMLFormElement>)=>void;onCancel:()=>void;loading:boolean}) {
  return <form className="form" onSubmit={onSubmit}><label>Nombre de la línea<input name="name" required autoFocus defaultValue={line?.name} placeholder="Ej.: Adhesivos"/></label><label>Descripción<textarea name="description" rows={3} defaultValue={line?.description} placeholder="Ej.: Colas, carpicola y pegamentos"/></label><div className="conversion-hint"><b>Sección y línea no son lo mismo.</b> La sección indica el área de la fábrica; la línea sirve para agrupar productos parecidos.</div><div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancelar</button><button className="primary" disabled={loading}>{loading?"Guardando…":"Guardar línea"}</button></div></form>
}

function ReportsView({products,movements:allMovements,purchases:allPurchases,search}:{products:Product[];movements:Movement[];purchases:Purchase[];search:string}) {
  const [report,setReport]=useState("inventario");
  const [section,setSection]=useState("todas");
  const sections=[...new Set(products.map(product=>product.section))];
  const visibleProducts=products.filter(product=>(section==="todas"||product.section===section)&&(report!=="minimos"||product.stockBase<=product.minStockBase)&&`${product.code} ${product.name} ${product.section} ${product.line}`.toLowerCase().includes(search.toLowerCase()));
  const movements=allMovements.filter(item=>`${item.productName} ${item.employeeName||""} ${item.kind} ${item.note}`.toLowerCase().includes(search.toLowerCase()));
  const purchases=allPurchases.filter(item=>`${item.entryNumber||""} ${item.supplier} ${item.invoice}`.toLowerCase().includes(search.toLowerCase()));
  function downloadCsv(){
    const rows=report==="movimientos"?[["Fecha","Producto","Movimiento","Cantidad","Unidad","Trabajador"],...movements.map(item=>[item.createdAt,item.productName,item.kind,item.enteredQuantity,item.enteredUnit,item.employeeName||"Almacén"])]:report==="compras"?[["Ingreso","Fecha","Proveedor","Factura","Total Bs"],...purchases.map(item=>[item.entryNumber||item.id,item.purchaseDate,item.supplier,item.invoice,item.totalBs])]:[["Código","Producto","Sección","Línea","Saldo","Unidad","Mínimo","Ubicación"],...visibleProducts.map(item=>[item.code,item.name,item.section,item.line||"Sin línea",item.stockBase,item.baseUnit,item.minStockBase,item.location])];
    const csv=rows.map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(";")).join("\n");
    const link=document.createElement("a");link.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));link.download=`ibemacasa-${report}.csv`;link.click();URL.revokeObjectURL(link.href);
  }
  return <section className="content report-view"><div className="section-tools"><div><h2>Reportes de almacén</h2><p>Consulta, imprime o descarga la información que ya fue registrada.</p></div><div className="section-actions"><button className="secondary" onClick={downloadCsv}>Descargar Excel/CSV</button><button className="primary" onClick={()=>window.print()}>Imprimir reporte</button></div></div><div className="report-picker"><button className={report==="inventario"?"active":""} onClick={()=>setReport("inventario")}>Inventario actual</button><button className={report==="minimos"?"active":""} onClick={()=>setReport("minimos")}>Productos por reponer</button><button className={report==="movimientos"?"active":""} onClick={()=>setReport("movimientos")}>Entradas y salidas</button><button className={report==="compras"?"active":""} onClick={()=>setReport("compras")}>Compras por proveedor</button></div>{!['movimientos','compras'].includes(report)&&<div className="report-filter"><label>Sección<select value={section} onChange={event=>setSection(event.target.value)}><option value="todas">Todas las secciones</option>{sections.map(item=><option key={item}>{item}</option>)}</select></label><span>{visibleProducts.length} productos en el reporte</span></div>}<div className="panel table-panel report-paper"><div className="report-title"><b>IBEMA CASA</b><span>{report==="inventario"?"Inventario actual":report==="minimos"?"Productos por reponer":report==="movimientos"?"Reporte de entradas y salidas":"Compras por proveedor"}</span><small>Generado: {new Date().toLocaleDateString("es-BO")}</small></div>{report==="movimientos"?<MovementTable rows={movements}/>:report==="compras"?<table><thead><tr><th>Fecha</th><th>Proveedor</th><th>Factura</th><th>Total</th><th>Estado</th></tr></thead><tbody>{purchases.map(item=><tr key={item.id}><td>{dateOnly(item.purchaseDate)}</td><td><b>{item.supplier}</b></td><td>{item.invoice}</td><td className="quantity">Bs {item.totalBs.toLocaleString("es-BO",{minimumFractionDigits:2})}</td><td>{item.status==="recibido"?"Recibido":"Pendiente"}</td></tr>)}</tbody></table>:<table><thead><tr><th>Código</th><th>Producto</th><th>Sección / línea</th><th>Saldo</th><th>Mínimo</th><th>Ubicación</th><th>Estado</th></tr></thead><tbody>{visibleProducts.map(item=><tr key={item.id}><td>{item.code}</td><td><b>{item.name}</b></td><td>{item.section}<small>{item.line||"Sin línea"}</small></td><td className="quantity">{fmt(item.stockBase,item.baseUnit)}</td><td>{fmt(item.minStockBase,item.baseUnit)}</td><td>{item.location}</td><td><span className={`status ${item.stockBase<=item.minStockBase?"warning":"ok"}`}>{item.stockBase<=item.minStockBase?"Reponer":"Disponible"}</span></td></tr>)}</tbody></table>}</div></section>
}
