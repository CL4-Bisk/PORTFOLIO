# Aparicio Portfolio

A work-in-progress developer portfolio built with Next.js App Router, React, TypeScript, Tailwind CSS, Anime.js, TanStack Query, GitHub repository data, public status assets, and a browser-based weather forecast widget.

The current build has a shared app shell, fixed header/footer, animated hero with a public status card, a persisted light/dark theme toggle, an About page, a GitHub-backed Projects index, static repository detail pages, safe GitHub README rendering, a geolocation weather card, static export configuration, and a GitHub Pages deployment workflow.

## Current Progress

### Completed

- [x] Created the App Router base with `src/app/layout.tsx`, `src/app/page.tsx`, `/about`, `/projects`, and `/projects/[owner]/[repo]`.
- [x] Moved the app shell into the root layout with shared `Header`, `Footer`, `Providers`, metadata, and a central `<main>` wrapper.
- [x] Wired global styling through `public/global/globals.css`.
- [x] Set up Tailwind CSS v4 theme tokens, custom dark variant support, semantic color tokens, selection styling, and reduced-motion CSS.
- [x] Added the shared React Query provider in `src/app/provider.tsx`.
- [x] Built the home page from `HeroIntro` and `Weather`.
- [x] Added hero CTAs, stack tags, and a public status card that reads `public/status.json`.
- [x] Added status SVG assets for available, busy, working, learning, and vacation states.
- [x] Added header navigation with active-route styling.
- [x] Added a light/dark theme toggle that stores the selected theme in `localStorage`.
- [x] Connected the theme toggle to base-path-safe bulb SVG assets under `public/assets/bulbs`.
- [x] Added scoped Anime.js entrance animations for the header, hero, footer, and hero dot accents.
- [x] Added reduced-motion handling for the animation setup.
- [x] Replaced the About placeholder with real portfolio copy, strengths, toolset chips, focus areas, and a Projects CTA.
- [x] Replaced the Projects placeholder with a GitHub-backed project board.
- [x] Split the Projects UI into focused card, contributor, formatter, detail, and README-rendering components.
- [x] Added consistent-height project cards with internal detail navigation, contributor credits, repository facts, and separate external Repository/Live actions.
- [x] Added static repository detail pages with `generateStaticParams`, `dynamicParams = false`, and per-project metadata.
- [x] Added GitHub README rendering with GitHub-flavored Markdown, heading slugs, tables, code blocks, safe links, and safe relative image/link resolution.
- [x] Added repository detail panels for visibility, default branch, contributors, last updated date, stars, forks, language breakdowns, latest release, and optional live links.
- [x] Added `src/libraries/github.ts` for GitHub API fetching, token support, username fallback, allowlisted repositories, repo deduping, archived/fork filtering, contributor loading, README loading, language breakdowns, release loading, and pushed-date sorting.
- [x] Added `src/libraries/project-routes.ts` for encoded detail paths, static params, and route lookup.
- [x] Added `src/libraries/readme.ts` for README URL safety and URL rebasing.
- [x] Added a weather card that auto-loads from browser geolocation, falls back to Iloilo coordinates, and uses current Open-Meteo field names.
- [x] Added loading placeholders, error messaging, and rounded weather metric values.
- [x] Added `.env.example` placeholders for weather and GitHub-backed project data.
- [x] Configured static export in `next.config.ts` with optional `NEXT_PUBLIC_BASE_PATH`, trailing slashes, unoptimized images, GitHub avatar remote patterns, React Compiler, and Turbopack root.
- [x] Added a GitHub Pages workflow in `.github/workflows/pages.yml` that builds with Node 22 and deploys `./out`.
- [x] Added implementation/design notes under `docs/superpowers` for the GitHub-first project detail feature.

### In Progress

- [ ] Footer is scaffolded, but final contact/social links are not added yet.
- [ ] Status is controlled by `public/status.json`, but there is no editing UI or documented status-change workflow yet.
- [ ] GitHub repository display depends on build-time environment variables and network/API availability.
- [ ] Local GitHub Pages base-path testing is supported in code, but `NEXT_PUBLIC_BASE_PATH` is not listed in `.env.example` yet.
- [ ] The global stylesheet currently lives in `public/global`; decide whether that should stay there or move back under `src`.
- [ ] Screenshots, search, filtering, and hand-written project case studies are deferred future decisions.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Anime.js 4
- TanStack Query
- GitHub REST API
- React Markdown
- Remark GFM
- Rehype Slug
- Browser Geolocation API
- Open-Meteo Forecast API
- GitHub Pages
- ESLint

## Project Structure

```txt
├── .github/
│   └── workflows/
│       └── pages.yml              GitHub Pages deployment workflow
├── public/
│   ├── assets/
│   │   ├── bulbs/
│   │   │   ├── bulb-filled-black.png
│   │   │   ├── bulb-filled-black.svg
│   │   │   ├── bulb-filled-yellow.png
│   │   │   ├── bulb-filled-yellow.svg
│   │   │   ├── bulb-outline-black.png
│   │   │   └── bulb-outline-black.svg
│   │   └── status/
│   │       ├── status-available.svg
│   │       ├── status-busy.svg
│   │       ├── status-learning.svg
│   │       ├── status-vacay.svg
│   │       └── status-working.svg
│   ├── global/
│   │   └── globals.css            Tailwind import and global theme tokens
│   ├── status.json                Public hero status config
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   └── page.tsx           About route
│   │   ├── projects/
│   │   │   ├── [owner]/
│   │   │   │   └── [repo]/
│   │   │   │       └── page.tsx   Static repository detail route
│   │   │   └── page.tsx           GitHub-backed Projects route
│   │   ├── favicon.ico
│   │   ├── layout.tsx             Root layout, app shell, metadata, and providers
│   │   ├── page.tsx               Home route
│   │   └── provider.tsx           Client providers
│   ├── components/
│   │   ├── about/
│   │   │   └── About.tsx          About page content
│   │   ├── footer/
│   │   │   └── Footer.tsx         Fixed footer section
│   │   ├── header/
│   │   │   └── Header.tsx         Fixed navigation and theme toggle
│   │   ├── projects/
│   │   │   ├── ContributorCredits.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── RepositoryReadme.tsx
│   │   │   └── project-formatters.ts
│   │   ├── weather/
│   │   │   └── Weather.tsx        Geolocation weather forecast card
│   │   └── HeroIntro.tsx          Animated hero and status card
│   └── libraries/
│       ├── github.ts              Server-only GitHub repository loader
│       ├── project-routes.ts      Project detail route helpers
│       └── readme.ts              README URL safety helpers
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Environment

Copy `.env.example` to `.env.local` for local values.

```txt
NEXT_PUBLIC_OPENMETEO_API_URL
GITHUB_USERNAME
GITHUB_ALLOWED_REPOS
GITHUB_TOKEN_PERSONAL
GITHUB_TOKEN_UPDIKO
GITHUB_TOKEN_TWOBIT_FORGE
```

`GITHUB_ALLOWED_REPOS` is a comma-separated `owner/repo` allowlist for the Projects page. If no allowlist is provided, the app tries token-backed repositories, then falls back to public repositories for `GITHUB_USERNAME`.

The GitHub Pages workflow sets `NEXT_PUBLIC_BASE_PATH=/PORTFOLIO` during deployment. Use the same variable locally only when testing the deployed subpath behavior.

## Deployment

The app is configured for static export:

- `next.config.ts` uses `output: "export"`.
- Build output is written to `out/`.
- Dynamic repository detail pages are generated at build time from `getGithubRepos()`.
- `next/image` is configured for static hosting with unoptimized output and GitHub avatar remote patterns.
- `.github/workflows/pages.yml` runs `npm ci`, `npm run build`, uploads `./out`, and deploys to GitHub Pages.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local site:

```txt
http://localhost:3000
```

Run linting:

```bash
npm run lint
```

Create a production static export:

```bash
npm run build
```

## Next Work

- [ ] Finish the footer with final contact links and social links.
- [ ] Document how to change `public/status.json` safely.
- [ ] Add `NEXT_PUBLIC_BASE_PATH` to `.env.example` if local GitHub Pages path testing becomes routine.
- [ ] Decide whether `public/global/globals.css` should stay in `public/global` or move back into `src/global`.
- [ ] Verify the GitHub Pages workflow after the next push to `main`.
- [ ] Decide whether to add search, filtering, screenshots, or hand-written case studies to Projects later.
