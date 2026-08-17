import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("la interfaz incluye los flujos principales de IBEMACASA", async () => {
  const [app, schema, hosting] = await Promise.all([
    readFile(new URL("../app/ibema-app.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
  ]);
  assert.match(app, /Inventario/);
  assert.match(app, /Kardex/);
  assert.match(app, /Asistencia/);
  assert.match(app, /Caja y compras/);
  assert.match(app, /presentationFactorBase/);
  assert.match(schema, /presentationFactorBase/);
  assert.equal(JSON.parse(hosting).d1, "DB");
});
