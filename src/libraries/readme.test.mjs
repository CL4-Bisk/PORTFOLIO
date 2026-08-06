import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const testDir = path.dirname(fileURLToPath(import.meta.url));

function loadReadmeModule() {
  const source = fs.readFileSync(path.join(testDir, "readme.ts"), "utf8");
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

const context = {
  owner: "CL4-Bisk",
  repo: "koe",
  defaultBranch: "main",
  readmePath: "docs/README.md",
};

test("resolves README links against the GitHub blob path", () => {
  const { resolveReadmeUrl } = loadReadmeModule();
  assert.equal(
    resolveReadmeUrl("../CONTRIBUTING.md", context, "link"),
    "https://github.com/CL4-Bisk/koe/blob/main/CONTRIBUTING.md",
  );
});

test("resolves README images against raw GitHub content", () => {
  const { resolveReadmeUrl } = loadReadmeModule();
  assert.equal(
    resolveReadmeUrl("./images/board.png", context, "image"),
    "https://raw.githubusercontent.com/CL4-Bisk/koe/main/docs/images/board.png",
  );
});

test("keeps same-document anchors and rejects unsafe schemes", () => {
  const { resolveReadmeUrl } = loadReadmeModule();
  assert.equal(resolveReadmeUrl("#setup", context, "link"), "#setup");
  assert.equal(resolveReadmeUrl("javascript:alert(1)", context, "link"), "");
  assert.equal(resolveReadmeUrl("data:text/html,bad", context, "image"), "");
});

test("marks external README links for a new tab", () => {
  const { getReadmeLinkAttributes } = loadReadmeModule();
  assert.deepEqual(
    getReadmeLinkAttributes("https://example.com/docs", context),
    {
      href: "https://example.com/docs",
      target: "_blank",
      rel: "noreferrer noopener",
    },
  );
});

test("keeps README anchors in the current page", () => {
  const { getReadmeLinkAttributes } = loadReadmeModule();
  assert.deepEqual(getReadmeLinkAttributes("#setup", context), {
    href: "#setup",
    target: undefined,
    rel: undefined,
  });
});

test("returns null for unsafe README links", () => {
  const { getReadmeLinkAttributes } = loadReadmeModule();
  assert.equal(getReadmeLinkAttributes("javascript:alert(1)", context), null);
});
