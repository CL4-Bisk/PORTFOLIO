# Aparicio Portfolio

A work-in-progress developer portfolio built with Next.js App Router, React, TypeScript, Tailwind CSS, Anime.js, TanStack Query, GitHub repository data, public status assets, and a browser-based weather forecast widget.

The current build has a shared app shell, fixed header/footer, animated hero with a public status card, a persisted light/dark theme toggle, an About page, a GitHub-backed Projects page, a geolocation weather card, static export configuration, and a GitHub Pages deployment workflow.

## Current Progress

### Completed

- [x] Created the App Router base with `src/app/layout.tsx`, `src/app/page.tsx`, `/about`, and `/projects`.
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
- [x] Added repository stats, language styling, live/repository/README links, and an empty state for projects.
- [x] Added `src/libraries/github.ts` for GitHub API fetching, token support, username fallback, allowlisted repositories, repo deduping, archived/fork filtering, and pushed-date sorting.
- [x] Added a weather card that auto-loads from browser geolocation, falls back to Iloilo coordinates, and uses current Open-Meteo field names.
- [x] Added loading placeholders, error messaging, and rounded weather metric values.
- [x] Added `.env.example` placeholders for weather and GitHub-backed project data.
- [x] Configured static export in `next.config.ts` with optional `NEXT_PUBLIC_BASE_PATH`, trailing slashes, unoptimized images, React Compiler, and Turbopack root.
- [x] Added a GitHub Pages workflow in `.github/workflows/pages.yml` that builds with Node 22 and deploys `./out`.

### In Progress

- [ ] Footer is scaffolded, but final contact/social links are not added yet.
- [ ] Project cards are GitHub-backed, but screenshots and richer hand-written case-study notes are not added yet.
- [ ] Status is controlled by `public/status.json`, but there is no editing UI or documented status-change workflow yet.
- [ ] GitHub repository display depends on build-time environment variables and network/API availability.
- [ ] Local GitHub Pages base-path testing is supported in code, but `NEXT_PUBLIC_BASE_PATH` is not listed in `.env.example` yet.
- [ ] The global stylesheet currently lives in `public/global`; decide whether that should stay there or move back under `src`.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Anime.js 4
- TanStack Query
- GitHub REST API
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
│   │   │   └── Projects.tsx       GitHub project board UI
│   │   ├── weather/
│   │   │   └── Weather.tsx        Geolocation weather forecast card
│   │   └── HeroIntro.tsx          Animated hero and status card
│   └── libraries/
│       └── github.ts              Server-only GitHub repository loader
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
- Images are configured with `unoptimized: true` for static hosting.
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
- [ ] Add screenshots or curated case-study notes to project cards.
- [ ] Document how to change `public/status.json` safely.
- [ ] Add `NEXT_PUBLIC_BASE_PATH` to `.env.example` if local GitHub Pages path testing becomes routine.
- [ ] Decide whether `public/global/globals.css` should stay in `public/global` or move back into `src/global`.
- [ ] Verify the GitHub Pages workflow after the next push to `main`.
