# GitHub-First Project Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make project cards visually consistent and add statically generated repository detail pages whose primary content is the GitHub README and other verified GitHub data.

**Architecture:** Extend the existing build-time GitHub loader with independently optional README, language, and release enrichment, then render the same `PortfolioRepo` contract in a compact card and a full detail page. Next.js `generateStaticParams` emits every `/projects/[owner]/[repo]/` path during `next build`; `dynamicParams = false` keeps the route compatible with static export.

**Tech Stack:** Next.js 16.2.7 App Router, React 19.2.4, TypeScript 5, Tailwind CSS 4, GitHub REST API, `react-markdown`, `remark-gfm`, Node's built-in test runner, GitHub Pages static export.

## Global Constraints

- Read `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md`, and `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md` before editing route code.
- Use Node.js `>=20.9.0`; this checkout has previously validated with Node `20.19.0` or the bundled Codex Node runtime.
- Keep `output: "export"`, `trailingSlash: true`, optional `NEXT_PUBLIC_BASE_PATH`, and unoptimized images intact.
- Do not implement a modal, intercepted route, inline “See more,” project story, personal role, focus label, or inferred activity status.
- Never fetch or emit private README, language, or release content into the public static artifact.
- Preserve contributor filtering, current-user prioritization, linked avatars, and `+N` overflow.
- Keep card navigation valid and accessible: no nested interactive elements, and external actions must remain independently focusable.
- Treat README content as untrusted: do not render raw HTML and permit only safe `http`/`https` URLs plus same-document anchors.
- Do not stage or modify the user's unrelated `README.md`, `public/status.json`, or existing untracked `src/libraries/github.test.mjs` changes.
- Stage files explicitly for every commit; never use `git add .`.

---

## File Structure

### Create

- `src/libraries/readme.ts` — pure README URL resolution and URL-safety helpers.
- `src/libraries/readme.test.mjs` — Node tests for relative links, images, anchors, and unsafe schemes.
- `src/libraries/github-details.test.mjs` — Node tests for language mapping, optional fetch failures, README decoding, and private-repository enrichment guards.
- `src/libraries/project-routes.ts` — pure project-detail path, static-param, and repository-lookup helpers.
- `src/libraries/project-routes.test.mjs` — Node tests for encoded links, static params, and case-insensitive lookup.
- `src/components/projects/project-formatters.ts` — shared number, date, and language-tone presentation helpers.
- `src/components/projects/ContributorCredits.tsx` — reusable contributor credits for cards and detail pages.
- `src/components/projects/ProjectCard.tsx` — one fixed-structure, fully accessible project card.
- `src/components/projects/RepositoryReadme.tsx` — safe GitHub-flavored Markdown rendering.
- `src/components/projects/ProjectDetail.tsx` — GitHub-first detail-page layout.
- `src/app/projects/[owner]/[repo]/page.tsx` — static detail route, metadata, and route generation.

### Modify

- `package.json` — add `react-markdown` and `remark-gfm` dependencies.
- `package-lock.json` — lock the Markdown dependencies.
- `src/libraries/github.ts` — add README, language, and release fields and optional enrichment.
- `src/components/projects/Projects.tsx` — retain the page shell and grid while delegating each repository to `ProjectCard`.

### Do not modify

- `README.md`
- `public/status.json`
- `src/libraries/github.test.mjs`

---

### Task 1: Safe README URL foundation

**Files:**
- Create: `src/libraries/readme.ts`
- Create: `src/libraries/readme.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: repository owner, repository name, default branch, and README path.
- Produces: `ReadmeUrlContext`, `ReadmeUrlKind`, and `resolveReadmeUrl(value, context, kind): string`.

- [ ] **Step 1: Write the failing URL-resolution tests**

Create `src/libraries/readme.test.mjs` with the repository's existing ESM/TypeScript-transpile testing pattern:

```js
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
```

- [ ] **Step 2: Run the tests and confirm the expected failure**

Run:

```powershell
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src\libraries\readme.test.mjs
```

Expected: FAIL because `src/libraries/readme.ts` does not exist.

- [ ] **Step 3: Implement the minimal safe URL resolver**

Create `src/libraries/readme.ts`:

```ts
export type ReadmeUrlKind = "link" | "image";

export type ReadmeUrlContext = {
  owner: string;
  repo: string;
  defaultBranch: string;
  readmePath: string;
};

const safeProtocols = new Set(["http:", "https:"]);

function encodePath(value: string) {
  return value
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

export function resolveReadmeUrl(
  value: string,
  context: ReadmeUrlContext,
  kind: ReadmeUrlKind,
) {
  const candidate = value.trim();

  if (!candidate) return "";
  if (kind === "link" && candidate.startsWith("#")) return candidate;

  const owner = encodeURIComponent(context.owner);
  const repo = encodeURIComponent(context.repo);
  const branch = encodeURIComponent(context.defaultBranch);
  const readmePath = encodePath(context.readmePath || "README.md");
  const readmeDirectory = readmePath.split("/").slice(0, -1).join("/");
  const linkBase = `https://github.com/${owner}/${repo}/blob/${branch}/${readmePath}`;
  const imageBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${readmeDirectory ? `${readmeDirectory}/` : ""}`;

  try {
    const url = new URL(candidate, kind === "image" ? imageBase : linkBase);
    return safeProtocols.has(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}
```

- [ ] **Step 4: Run the URL tests and verify they pass**

Run the Step 2 command.

Expected: 3 tests PASS.

- [ ] **Step 5: Install the Markdown renderer dependencies**

Run:

```powershell
npm install react-markdown remark-gfm
```

Expected: `package.json` and `package-lock.json` contain `react-markdown` and `remark-gfm`; no other dependency is added.

- [ ] **Step 6: Commit Task 1**

```powershell
git add -- package.json package-lock.json src/libraries/readme.ts src/libraries/readme.test.mjs
git commit -m "feat: add safe repository README URL handling"
```

---

### Task 2: Build-time GitHub repository enrichment

**Files:**
- Create: `src/libraries/github-details.test.mjs`
- Modify: `src/libraries/github.ts`

**Interfaces:**
- Consumes: the existing `GithubRepo`, GitHub request headers, contributor mapping, and a `fetch`-compatible request function.
- Produces: `PortfolioLanguage`, `PortfolioRelease`, `PortfolioRepoDetails`, `mapGithubLanguagesForPortfolio()`, and `fetchPortfolioRepoDetails()`; extends `PortfolioRepo` with `readmeMarkdown`, `readmePath`, `languageBreakdown`, and `latestRelease`.

- [ ] **Step 1: Write failing enrichment tests**

Create `src/libraries/github-details.test.mjs` using the same `typescript.transpileModule` loader as `src/libraries/github.test.mjs`. Pass a fake `fetch` function to the exported enrichment helper and cover these exact cases:

```js
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
```

Add a fourth test whose fake README response returns JSON `{ content: Buffer.from("# KOE").toString("base64"), encoding: "base64", path: "docs/README.md" }` and assert that the helper returns `readmeMarkdown: "# KOE"` and `readmePath: "docs/README.md"`.

- [ ] **Step 2: Run the enrichment tests and confirm failure**

Run:

```powershell
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src\libraries\github-details.test.mjs
```

Expected: FAIL because the new exports and fields do not exist.

- [ ] **Step 3: Add the detail data types and empty value**

In `src/libraries/github.ts`, add:

```ts
export type PortfolioLanguage = {
  name: string;
  bytes: number;
  percentage: number;
};

export type PortfolioRelease = {
  name: string;
  tagName: string;
  publishedAt: string;
  url: string;
};

export type PortfolioRepoDetails = {
  readmeMarkdown: string | null;
  readmePath: string | null;
  languageBreakdown: PortfolioLanguage[];
  latestRelease: PortfolioRelease | null;
};

const emptyPortfolioRepoDetails: PortfolioRepoDetails = {
  readmeMarkdown: null,
  readmePath: null,
  languageBreakdown: [],
  latestRelease: null,
};
```

Add these four properties to `PortfolioRepo` using the exact same types.

- [ ] **Step 4: Implement language mapping**

```ts
export function mapGithubLanguagesForPortfolio(
  languages: Record<string, number>,
): PortfolioLanguage[] {
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

  if (total <= 0) return [];

  return Object.entries(languages)
    .filter(([, bytes]) => Number.isFinite(bytes) && bytes > 0)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / total) * 1000) / 10,
    }))
    .sort((a, b) => b.bytes - a.bytes || a.name.localeCompare(b.name));
}
```

- [ ] **Step 5: Implement isolated public-repository enrichment**

Add small response types for README JSON and latest release JSON. Implement `fetchPortfolioRepoDetails()` with this contract:

```ts
export async function fetchPortfolioRepoDetails(
  repo: { owner: string; name: string; private: boolean },
  token?: string,
  request: typeof fetch = fetch,
): Promise<PortfolioRepoDetails> {
  if (repo.private) return { ...emptyPortfolioRepoDetails };

  const root = `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`;
  const options = { headers: githubHeaders(token), next: { revalidate: 3600 } };

  const [readme, languages, release] = await Promise.all([
    fetchReadmeDetails(`${root}/readme`, options, request),
    fetchLanguageDetails(`${root}/languages`, options, request),
    fetchLatestRelease(`${root}/releases/latest`, options, request),
  ]);

  return {
    readmeMarkdown: readme?.markdown ?? null,
    readmePath: readme?.path ?? null,
    languageBreakdown: languages,
    latestRelease: release,
  };
}
```

Each private helper must return its empty value on `404`, `204`, non-OK responses, malformed JSON, or a thrown request. README decoding must accept only `encoding === "base64"`, remove embedded newlines from `content`, and decode with `Buffer.from(content, "base64").toString("utf8")`. Latest release mapping uses `name || tag_name` for the visible name and requires `tag_name`, `html_url`, and `published_at`.

- [ ] **Step 6: Merge enrichment into every mapped repository**

Update `toPortfolioRepoWithContributors()` to fetch contributors and the new detail object independently, then pass both into `toPortfolioRepo()`. Ensure `toPortfolioRepo()` always populates all detail fields, including empty fields for private repositories and optional-fetch failures.

- [ ] **Step 7: Run focused and existing GitHub tests**

```powershell
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src\libraries\github-details.test.mjs
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src\libraries\github.test.mjs
```

Expected: all enrichment tests PASS and the existing contributor regression test remains PASS.

- [ ] **Step 8: Commit Task 2 without staging the existing contributor test**

```powershell
git add -- src/libraries/github.ts src/libraries/github-details.test.mjs
git commit -m "feat: enrich portfolio repositories from GitHub"
```

---

### Task 3: Consistent accessible project cards

**Files:**
- Create: `src/libraries/project-routes.ts`
- Create: `src/libraries/project-routes.test.mjs`
- Create: `src/components/projects/project-formatters.ts`
- Create: `src/components/projects/ContributorCredits.tsx`
- Create: `src/components/projects/ProjectCard.tsx`
- Modify: `src/components/projects/Projects.tsx`

**Interfaces:**
- Consumes: `PortfolioRepo` from `github.ts`.
- Produces: `getProjectDetailPath({ owner, name }): string`, reusable `ContributorCredits`, and `ProjectCard`.

- [ ] **Step 1: Write the failing internal-path test**

Create `src/libraries/project-routes.test.mjs` with the same TypeScript-transpile loader used by the other pure-module tests:

```js
test("builds an encoded internal project detail path", () => {
  const { getProjectDetailPath } = loadProjectRoutesModule();
  assert.equal(
    getProjectDetailPath({ owner: "CL4-Bisk", name: "portfolio.site" }),
    "/projects/CL4-Bisk/portfolio.site/",
  );
});
```

- [ ] **Step 2: Run the route test and confirm failure**

```powershell
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src\libraries\project-routes.test.mjs
```

Expected: FAIL because `project-routes.ts` does not exist.

- [ ] **Step 3: Implement the internal path helper**

Create `src/libraries/project-routes.ts`:

```ts
type ProjectIdentity = { owner: string; name: string };

export function getProjectDetailPath(project: ProjectIdentity) {
  return `/projects/${encodeURIComponent(project.owner)}/${encodeURIComponent(project.name)}/`;
}
```

Run the Step 2 test again. Expected: PASS.

- [ ] **Step 4: Extract shared presentation helpers**

Move `formatNumber`, `formatUpdatedDate`, `getLanguageTone`, and their formatter/tone constants from `Projects.tsx` into `project-formatters.ts`. Export the functions and `LanguageTone` type without changing their visible output.

- [ ] **Step 5: Extract contributor credits without changing attribution behavior**

Move `ContributorCredits`, `getCreditsLabel`, and `visibleContributorCount` into `ContributorCredits.tsx`. Add a `compact?: boolean` prop:

```ts
type ContributorCreditsProps = {
  repo: PortfolioRepo;
  compact?: boolean;
};
```

For cards, render a fixed-height contributor slot. If the array is empty, show “Contributor data unavailable” instead of collapsing the slot. Keep profile links, tooltips, four visible avatars, and `+N` overflow.

- [ ] **Step 6: Implement `ProjectCard` with fixed visual slots**

Use an `article` with `relative grid h-full min-h-[23rem]` and explicit rows for header, a three-line description, contributor credits, metadata, and actions. Add `auto-rows-fr` to the parent grid in `Projects.tsx`.

The internal `Link` must use a stretched `after:absolute after:inset-0` hit area from inside the repository heading. Contributor profiles, Repository, and Live links must use `relative z-10` so they remain separate controls. Do not render a README button.

Use this exact description clamp:

```tsx
<p className="mt-4 min-h-[4.5rem] overflow-hidden break-words text-sm leading-6 text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
  {description}
</p>
```

The final visible card actions are “Repository,” optional “Live,” and the non-button text “View repository details →”.

- [ ] **Step 7: Reduce `Projects.tsx` to the page shell and card grid**

Keep aggregate statistics, introduction, and empty state in `Projects.tsx`. Replace the inline article with:

```tsx
<section
  aria-label="Project list"
  className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
>
  {repos.map((repo) => (
    <ProjectCard key={repo.id} repo={repo} />
  ))}
</section>
```

- [ ] **Step 8: Run focused checks**

```powershell
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src\libraries\project-routes.test.mjs
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\eslint\bin\eslint.js src\components\projects\Projects.tsx src\components\projects\ProjectCard.tsx src\components\projects\ContributorCredits.tsx src\components\projects\project-formatters.ts src\libraries\project-routes.ts
```

Expected: route test PASS and ESLint exits 0.

- [ ] **Step 9: Commit Task 3**

```powershell
git add -- src/libraries/project-routes.ts src/libraries/project-routes.test.mjs src/components/projects/project-formatters.ts src/components/projects/ContributorCredits.tsx src/components/projects/ProjectCard.tsx src/components/projects/Projects.tsx
git commit -m "feat: make project cards consistent and navigable"
```

---

### Task 4: README-first repository detail components

**Files:**
- Create: `src/components/projects/RepositoryReadme.tsx`
- Create: `src/components/projects/ProjectDetail.tsx`
- Modify: `src/libraries/readme.ts`
- Modify: `src/libraries/readme.test.mjs`

**Interfaces:**
- Consumes: the enriched `PortfolioRepo`, `resolveReadmeUrl()`, `ContributorCredits`, and shared formatters.
- Produces: `getReadmeLinkAttributes()`, `RepositoryReadme({ repo })`, and `ProjectDetail({ repo })` server components.

- [ ] **Step 1: Add failing README-link attribute tests**

Extend `readme.test.mjs`:

```js
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
```

Run the Task 1 README test command.

Expected: the three new tests FAIL because `getReadmeLinkAttributes` does not exist.

- [ ] **Step 2: Implement the tested link-attribute helper**

Add to `readme.ts`:

```ts
export function getReadmeLinkAttributes(
  value: string,
  context: ReadmeUrlContext,
) {
  const href = resolveReadmeUrl(value, context, "link");

  if (!href) return null;

  const external = !href.startsWith("#");
  return {
    href,
    target: external ? "_blank" : undefined,
    rel: external ? "noreferrer noopener" : undefined,
  } as const;
}
```

Run the README tests again. Expected: all tests PASS.

- [ ] **Step 3: Implement `RepositoryReadme`**

Render `react-markdown` with `remarkGfm` and no raw-HTML plugin:

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    a: ({ href = "", children, ...props }) => {
      const attributes = getReadmeLinkAttributes(href, context);
      if (!attributes) return <span>{children}</span>;
      return (
        <a
          {...props}
          {...attributes}
          className="font-medium text-accent-strong underline decoration-line transition hover:decoration-accent"
        >
          {children}
        </a>
      );
    },
    img: ({ src = "", alt = "" }) => {
      const safeSrc = resolveReadmeUrl(String(src), context, "image");
      return safeSrc ? (
        <img
          src={safeSrc}
          alt={alt}
          loading="lazy"
          className="my-6 h-auto max-w-full rounded-lg border border-line"
        />
      ) : null;
    },
  }}
>
  {repo.readmeMarkdown}
</ReactMarkdown>
```

Add explicit component mappings/classes for `h1`-`h4`, paragraphs, lists, blockquotes, inline code, fenced code, horizontal rules, and a horizontally scrollable table wrapper. Add one file-level ESLint suppression for `@next/next/no-img-element` with a comment explaining that arbitrary README images have no known dimensions and the static export uses unoptimized remote images.

If `repo.private` is true, render “Private repository content is not published.” If `readmeMarkdown` or `readmePath` is missing, render “README unavailable” and a Repository link.

- [ ] **Step 4: Implement `ProjectDetail`**

Build a responsive header plus `lg:grid-cols-[minmax(0,1fr)_18rem]` body. The header facts must be exactly:

- Visibility
- Default branch
- Contributors
- Last updated

The main column contains `RepositoryReadme`. The side column contains stars, forks, language bars, contributor credits, optional latest release, and optional Live link. Do not add role, focus, team, activity status, project story, or package claims.

For language bars, set width with the numeric percentage and include the percentage as visible text. Cap the stored CSS width to `0..100` even if malformed data reaches the component.

- [ ] **Step 5: Run focused tests and lint**

```powershell
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src\libraries\readme.test.mjs
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\eslint\bin\eslint.js src\components\projects\RepositoryReadme.tsx src\components\projects\ProjectDetail.tsx src\libraries\readme.ts
```

Expected: README tests PASS and ESLint exits 0.

- [ ] **Step 6: Commit Task 4**

```powershell
git add -- src/components/projects/RepositoryReadme.tsx src/components/projects/ProjectDetail.tsx src/libraries/readme.ts src/libraries/readme.test.mjs
git commit -m "feat: render GitHub-first project details"
```

---

### Task 5: Static project detail routes

**Files:**
- Modify: `src/libraries/project-routes.ts`
- Modify: `src/libraries/project-routes.test.mjs`
- Create: `src/app/projects/[owner]/[repo]/page.tsx`

**Interfaces:**
- Consumes: `getGithubRepos(): Promise<PortfolioRepo[]>` and `ProjectDetail`.
- Produces: `getProjectStaticParams(repos)`, `findProjectByRoute(repos, owner, repo)`, `generateStaticParams()`, `generateMetadata()`, and the static page component.

- [ ] **Step 1: Add failing route-data tests**

Extend `project-routes.test.mjs`:

```js
const repos = [
  { owner: "CL4-Bisk", name: "PORTFOLIO" },
  { owner: "CL4-Bisk", name: "koe" },
];

test("maps displayed repositories to static route params", () => {
  const { getProjectStaticParams } = loadProjectRoutesModule();
  assert.deepEqual(getProjectStaticParams(repos), [
    { owner: "CL4-Bisk", repo: "PORTFOLIO" },
    { owner: "CL4-Bisk", repo: "koe" },
  ]);
});

test("finds a generated repository case-insensitively", () => {
  const { findProjectByRoute } = loadProjectRoutesModule();
  assert.equal(
    findProjectByRoute(repos, "cl4-bisk", "portfolio"),
    repos[0],
  );
});
```

- [ ] **Step 2: Run the tests and confirm missing-export failures**

Run the Task 3 route-test command.

Expected: the original path test passes; the two new tests FAIL because the functions are not exported.

- [ ] **Step 3: Implement route-data helpers**

Add to `project-routes.ts`:

```ts
export function getProjectStaticParams(projects: ProjectIdentity[]) {
  return projects.map((project) => ({
    owner: project.owner,
    repo: project.name,
  }));
}

export function findProjectByRoute<T extends ProjectIdentity>(
  projects: T[],
  owner: string,
  repo: string,
) {
  const ownerKey = owner.toLowerCase();
  const repoKey = repo.toLowerCase();
  return projects.find(
    (project) =>
      project.owner.toLowerCase() === ownerKey &&
      project.name.toLowerCase() === repoKey,
  );
}
```

Run the route tests again. Expected: all 3 tests PASS.

- [ ] **Step 4: Create the static dynamic route**

Create `src/app/projects/[owner]/[repo]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectDetail from "@/components/projects/ProjectDetail";
import { getGithubRepos } from "@/libraries/github";
import {
  findProjectByRoute,
  getProjectStaticParams,
} from "@/libraries/project-routes";

type ProjectPageProps = {
  params: Promise<{ owner: string; repo: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getProjectStaticParams(await getGithubRepos());
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { owner, repo: repoName } = await params;
  const repo = findProjectByRoute(await getGithubRepos(), owner, repoName);

  if (!repo) return { title: "Project not found | APARICIO" };

  return {
    title: `${repo.name} | APARICIO Projects`,
    description:
      repo.description ?? `GitHub repository details for ${repo.fullName}.`,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { owner, repo: repoName } = await params;
  const repo = findProjectByRoute(await getGithubRepos(), owner, repoName);

  if (!repo) notFound();

  return <ProjectDetail repo={repo} />;
}
```

- [ ] **Step 5: Run route tests, lint, and a TypeScript-aware build**

```powershell
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src\libraries\project-routes.test.mjs
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\eslint\bin\eslint.js 'src\app\projects\[owner]\[repo]\page.tsx' src\libraries\project-routes.ts
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\next\dist\bin\next build
```

Expected: tests and ESLint PASS; `next build` emits `/projects/[owner]/[repo]` paths instead of reporting an unsupported dynamic route.

- [ ] **Step 6: Commit Task 5**

```powershell
git add -- src/libraries/project-routes.ts src/libraries/project-routes.test.mjs 'src/app/projects/[owner]/[repo]/page.tsx'
git commit -m "feat: add static repository detail routes"
```

---

### Task 6: Full static-export and interaction verification

**Files:**
- Modify only if verification reveals an in-scope defect in files from Tasks 1-5.

**Interfaces:**
- Consumes: all feature outputs from Tasks 1-5.
- Produces: verified tests, lint, production export, artifact checks, and responsive interaction evidence.

- [ ] **Step 1: Run all new pure tests plus the existing contributor test**

```powershell
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test src\libraries\readme.test.mjs src\libraries\github-details.test.mjs src\libraries\project-routes.test.mjs src\libraries\github.test.mjs
```

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Run focused ESLint and the production build**

```powershell
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\eslint\bin\eslint.js src\app\projects src\components\projects src\libraries\github.ts src\libraries\readme.ts src\libraries\project-routes.ts
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\next\dist\bin\next build
```

Expected: ESLint exits 0; the build exits 0 and writes `out/`.

If the build fails with `fetch failed`, `connect EACCES`, or DNS/network errors while contacting GitHub, rerun the same build with approved network access. Do not change source code to mask an environment-only network failure.

- [ ] **Step 3: Inspect the generated artifact**

Use PowerShell to locate generated detail pages without assuming a specific configured repository:

```powershell
$detailPages = Get-ChildItem -Path out\projects -Recurse -Filter index.html |
  Where-Object { $_.FullName -ne (Resolve-Path out\projects\index.html).Path }

if ($detailPages.Count -lt 1) { throw 'No project detail pages were exported.' }

$publicDetailPage = $detailPages |
  Where-Object { (Get-Content -Raw $_.FullName).Contains('Synced from GitHub') } |
  Select-Object -First 1

if (-not $publicDetailPage) {
  throw 'No exported public detail page contains the README source label.'
}
```

Also inspect `out/projects/index.html` for “View repository details” and confirm it no longer contains a card-level README action.

- [ ] **Step 4: Preview the static output and test interactions**

Serve `out/` with a local static server. Verify at desktop and mobile widths:

1. all cards in a grid row have the same height;
2. descriptions stop at three lines;
3. clicking non-action card space opens the internal detail route;
4. Repository, Live, and contributor links do not trigger internal navigation;
5. Back to Projects returns to the grid;
6. README headings, lists, code blocks, tables, relative links, and images render without page-level overflow;
7. private pages show the private-content notice and contain no README Markdown, language breakdown, or release content.

- [ ] **Step 5: Test GitHub Pages base-path output**

Run a second build with the deployment base path:

```powershell
$env:NEXT_PUBLIC_BASE_PATH='/PORTFOLIO'
& 'C:\Users\apari\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\next\dist\bin\next build
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

Preview the generated `out/` directory. Confirm the physical pages still exist under `out/projects/...`, internal project-detail URLs contain `/PORTFOLIO/projects/...`, and external GitHub/live links remain unchanged.

- [ ] **Step 6: Verify final Git scope**

```powershell
git status --short
git diff --check
git diff --stat 42ef22b..HEAD
```

Expected: only implementation-plan and feature files are committed or modified. `README.md`, `public/status.json`, and `src/libraries/github.test.mjs` remain outside feature commits exactly as they were before execution.

- [ ] **Step 7: Commit only verification fixes, if any**

If Steps 1-6 required in-scope fixes, stage only those exact feature files and commit:

```powershell
git commit -m "fix: finalize GitHub project detail export"
```

If no fixes were required, do not create an empty commit.
