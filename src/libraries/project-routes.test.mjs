import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const testDir = path.dirname(fileURLToPath(import.meta.url));

function loadProjectRoutesModule() {
  const source = fs.readFileSync(path.join(testDir, "project-routes.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  const moduleShim = { exports: {} };
  new Function("module", "exports", outputText)(moduleShim, moduleShim.exports);
  return moduleShim.exports;
}

test("builds an encoded internal project detail path", () => {
  const { getProjectDetailPath } = loadProjectRoutesModule();
  assert.equal(
    getProjectDetailPath({ owner: "CL4-Bisk", name: "portfolio.site" }),
    "/projects/CL4-Bisk/portfolio.site/",
  );
});
