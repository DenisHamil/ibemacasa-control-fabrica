import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("la interfaz incluye los flujos principales de IBEMACASA", async () => {
  const [app, schema, invoiceApi, hosting, dockerfile] = await Promise.all([
    readFile(new URL("../app/ibema-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/invoices/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../Dockerfile", import.meta.url), "utf8"),
  ]);
  assert.match(app, /Inventario/);
  assert.match(app, /Préstamo de herramientas/);
  assert.match(app, /Salidas de producción/);
  assert.match(app, /Asistencia/);
  assert.match(app, /Planificación/);
  assert.match(app, /Añadir trabajador/);
  assert.match(app, /Ficha personal del trabajador/);
  assert.match(app, /Antecedentes académicos/);
  assert.match(app, /Experiencia laboral/);
  assert.match(app, /Antecedentes de salud/);
  assert.match(app, /Haber diario/);
  assert.match(app, /Ver ficha/);
  assert.match(app, /Dar de baja/);
  assert.match(app, /Recontratar/);
  assert.match(app, /Añadir trabajo/);
  assert.match(app, /Número O\.P\./);
  assert.match(app, /Conclusión estimada/);
  assert.match(app, /Resultados/);
  assert.match(app, /Caja y compras/);
  assert.match(app, /presentationFactorBase/);
  assert.match(app, /Unidad \/ pieza/);
  assert.match(app, /Nuevo ingreso/);
  assert.match(app, /Añadir producto/);
  assert.match(app, /Crear producto nuevo/);
  assert.match(app, /Kardex de almacén/);
  assert.match(app, /Sin factura/);
  assert.match(app, /Editar producto/);
  assert.match(app, /Nuevo préstamo/);
  assert.match(app, /Nueva salida/);
  assert.match(app, /Marcar devolución/);
  assert.match(app, /Litros/);
  assert.match(app, /Catálogos de almacén/);
  assert.match(app, /Número de ingreso/);
  assert.match(app, /Automático/);
  assert.match(app, /Reportes de almacén/);
  assert.match(app, /Descargar Excel\/CSV/);
  assert.match(app, /name="time"/);
  assert.match(schema, /presentationFactorBase/);
  assert.match(schema, /workOrders/);
  assert.match(schema, /employeeStatusHistory/);
  assert.match(schema, /personalReference/);
  assert.match(schema, /dailyWageBs/);
  assert.match(schema, /purchaseItems/);
  assert.match(schema, /section/);
  assert.match(schema, /suppliers/);
  assert.match(schema, /productLines/);
  assert.match(invoiceApi, /unitPriceBs/);
  assert.equal(JSON.parse(hosting).d1, "DB");
  assert.match(dockerfile, /pnpm build/);
});
