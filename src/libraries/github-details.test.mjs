import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const testDir = path.dirname(fileURLToPath(import.meta.url));

function loadGithubModule() {
  const source = fs
    .readFileSync(path.join(testDir, "github.ts"), "utf8")
    .replace('import "server-only";', "");
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

test("maps language bytes to descending percentages", () => {
  const { mapGithubLanguagesForPortfolio } = loadGithubModule();
  assert.deepEqual(
    mapGithubLanguagesForPortfolio({ CSS: 100, TypeScript: 300 }),
    [
      { name: "TypeScript", bytes: 300, percentage: 75 },
      { name: "CSS", bytes: 100, percentage: 25 },
    ],
  );
});

test("skips README, language, and release calls for private repositories", async () => {
  const { fetchPortfolioRepoDetails } = loadGithubModule();
  let calls = 0;
  const details = await fetchPortfolioRepoDetails(
    { owner: "CL4-Bisk", name: "private-app", private: true },
    undefined,
    async () => {
      calls += 1;
      throw new Error("private enrichment must not run");
    },
  );
  assert.equal(calls, 0);
  assert.deepEqual(details, {
    readmeMarkdown: null,
    readmePath: null,
    languageBreakdown: [],
    latestRelease: null,
  });
});

test("keeps a public repository when optional endpoints fail", async () => {
  const { fetchPortfolioRepoDetails } = loadGithubModule();
  const details = await fetchPortfolioRepoDetails(
    { owner: "CL4-Bisk", name: "koe", private: false },
    undefined,
    async () => ({ ok: false, status: 500, json: async () => ({}) }),
  );
  assert.equal(details.readmeMarkdown, null);
  assert.deepEqual(details.languageBreakdown, []);
  assert.equal(details.latestRelease, null);
});

test("decodes a public repository README and preserves its path", async () => {
  const { fetchPortfolioRepoDetails } = loadGithubModule();
  const details = await fetchPortfolioRepoDetails(
    { owner: "CL4-Bisk", name: "koe", private: false },
    undefined,
    async (url) => {
      if (url.endsWith("/readme")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            content: Buffer.from("# KOE").toString("base64"),
            encoding: "base64",
            path: "docs/README.md",
          }),
        };
      }

      return { ok: false, status: 404, json: async () => ({}) };
    },
  );

  assert.equal(details.readmeMarkdown, "# KOE");
  assert.equal(details.readmePath, "docs/README.md");
});
