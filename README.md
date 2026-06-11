# Aparicio Portfolio

A work-in-progress developer portfolio built with Next.js App Router, React, TypeScript, Tailwind CSS, Anime.js, TanStack Query, and a browser-based weather forecast widget.

The current build now has the main app shell, fixed header/footer layout, animated landing content, a persisted light/dark theme toggle, a weather card with geolocation fallback, and scaffolded About and Projects routes.

## Current Progress

### Completed

- [x] Created the App Router base with `src/app/layout.tsx` and `src/app/page.tsx`.
- [x] Added route pages for `/about` and `/projects`.
- [x] Moved the app shell into the root layout with shared `Header`, `Footer`, `Providers`, and a central `<main>` wrapper.
- [x] Wired global styling through `public/global/globals.css`.
- [x] Set up Tailwind CSS v4 theme tokens, custom dark variant support, font stacks, and scrollbar hiding.
- [x] Added the shared React Query provider in `src/app/provider.tsx`.
- [x] Built the home page from `Weather` and `HeroIntro` sections.
- [x] Added header navigation for Home, Projects, and About.
- [x] Added a light/dark theme toggle that stores the selected theme in `localStorage`.
- [x] Connected the theme toggle to bulb SVG assets under `public/assets/bulbs`.
- [x] Added scoped Anime.js entrance animations for the header, hero, footer, and hero dot accents.
- [x] Added reduced-motion handling for the animation setup.
- [x] Added a weather card that uses browser geolocation, Open-Meteo forecast data, and an Iloilo fallback location.
- [x] Added `.env.example` placeholders for the weather API URL and future GitHub-related values.

### In Progress

- [ ] `/about` route exists, but the page still uses placeholder content.
- [ ] `/projects` route exists, but the page still uses placeholder content.
- [ ] Footer is scaffolded, but final contact/social links are not added yet.
- [ ] Weather is wired into the home page, but the final placement and visual design can still be polished.
- [ ] GitHub-related environment placeholders exist, but GitHub data is not yet connected to the UI.
- [ ] Metadata title is updated, but the description still needs final portfolio copy.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Anime.js 4
- TanStack Query
- Browser Geolocation API
- Open-Meteo forecast API
- ESLint

## Project Structure

```txt
src/
├── app/
│   ├── about/
│   │   └── page.tsx         About route
│   ├── projects/
│   │   └── page.tsx         Projects route
│   ├── favicon.ico
│   ├── layout.tsx           Root layout, app shell, metadata, and providers
│   ├── page.tsx             Home route
│   └── provider.tsx         Client providers
├── components/
│   ├── about/
│   │   └── About.tsx        About page content placeholder
│   ├── footer/
│   │   └── Footer.tsx       Fixed footer section
│   ├── header/
│   │   └── Header.tsx       Fixed navigation and theme toggle
│   ├── projects/
│   │   └── Projects.tsx     Projects page content placeholder
│   ├── weather/
│   │   └── Weather.tsx      Geolocation weather forecast card
│   └── HeroIntro.tsx        Animated hero section

public/
├── assets/
│   └── bulbs/
│       ├── bulb-filled-black.png
│       ├── bulb-filled-black.svg
│       ├── bulb-filled-yellow.png
│       ├── bulb-filled-yellow.svg
│       ├── bulb-outline-black.png
│       └── bulb-outline-black.svg
├── global/
│   └── globals.css          Tailwind import and global theme tokens
├── file.svg
├── globe.svg
├── next.svg
├── vercel.svg
└── window.svg
```

## Environment

The app can run without custom environment values because the weather component falls back to the default Open-Meteo endpoint.

Optional values are listed in `.env.example`:

```txt
NEXT_PUBLIC_OPENMETEO_API_URL
GITHUB_USERNAME
GITHUB_TOKEN_PERSONAL
GITHUB_TOKEN_UPDIKO
GITHUB_TOKEN_TWOBIT_FORGE
```

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

Create a production build:

```bash
npm run build
```

## Next Work

- [ ] Replace the About placeholder with a real personal introduction, skills summary, and current focus.
- [ ] Replace the Projects placeholder with project cards, links, descriptions, screenshots, and repository links.
- [ ] Finish the footer with final contact links and social links.
- [ ] Improve metadata in `src/app/layout.tsx` so the description matches the final portfolio.
- [ ] Polish the weather card layout, loading state, and error state.
- [ ] Connect GitHub environment values to project or contribution data if that feature remains part of the plan.
- [ ] Decide whether `public/global/globals.css` should stay in `public/global` or move back into `src/global` for source organization.
