# Aparicio Portfolio

A work-in-progress developer portfolio built with Next.js App Router, React, TypeScript, Tailwind CSS, and Anime.js.

The current build focuses on establishing the portfolio structure, animated landing experience, route organization, and shared app setup before filling in final project and about-page content.

## Current Progress

### Completed

- [x] Created the App Router base with `src/app/layout.tsx` and `src/app/page.tsx`.
- [x] Added route pages for `/about` and `/projects`.
- [x] Wired global styling through `src/global/globals.css`.
- [x] Set up Tailwind CSS v4 theme tokens, font stacks, and light/dark system preference support.
- [x] Added the shared React Query provider in `src/app/provider.tsx`.
- [x] Built the home page from separate `Header`, `HeroIntro`, and `Footer` components.
- [x] Added header navigation for Home, Projects, and About.
- [x] Added scoped Anime.js entrance animations for the header, hero, footer, and hero dot accents.
- [x] Added reduced-motion handling for the animation setup.

### In Progress

- [ ] `/about` route exists, but the page still uses placeholder content.
- [ ] `/projects` route exists, but the page still uses placeholder content.
- [ ] Footer is scaffolded, but final contact/social links are not added yet.
- [ ] Weather component file exists as a placeholder and is not wired into the UI yet.
- [ ] Public visual assets are available, including bulb SVG/PNG files, but are not fully integrated into the page design yet.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Anime.js 4
- TanStack Query
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
│   ├── layout.tsx           Root layout and global providers
│   ├── page.tsx             Home route
│   └── provider.tsx         Client providers
├── components/
│   ├── about/
│   │   └── About.tsx        About page content
│   ├── footer/
│   │   └── Footer.tsx       Footer section
│   ├── header/
│   │   └── Header.tsx       Site navigation
│   ├── projects/
│   │   └── Projects.tsx     Projects page content
│   ├── weather/
│   │   └── weather.tsx      Weather component placeholder
│   └── HeroIntro.tsx        Animated hero section
└── global/
    └── globals.css          Tailwind import and global theme tokens

public/
├── bulbs/
│   ├── bulb-filled-black.png
│   ├── bulb-filled-black.svg
│   ├── bulb-filled-yellow.png
│   ├── bulb-filled-yellow.svg
│   ├── bulb-outline-black.png
│   └── bulb-outline-black.svg
├── file.svg
├── globe.svg
├── next.svg
├── vercel.svg
└── window.svg
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
- [ ] Replace the Projects placeholder with project cards, links, descriptions, and screenshots.
- [ ] Finish the footer with contact links and social links.
- [ ] Decide whether the weather widget belongs in the portfolio experience, then implement or remove the unused placeholder.
- [ ] Improve metadata in `src/app/layout.tsx` so the title and description match the final portfolio.
- [ ] Integrate the bulb assets into the visual system if they remain part of the intended design direction.
