"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Product = { id:number; code:string; name:string; category:string; trackingType:string; baseUnit:string; stockBase:number; minStockBase:number; purchasePresentation:string; presentationFactorBase:number; location:string };
type Employee = { id:number; name:string; ci:string; area:string; role:string; phone:string; hireDate:string; status:string };
type Movement = { id:number; kind:string; quantityBase:number; enteredQuantity:number; enteredUnit:string; condition:string; note:string; createdAt:string; productName:string; employeeName:string | null };
type Attendance = { id:number; employeeId:number; employeeName:string; eventType:string; source:string; occurredAt:string };
type Purchase = { id:number; supplier:string; invoice:string; totalBs:number; status:string; purchaseDate:string };
type DashboardData = { products:Product[]; employees:Employee[]; movements:Movement[]; attendance:Attendance[]; purchases:Purchase[] };
type View = "resumen" | "inventario" | "kardex" | "personal" | "asistencia" | "compras";

const demoData: DashboardData = {
  products: [
    { id:1, code:"ADH-001", name:"Carpicola industrial", category:"Adhesivos", trackingType:"consumible", baseUnit:"g", stockBase:4850, minStockBase:2000, purchasePresentation:"Galón 3,5 L", presentationFactorBase:3500, location:"A-01" },
    { id:2, code:"BAR-018", name:"Catalizador PU Sayerlack", category:"Barnices", trackingType:"consumible", baseUnit:"ml", stockBase:7200, minStockBase:3600, purchasePresentation:"Lata 18 L", presentationFactorBase:18000, location:"A-03" },
    { id:3, code:"FER-055", name:"Clavo 2 pulgadas", category:"Ferretería", trackingType:"consumible", baseUnit:"g", stockBase:12400, minStockBase:5000, purchasePresentation:"Bolsa 25 kg", presentationFactorBase:25000, location:"B-02" },
    { id:4, code:"TAP-010", name:"Cuero sintético negro", category:"Tapicería", trackingType:"consumible", baseUnit:"m", stockBase:22.5, minStockBase:8, purchasePresentation:"Rollo 30 m", presentationFactorBase:30, location:"C-01" },
    { id:5, code:"HER-077", name:"Lijadora eléctrica Rainani", category:"Herramientas", trackingType:"retornable", baseUnit:"pza", stockBase:3, minStockBase:1, purchasePresentation:"Pieza", presentationFactorBase:1, location:"H-04" },
    { id:6, code:"EPP-011", name:"Máscara antigases completa", category:"EPP", trackingType:"retornable", baseUnit:"pza", stockBase:6, minStockBase:2, purchasePresentation:"Pieza", presentationFactorBase:1, location:"E-02" },
    { id:7, code:"COR-004", name:"Cuerda de cáñamo 8 mm", category:"Tapicería", trackingType:"consumible", baseUnit:"m", stockBase:41, minStockBase:12, purchasePresentation:"Rollo 100 m", presentationFactorBase:100, location:"C-03" },
  ],
  employees: [
    { id:1, name:"Yasmani Herrera", ci:"8012456", area:"Carpintería", role:"trabajador", phone:"70700001", hireDate:"2025-10-01", status:"activo" },
    { id:2, name:"Óscar Vargas", ci:"6532109", area:"Barniz", role:"trabajador", phone:"70700002", hireDate:"2025-09-12", status:"activo" },
    { id:3, name:"Brayan Vargas", ci:"9045821", area:"Tapicería", role:"trabajador", phone:"70700003", hireDate:"2026-01-08", status:"activo" },
    { id:4, name:"Mariela Flores", ci:"7854132", area:"Almacén", role:"almacen", phone:"70700004", hireDate:"2024-06-03", status:"activo" },
  ],
  movements: [
    { id:3, kind:"salida", quantityBase:1200, enteredQuantity:1.2, enteredUnit:"kg", condition:"bueno", note:"Armado de bastidores", createdAt:"2026-08-17 09:42", productName:"Clavo 2 pulgadas", employeeName:"Brayan Vargas" },
    { id:2, kind:"prestamo", quantityBase:1, enteredQuantity:1, enteredUnit:"pza", condition:"bueno", note:"", createdAt:"2026-08-17 08:31", productName:"Lijadora eléctrica Rainani", employeeName:"Yasmani Herrera" },
    { id:1, kind:"salida", quantityBase:650, enteredQuantity:650, enteredUnit:"g", condition:"bueno", note:"Orden dormitorio Andino", createdAt:"2026-08-16 15:18", productName:"Carpicola industrial", employeeName:"Yasmani Herrera" },
  ],
  attendance: [],
  purchases: [
    { id:1, supplier:"Multibarniz", invoice:"F-181", totalBs:2000, status:"recibido", purchaseDate:"2026-08-14" },
    { id:2, supplier:"Ferretería Central", invoice:"F-2048", totalBs:846.5, status:"pendiente_recepcion", purchaseDate:"2026-08-16" },
  ],
};

const nav: {id:View; label:string; icon:string; roles:string[]}[] = [
  { id:"resumen", label:"Resumen", icon:"▦", roles:["gerencia","almacen","caja"] },
  { id:"inventario", label:"Inventario", icon:"□", roles:["gerencia","almacen"] },
  { id:"kardex", label:"Kardex y préstamos", icon:"⇄", roles:["gerencia","almacen"] },
  { id:"personal", label:"Personal", icon:"○", roles:["gerencia","almacen"] },
  { id:"asistencia", label:"Asistencia", icon:"◷", roles:["gerencia","almacen"] },
  { id:"compras", label:"Caja y compras", icon:"Bs", roles:["gerencia","caja","almacen"] },
];

function fmt(value:number, unit:string) {
  if (unit === "g" && value >= 1000) return `${(value/1000).toLocaleString("es-BO",{maximumFractionDigits:2})} kg`;
  if (unit === "ml" && value >= 1000) return `${(value/1000).toLocaleString("es-BO",{maximumFractionDigits:2})} L`;
  return `${value.toLocaleString("es-BO",{maximumFractionDigits:2})} ${unit}`;
}

function niceDate(raw:string) {
  const date = new Date(raw.replace(" ","T") + (raw.includes("T") ? "" : ""));
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("es-BO",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(date);
}

export default function IbemaApp() {
  const [data,setData] = useState<DashboardData>(demoData);
  const [view,setView] = useState<View>("resumen");
  const [role,setRole] = useState("almacen");
  const [search,setSearch] = useState("");
  const [movementOpen,setMovementOpen] = useState(false);
  const [attendanceOpen,setAttendanceOpen] = useState(false);
  const [toast,setToast] = useState("");
  const [loading,setLoading] = useState(false);

  async function refresh() {
    try {
      const response = await fetch("/api/dashboard",{cache:"no-store"});
      if (response.ok) setData(await response.json());
    } catch { /* El modo demostración sigue disponible sin conexión. */ }
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (toast) { const id=setTimeout(()=>setToast(""),3200); return ()=>clearTimeout(id); } },[toast]);

  const visibleNav = nav.filter(item=>item.roles.includes(role));
  const filteredProducts = data.products.filter(p=>`${p.name} ${p.code} ${p.category}`.toLowerCase().includes(search.toLowerCase()));
  const lowStock = data.products.filter(p=>p.stockBase<=p.minStockBase*1.35);
  const returnablesOut = data.movements.filter(m=>m.kind==="prestamo").length;
  const visibleMovements = useMemo(()=>data.movements.filter(m=>`${m.productName} ${m.employeeName ?? ""}`.toLowerCase().includes(search.toLowerCase())),[data.movements,search]);

  async function submitMovement(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true);
    const fd=new FormData(event.currentTarget);
    const payload={ productId:Number(fd.get("productId")), employeeId:Number(fd.get("employeeId"))||null, kind:String(fd.get("kind")), quantity:Number(fd.get("quantity")), unit:String(fd.get("unit")), condition:String(fd.get("condition")), note:String(fd.get("note")) };
    try {
      const response=await fetch("/api/movements",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
      const result=await response.json(); if(!response.ok) throw new Error(result.error);
      await refresh(); setMovementOpen(false); setToast("Movimiento registrado y saldo actualizado.");
    } catch(error) { setToast(error instanceof Error?error.message:"No se pudo registrar."); }
    finally { setLoading(false); }
  }

  async function submitAttendance(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); const fd=new FormData(event.currentTarget);
    try {
      const response=await fetch("/api/attendance",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({employeeId:Number(fd.get("employeeId")),eventType:String(fd.get("eventType")),source:"manual"})});
      const result=await response.json(); if(!response.ok) throw new Error(result.error);
      await refresh(); setAttendanceOpen(false); setToast("Marcación guardada correctamente.");
    } catch(error) { setToast(error instanceof Error?error.message:"No se pudo marcar."); }
    finally { setLoading(false); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">I</span><div><strong>IBEMACASA</strong><small>Control de fábrica</small></div></div>
      <div className="role-card"><span>Vista de rol</span><select value={role} onChange={e=>{setRole(e.target.value);setView("resumen")}} aria-label="Vista de rol"><option value="almacen">Encargado de almacén</option><option value="caja">Caja / Compras</option><option value="gerencia">Gerencia</option></select></div>
      <nav>{visibleNav.map(item=><button key={item.id} onClick={()=>setView(item.id)} className={view===item.id?"active":""}><span>{item.icon}</span>{item.label}</button>)}</nav>
      <div className="sidebar-foot"><div className="avatar">MF</div><div><b>Mariela Flores</b><small>Sesión activa</small></div><span className="online" /></div>
    </aside>

    <main>
      <header className="topbar"><div><p className="eyebrow">FÁBRICA · COCHABAMBA</p><h1>{nav.find(n=>n.id===view)?.label}</h1></div><div className="top-actions"><label className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar producto o trabajador" /></label>{role!=="caja"&&<button className="primary" onClick={()=>setMovementOpen(true)}>＋ Registrar movimiento</button>}</div></header>

      {view==="resumen"&&<section className="content">
        <div className="welcome"><div><span className="kicker">HOY · 17 DE AGOSTO</span><h2>Buenos días, Mariela.</h2><p>El almacén tiene <b>{lowStock.length} alertas</b> que conviene revisar antes de iniciar la producción.</p></div><button onClick={()=>setAttendanceOpen(true)}>Marcar asistencia <span>→</span></button></div>
        <div className="metrics">
          <Metric label="Productos activos" value={String(data.products.length)} note="4 categorías principales" tone="navy" />
          <Metric label="Stock por reponer" value={String(lowStock.length)} note="Bajo el mínimo definido" tone="orange" />
          <Metric label="Préstamos abiertos" value={String(returnablesOut)} note="Herramientas y EPP" tone="blue" />
          <Metric label="Personal activo" value={String(data.employees.filter(e=>e.status==="activo").length)} note="Registro manual habilitado" tone="green" />
        </div>
        <div className="dashboard-grid"><div className="panel span2"><PanelHead title="Movimientos recientes" subtitle="Consumos, préstamos y devoluciones" action="Ver kardex" onClick={()=>setView("kardex")} /><MovementTable rows={visibleMovements.slice(0,6)} /></div><div className="panel"><PanelHead title="Alertas de stock" subtitle="Atención prioritaria" />{lowStock.length?lowStock.map(p=><div className="stock-alert" key={p.id}><span>{p.category.slice(0,2).toUpperCase()}</span><div><b>{p.name}</b><small>{fmt(p.stockBase,p.baseUnit)} disponibles · mínimo {fmt(p.minStockBase,p.baseUnit)}</small><div className="bar"><i style={{width:`${Math.min(100,(p.stockBase/p.minStockBase)*55)}%`}} /></div></div></div>):<div className="empty">No hay alertas por el momento.</div>}</div></div>
        <div className="flow-note"><span>↔</span><div><b>Conversión automática por producto</b><p>La presentación de compra y la unidad de consumo se guardan por separado. Ejemplo: 1 galón de carpicola = 3.500 g configurables; una salida de 650 g deja 2.850 g del envase abierto.</p></div></div>
      </section>}

      {view==="inventario"&&<section className="content"><div className="section-tools"><div><h2>Inventario de materiales</h2><p>Saldo unificado, incluso cuando quedan envases, bolsas o rollos abiertos.</p></div><button className="primary" onClick={()=>setMovementOpen(true)}>＋ Nuevo ingreso o salida</button></div><div className="panel table-panel"><table><thead><tr><th>Artículo</th><th>Tipo</th><th>Presentación de compra</th><th>Saldo real</th><th>Ubicación</th><th>Estado</th></tr></thead><tbody>{filteredProducts.map(p=><tr key={p.id}><td><b>{p.name}</b><small>{p.code} · {p.category}</small></td><td><span className={`pill ${p.trackingType}`}>{p.trackingType}</span></td><td>{p.purchasePresentation}<small>1 presentación = {fmt(p.presentationFactorBase,p.baseUnit)}</small></td><td className="quantity">{fmt(p.stockBase,p.baseUnit)}</td><td>{p.location}</td><td><span className={`status ${p.stockBase<=p.minStockBase*1.35?"warning":"ok"}`}>{p.stockBase<=p.minStockBase*1.35?"Reponer":"Disponible"}</span></td></tr>)}</tbody></table></div></section>}

      {view==="kardex"&&<section className="content"><div className="section-tools"><div><h2>Kardex digital</h2><p>Trazabilidad de quién recibió cada material y en qué estado.</p></div><div className="legend"><span><i className="dot consume"/>Consumible</span><span><i className="dot return"/>Retornable</span></div></div><div className="panel table-panel"><MovementTable rows={visibleMovements}/></div></section>}

      {view==="personal"&&<section className="content"><div className="section-tools"><div><h2>Ficha del personal</h2><p>Datos básicos para asignaciones, kardex y futuras marcaciones biométricas.</p></div><button className="secondary" onClick={()=>setToast("La alta de personal quedará habilitada en la siguiente etapa.")}>＋ Nuevo trabajador</button></div><div className="people-grid">{data.employees.map((e,i)=><article className="person-card" key={e.id}><div className={`person-avatar c${i%4}`}>{e.name.split(" ").slice(0,2).map(n=>n[0]).join("")}</div><div className="person-info"><span className="status ok">Activo</span><h3>{e.name}</h3><p>{e.area}</p><dl><div><dt>C.I.</dt><dd>{e.ci}</dd></div><div><dt>Ingreso</dt><dd>{new Date(e.hireDate+"T12:00:00").toLocaleDateString("es-BO")}</dd></div><div><dt>Teléfono</dt><dd>{e.phone}</dd></div></dl></div></article>)}</div></section>}

      {view==="asistencia"&&<section className="content"><div className="biometric-banner"><div className="fingerprint">◎</div><div><span className="kicker">PREPARADO PARA EL FUTURO</span><h2>Control de asistencia</h2><p>Hoy funciona con marcación manual. El origen queda registrado para conectar después un lector de huella o reconocimiento facial sin rehacer el historial.</p></div><button className="primary" onClick={()=>setAttendanceOpen(true)}>Marcar ahora</button></div><div className="panel table-panel"><PanelHead title="Marcaciones recientes" subtitle="Entradas y salidas del personal" />{data.attendance.length?<table><thead><tr><th>Trabajador</th><th>Movimiento</th><th>Fecha y hora</th><th>Origen</th></tr></thead><tbody>{data.attendance.map(a=><tr key={a.id}><td><b>{a.employeeName}</b></td><td><span className={`status ${a.eventType==="ingreso"?"ok":"neutral"}`}>{a.eventType}</span></td><td>{niceDate(a.occurredAt)}</td><td>{a.source==="manual"?"Registro manual":"Biométrico"}</td></tr>)}</tbody></table>:<div className="empty large">Aún no hay marcaciones hoy.<br/><button onClick={()=>setAttendanceOpen(true)}>Registrar la primera</button></div>}</div></section>}

      {view==="compras"&&<section className="content"><div className="section-tools"><div><h2>Compras y rendición de caja</h2><p>Caja registra el gasto; almacén confirma la recepción y el ingreso físico.</p></div>{role!=="almacen"&&<button className="primary" onClick={()=>setToast("Formulario de compra preparado para la siguiente etapa.")}>＋ Registrar compra</button>}</div><div className="metrics small"><Metric label="Comprado este mes" value={`Bs ${data.purchases.reduce((s,p)=>s+p.totalBs,0).toLocaleString("es-BO")}`} note="Con factura registrada" tone="navy"/><Metric label="Por recibir" value={String(data.purchases.filter(p=>p.status!=="recibido").length)} note="Almacén debe confirmar" tone="orange"/><Metric label="Rendiciones abiertas" value="1" note="Pendiente de gerencia" tone="blue"/></div><div className="panel table-panel"><table><thead><tr><th>Fecha</th><th>Proveedor</th><th>Factura</th><th>Total</th><th>Responsable actual</th><th>Estado</th></tr></thead><tbody>{data.purchases.map(p=><tr key={p.id}><td>{new Date(p.purchaseDate+"T12:00:00").toLocaleDateString("es-BO")}</td><td><b>{p.supplier}</b></td><td>{p.invoice}</td><td className="quantity">Bs {p.totalBs.toLocaleString("es-BO",{minimumFractionDigits:2})}</td><td>{p.status==="recibido"?"Caja / Gerencia":"Almacén"}</td><td><span className={`status ${p.status==="recibido"?"ok":"warning"}`}>{p.status==="recibido"?"Recibido":"Por recibir"}</span></td></tr>)}</tbody></table></div></section>}
    </main>

    {movementOpen&&<Modal title="Registrar movimiento" subtitle="El saldo se convertirá a la unidad base del artículo." onClose={()=>setMovementOpen(false)}><MovementForm products={data.products} employees={data.employees} onSubmit={submitMovement} onCancel={()=>setMovementOpen(false)} loading={loading}/></Modal>}
    {attendanceOpen&&<Modal title="Marcar asistencia" subtitle="Registro manual del encargado de almacén." onClose={()=>setAttendanceOpen(false)}><form className="form" onSubmit={submitAttendance}><label>Trabajador<select name="employeeId" required defaultValue=""><option value="" disabled>Seleccionar persona</option>{data.employees.map(e=><option key={e.id} value={e.id}>{e.name} · {e.area}</option>)}</select></label><div className="segmented"><label><input type="radio" name="eventType" value="ingreso" defaultChecked/><span>Entrada</span></label><label><input type="radio" name="eventType" value="salida"/><span>Salida</span></label></div><div className="time-now"><span>Hora actual</span><strong>{new Date().toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"})}</strong></div><div className="form-actions"><button type="button" className="secondary" onClick={()=>setAttendanceOpen(false)}>Cancelar</button><button className="primary" disabled={loading}>{loading?"Guardando…":"Confirmar marcación"}</button></div></form></Modal>}
    {toast&&<div className="toast">✓ <span>{toast}</span></div>}
  </div>;
}

function Metric({label,value,note,tone}:{label:string;value:string;note:string;tone:string}) { return <article className={`metric ${tone}`}><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div><span className="metric-icon">{tone==="orange"?"!":tone==="green"?"✓":tone==="blue"?"↗":"▦"}</span></article> }
function PanelHead({title,subtitle,action,onClick}:{title:string;subtitle:string;action?:string;onClick?:()=>void}) { return <div className="panel-head"><div><h3>{title}</h3><p>{subtitle}</p></div>{action&&<button onClick={onClick}>{action} →</button>}</div> }
function MovementTable({rows}:{rows:Movement[]}) { return rows.length?<div className="table-scroll"><table><thead><tr><th>Fecha</th><th>Artículo</th><th>Trabajador</th><th>Movimiento</th><th>Cantidad</th><th>Detalle</th></tr></thead><tbody>{rows.map(m=><tr key={m.id}><td>{niceDate(m.createdAt)}</td><td><b>{m.productName}</b></td><td>{m.employeeName||"Almacén"}</td><td><span className={`status ${["ingreso","devolucion"].includes(m.kind)?"ok":m.kind==="prestamo"?"info":"neutral"}`}>{m.kind}</span></td><td className="quantity">{m.enteredQuantity.toLocaleString("es-BO")} {m.enteredUnit==="presentacion"?"presentación":m.enteredUnit}</td><td><small>{m.note||`Estado: ${m.condition}`}</small></td></tr>)}</tbody></table></div>:<div className="empty large">No se encontraron movimientos.</div> }
function Modal({title,subtitle,onClose,children}:{title:string;subtitle:string;onClose:()=>void;children:React.ReactNode}) { return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.currentTarget===e.target)onClose()}}><div className="modal" role="dialog" aria-modal="true" aria-label={title}><button className="close" onClick={onClose} aria-label="Cerrar">×</button><h2>{title}</h2><p>{subtitle}</p>{children}</div></div> }

function MovementForm({products,employees,onSubmit,onCancel,loading}:{products:Product[];employees:Employee[];onSubmit:(e:FormEvent<HTMLFormElement>)=>void;onCancel:()=>void;loading:boolean}) {
  const [productId,setProductId]=useState(products[0]?.id||0); const [kind,setKind]=useState("salida"); const selected=products.find(p=>p.id===productId);
  const units=selected?.baseUnit==="g"?["g","kg","presentacion"]:selected?.baseUnit==="ml"?["ml","l","presentacion"]:selected?.baseUnit==="m"?["m","cm","presentacion"]:["pza","par","presentacion"];
  return <form className="form" onSubmit={onSubmit}><label>Artículo<select name="productId" value={productId} onChange={e=>setProductId(Number(e.target.value))}>{products.map(p=><option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}</select></label>{selected&&<div className="stock-summary"><span>Saldo disponible</span><strong>{fmt(selected.stockBase,selected.baseUnit)}</strong><small>Compra: {selected.purchasePresentation} = {fmt(selected.presentationFactorBase,selected.baseUnit)}</small></div>}<div className="form-row"><label>Movimiento<select name="kind" value={kind} onChange={e=>setKind(e.target.value)}><option value="salida">Salida / consumo</option><option value="ingreso">Ingreso / compra</option>{selected?.trackingType==="retornable"&&<><option value="prestamo">Préstamo</option><option value="devolucion">Devolución</option><option value="baja">Baja</option></>}</select></label><label>Trabajador<select name="employeeId" required={kind!=="ingreso"}><option value="">Almacén / no aplica</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label></div><div className="form-row"><label>Cantidad<input name="quantity" type="number" min="0.001" step="0.001" required placeholder="0"/></label><label>Unidad<select name="unit">{units.map(u=><option key={u} value={u}>{u==="presentacion"?selected?.purchasePresentation:u}</option>)}</select></label></div>{selected?.trackingType==="retornable"&&<label>Estado<select name="condition"><option value="nuevo">Nuevo</option><option value="bueno">Bueno</option><option value="regular">Regular</option><option value="malo">Malo</option></select></label>}<label>Observación<textarea name="note" rows={3} placeholder="Orden de trabajo, destino o constancia…"/></label><div className="conversion-hint">El sistema convierte la cantidad y descuenta siempre del saldo real, incluido el material de una presentación ya abierta.</div><div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancelar</button><button className="primary" disabled={loading}>{loading?"Guardando…":"Guardar movimiento"}</button></div></form>
}
