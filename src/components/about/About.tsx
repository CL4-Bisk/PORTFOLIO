import Link from "next/link";

const strengths = [
  "App Router structure with client/server boundaries",
  "API-backed features with typed data flow",
  "Responsive interfaces that stay readable on small screens",
  "Practical debugging across local builds, browser behavior, and deployment",
];

const toolset = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "TanStack Query",
  "GitHub APIs",
  "Anime.js",
  "Open-Meteo",
];

const focusAreas = [
  { label: "Frontend", value: "Accessible layouts, motion, and design systems" },
  { label: "Backend", value: "Data fetching, API integration, and build-safe code" },
  { label: "Workflow", value: "Validation with linting, types, builds, and browser checks" },
];

export default function About() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div>
          <p className="font-mono text-sm font-semibold uppercase text-accent">
            About
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-balance sm:text-5xl">
            I build full-stack web apps with a focus on clarity, reliability,
            and usable interfaces.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
            My work sits between implementation and design: connecting data,
            shaping responsive UI, and keeping the codebase understandable
            enough to keep improving.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {strengths.map((strength) => (
              <article
                key={strength}
                className="rounded-lg border border-line bg-panel p-5 shadow-sm"
              >
                <span className="block size-2.5 rounded-full bg-accent" />
                <p className="mt-4 text-sm leading-6 text-foreground">
                  {strength}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-line bg-panel p-5 shadow-sm">
          <p className="font-mono text-xs font-semibold uppercase text-muted">
            Working Set
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {toolset.map((tool) => (
              <span
                key={tool}
                className="rounded-md border border-line bg-panel-muted px-3 py-1.5 text-sm text-foreground"
              >
                {tool}
              </span>
            ))}
          </div>

          <dl className="mt-6 space-y-4">
            {focusAreas.map((area) => (
              <div
                key={area.label}
                className="border-t border-line pt-4 first:border-t-0 first:pt-0"
              >
                <dt className="text-sm text-muted">{area.label}</dt>
                <dd className="mt-2 font-medium leading-6">{area.value}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/projects"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition hover:bg-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            See Project Work
          </Link>
        </aside>
      </div>
    </section>
  );
}
