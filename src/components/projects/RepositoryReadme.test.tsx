import assert from "node:assert/strict";
import test from "node:test";

import { renderToStaticMarkup } from "react-dom/server";

import type { PortfolioRepo } from "@/libraries/github";

import { RepositoryReadme } from "./RepositoryReadme";

function repositoryWithReadme(readmeMarkdown: string): PortfolioRepo {
  return {
    id: 1,
    name: "portfolio",
    fullName: "CL4-Bisk/portfolio",
    owner: "CL4-Bisk",
    private: false,
    description: null,
    language: "TypeScript",
    githubUrl: "https://github.com/CL4-Bisk/portfolio",
    websiteUrl: null,
    defaultBranch: "main",
    stars: 0,
    forks: 0,
    pushedAt: "2026-08-06T00:00:00Z",
    contributors: [],
    readmeMarkdown,
    readmePath: "README.md",
    languageBreakdown: [],
    latestRelease: null,
  };
}

test("renders GitHub-compatible duplicate heading anchors used by README links", () => {
  const html = renderToStaticMarkup(
    <RepositoryReadme
      repo={repositoryWithReadme("# Setup\n\n[Jump to setup](#setup)\n\n# Setup")}
    />,
  );

  assert.match(html, /<h3[^>]*id="setup"[^>]*>Setup<\/h3>/);
  assert.match(html, /<h3[^>]*id="setup-1"[^>]*>Setup<\/h3>/);
  assert.match(html, /<a[^>]*href="#setup"[^>]*>Jump to setup<\/a>/);
});

test("offsets every README heading beneath the page and README headings", () => {
  const html = renderToStaticMarkup(
    <RepositoryReadme
      repo={repositoryWithReadme(
        "# One\n## Two\n### Three\n#### Four\n##### Five\n###### Six",
      )}
    />,
  );

  assert.match(html, /<h2[^>]*>README<\/h2>/);
  assert.match(html, /<h3[^>]*>One<\/h3>/);
  assert.match(html, /<h4[^>]*>Two<\/h4>/);
  assert.match(html, /<h5[^>]*>Three<\/h5>/);
  assert.match(html, /<h6[^>]*>Four<\/h6>/);
  assert.match(html, /<h6[^>]*>Five<\/h6>/);
  assert.match(html, /<h6[^>]*>Six<\/h6>/);
});
