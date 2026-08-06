# Project Card Consistency and GitHub-First Detail Pages

**Date:** August 5, 2026
**Status:** Approved for implementation

## Context

The Projects page currently renders GitHub-backed repositories as cards. Each card has a minimum height, but repository names, descriptions, contributor credits, and metadata can consume different amounts of space. This makes the grid visually uneven and creates pressure to place increasingly detailed information inside each card.

The portfolio is a Next.js App Router application exported as static files and hosted on GitHub Pages. Repository and contributor data are resolved at build time. The existing contributor experience must remain: bots and unusable profiles are filtered, the portfolio owner is retained when applicable, and compact avatar overflow is shown instead of hiding contributors.

## Goals

1. Make every project card use the same visual structure and predictable height.
2. Keep cards concise without a card-level “See more” expansion.
3. Give every displayed repository a shareable internal detail page.
4. Make the repository README the primary detail-page content.
5. Show only automatic, verifiable GitHub information; do not infer a project story, personal role, focus, or development status.
6. Preserve static export, GitHub Pages base-path support, contributor attribution, keyboard access, and mobile usability.
7. Never write private README, code-derived language data, or release content into the public static export.

## Non-goals

- No modal or intercepted-route overlay in this version.
- No hand-written case studies or per-project role labels.
- No inferred labels such as “Active,” “Completed,” or “Paused.”
- No inline expansion of long card descriptions.
- No comments, reactions, repository management, or GitHub write operations.
- GitHub Packages integration is deferred because package ownership is user- or organization-scoped and cannot be mapped to every repository consistently.

## Chosen Experience

### Project grid

The Projects page remains a responsive one-, two-, or three-column grid. Each card uses the same internal row structure so that the title area, three-line description, contributor area, repository metadata, and action area align consistently.

Repository descriptions are clamped to three lines. The complete description and README are available from the internal detail page, so the card does not use a “See more” toggle. Missing descriptions use the existing neutral fallback copy and occupy the same description slot.

The card’s primary interaction opens `/projects/[owner]/[repo]/`. Repository and Live actions remain separate external links. The implementation must not nest interactive elements: a stretched internal detail link may cover the non-action portion of the card while external actions remain independently focusable above it.

Each card displays:

- repository owner and name;
- public/private visibility;
- a description clamped to three lines;
- the existing compact contributor-credit treatment;
- primary language, last-updated date, stars, and forks;
- a clear “View repository details” affordance;
- Repository and Live links when available.

The current README link is removed from the card because the internal detail page becomes the portfolio-native README destination.

### Repository detail page

The detail page is GitHub-first rather than a case study. It uses a wide reading column for the README and a narrower repository-information column. On small screens, the layout becomes a single column without an internal scrolling region.

The header contains:

- owner and repository name;
- GitHub repository description;
- Repository and Live actions;
- visibility;
- default branch;
- contributor count;
- last-updated date.

The main column renders the complete README. A small label makes its source explicit: “Synced from GitHub.” Raw HTML in README files is not rendered. GitHub-flavored Markdown is supported, including headings, lists, tables, task lists, links, images, and code blocks.

Relative README links are rebased to the repository’s default branch on GitHub. Relative README images are rebased to the corresponding raw GitHub content URL. Only safe `http` and `https` destinations are rendered as external links or images.

The side column contains:

- stars and forks;
- language percentages calculated from GitHub’s byte totals;
- the existing contributor avatar stack and contributor count;
- latest release information when GitHub returns a release;
- the repository homepage as the deployment/live-site destination when present.

Optional sections are omitted when data is absent. The page does not display claims such as “No packages published” unless the application can verify that claim from a reliable repository-level source.

Private repositories receive a metadata-only detail page using fields that are already intentionally displayed on the project card. README, language, and release enrichment requests are skipped for private repositories so that additional private content cannot be written into the public static export.

## Data Contract

`PortfolioRepo` is expanded with detail-page fields while keeping the card fields stable:

- `readmeMarkdown: string | null`
- `readmePath: string | null`
- `languageBreakdown: Array<{ name: string; bytes: number; percentage: number }>`
- `latestRelease: { name: string; tagName: string; publishedAt: string; url: string } | null`

The existing fields continue to supply visibility, default branch, contributors, stars, forks, description, homepage, and pushed date.

Public-repository data is fetched read-only during the static build:

- repository metadata from GitHub’s repository endpoint;
- contributors from the existing contributors endpoint;
- README Markdown and its repository path from the repository README endpoint, decoding its base64 content so relative links can be resolved correctly;
- languages from the repository languages endpoint;
- latest release from the latest-release endpoint.

Secondary fetches are isolated so an unavailable README, languages response, or release does not discard otherwise valid repository metadata.

For a private repository, all three enrichment fields use their empty values and the enrichment endpoints are never called.

## Architecture and Components

The current `Projects.tsx` file should be split only where the new feature creates clear responsibilities:

- `Projects.tsx` owns the page introduction, aggregate statistics, empty state, and grid.
- `ProjectCard.tsx` owns one consistent card and its accessible navigation behavior.
- `ProjectDetail.tsx` owns the detail-page header and two-column layout.
- `RepositoryReadme.tsx` owns safe Markdown rendering and relative URL rewriting.
- `github.ts` owns GitHub requests and mapping to the portfolio data contract.
- `src/app/projects/[owner]/[repo]/page.tsx` statically generates repository detail routes and per-project metadata.

`generateStaticParams` derives route parameters from the same displayed repository list used by `/projects`. This keeps cards and generated detail routes synchronized and satisfies static-export requirements. Internal navigation uses Next.js links so the configured GitHub Pages base path is preserved.

```mermaid
flowchart LR
    G[GitHub REST API] --> L[github.ts loader]
    L --> R[PortfolioRepo data]
    R --> P[/projects grid]
    R --> D[/projects/owner/repo detail]
    D --> M[Safe README renderer]
```

## Data and Navigation Flow

1. `next build` loads the configured repositories.
2. Core repository metadata is mapped first.
3. Contributor, README, language, and release requests enrich each public repository independently; README, language, and release enrichment is skipped for private repositories.
4. `/projects` renders the compact card representation.
5. `generateStaticParams` creates one detail route for every displayed repository.
6. Selecting a card navigates to its generated detail page.
7. Rebuilding and redeploying refreshes repository details because GitHub data is build-time data in this static site.

## Missing Data and Failure Handling

- If the repository list is empty, the existing Projects empty state remains.
- If a README is missing or unavailable, the detail page shows a compact “README unavailable” state with a Repository link.
- If a repository is private, its detail page explicitly says that private repository content is not published and does not render README, language, or release data.
- If languages are unavailable, the language section is omitted.
- If no release exists, the release section is omitted.
- If no homepage exists, the Live action and deployment row are omitted.
- If contributor fetching fails, the page remains usable without a contributor section.
- If a repository is not part of the generated repository list, no detail route is emitted for it.
- External GitHub, contributor, release, and live-site links open safely with `noopener`/`noreferrer` behavior.

## Accessibility and Responsive Behavior

- Cards expose a meaningful internal detail link without nested links or buttons.
- Repository and Live actions remain independently reachable by keyboard.
- Focus indicators use the existing accent color.
- Detail pages preserve a logical heading hierarchy and include a Back to Projects link.
- Code blocks and wide README tables may scroll horizontally within their own content area; the page itself does not create horizontal overflow.
- Contributor avatars retain accessible profile labels; decorative avatar images use empty alternative text.
- The layout stacks into one column on smaller screens, with repository facts preceding or following the README according to the final component order.
- Reduced-motion preferences continue to disable nonessential movement.

## Testing and Validation

### Pure data tests

- contributor filtering and owner prioritization continue to pass;
- language byte totals convert to stable percentages and handle a zero total;
- README relative links and images resolve against the correct owner, repository, and default branch;
- unsafe README URL schemes are rejected;
- missing README, language, and release responses map to empty optional fields without rejecting the repository.
- private repositories never call README, language, or release enrichment helpers.

### UI checks

- cards remain equal in structure with short, long, and missing descriptions;
- long owner and repository names wrap without changing the action layout;
- the entire non-action card surface opens the detail page;
- Repository and Live links do not trigger internal navigation;
- keyboard focus order is logical on cards and detail pages;
- the detail layout works at mobile, tablet, and desktop widths;
- long README content, tables, code blocks, images, and headings render without page-level overflow.

### Repository validation

- focused Node tests for pure GitHub/README helpers;
- ESLint for changed source files;
- TypeScript checking through the Next.js build;
- a production `next build` using a Node version supported by Next.js 16;
- direct inspection of `out/projects/index.html` and at least one generated `out/projects/[owner]/[repo]/index.html`;
- a local static preview confirming HTTP 200 for the Projects page and one repository detail route, including GitHub Pages base-path behavior.

## Acceptance Criteria

- All project cards use the same visual slots and consistent height at each responsive breakpoint.
- Card descriptions never exceed three visible lines.
- Every displayed repository links to a statically generated internal detail page.
- The detail page contains no project-story, personal-role, focus, team-status, or inferred activity labels.
- The README is the primary content and is rendered safely from GitHub Markdown.
- Private repository detail pages never include README, language breakdowns, or release content in the static artifact.
- Repository facts, language percentages, contributors, optional release information, and the optional live link are GitHub-derived.
- Missing optional GitHub data does not fail the entire Projects build.
- Existing contributor attribution behavior is preserved.
- Static export and GitHub Pages base-path navigation work in the production artifact.

## Implementation Boundary

This design is one implementation slice: consistent cards, enriched read-only GitHub data, and static repository detail pages. Search, filtering, screenshots, hand-written case studies, GitHub Packages, and route-intercepting modals are separate future decisions.
