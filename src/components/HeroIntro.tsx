// src/components/HeroIntro.tsx
"use client";

import { animate, createScope, stagger } from "animejs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const stack = ["Next.js", "React", "TypeScript", "APIs", "UI Systems"];
const signals = [
  { label: "Current focus", value: "Practical full-stack interfaces" },
  { label: "Build style", value: "Clean, typed, and shippable" },
  { label: "Project mix", value: "Portfolio work, coursework, tools" },
];

export function HeroIntro() {
  const root = useRef<HTMLElement | null>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!root.current) return;

    scope.current = createScope({
      root: root.current,
      mediaQueries: {
        reducedMotion: "(prefers-reduced-motion: reduce)",
      },
    }).add((self) => {
      const duration = self?.matches.reducedMotion ? 0 : 700;

      animate(".hero-item", {
        y: [24, 0],
        opacity: [0, 1],
        duration,
        delay: stagger(90),
        ease: "out(3)",
      });

      animate(".hero-dot", {
        scale: [0, 1],
        rotate: ["-0.25turn", 0],
        duration,
        delay: stagger(80),
        ease: "outBack",
      });
    });

    return () => {
      scope.current?.revert();
      scope.current = null;
    };
  }, []);

  return (
    <section ref={root} className="px-4 pb-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[48dvh] max-w-6xl gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
        <div className="max-w-3xl">
          <p className="hero-item font-mono text-sm font-semibold uppercase text-accent opacity-0">
            Developer Portfolio
          </p>
          <h1 className="hero-item mt-4 text-5xl font-semibold text-balance opacity-0 sm:text-6xl">
            Aparicio
          </h1>
          <p className="hero-item mt-5 max-w-2xl text-lg leading-8 text-muted opacity-0 sm:text-xl">
            Full-stack developer building clean, useful web apps with React,
            Next.js, APIs, and practical interface design.
          </p>

          <div className="hero-item mt-8 flex flex-wrap gap-3 opacity-0">
            <Link
              href="/projects"
              className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition hover:bg-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              View Projects
            </Link>
            <Link
              href="/about"
              className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-panel px-4 text-sm font-medium text-foreground transition hover:border-accent hover:bg-accent-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              About Me
            </Link>
          </div>

          <div className="hero-item mt-8 flex flex-wrap gap-2 opacity-0">
            {stack.map((item) => (
              <span
                key={item}
                className="rounded-md border border-line bg-panel px-3 py-1.5 text-sm text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="hero-item rounded-lg border border-line bg-panel p-4 opacity-0 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="font-mono text-xs font-semibold uppercase text-muted">
                Status
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Available to build</h2>
            </div>
            <Image
              src={`${basePath}/assets/bulbs/bulb-filled-yellow.svg`}
              alt=""
              width={48}
              height={48}
              className="size-12 drop-shadow-[0_0_18px_rgba(216,165,25,0.35)]"
            />
          </div>

          <dl className="mt-5 hidden space-y-4 sm:block">
            {signals.map((signal) => (
              <div
                key={signal.label}
                className="grid gap-1 border-b border-line pb-4 last:border-b-0 last:pb-0"
              >
                <dt className="text-sm text-muted">{signal.label}</dt>
                <dd className="font-medium text-foreground">{signal.value}</dd>
              </div>
            ))}
          </dl>

          <div className="hero-item mt-6 hidden gap-2 opacity-0 sm:flex">
            <span className="hero-dot size-2.5 rounded-full bg-accent" />
            <span className="hero-dot size-2.5 rounded-full bg-accent-alt" />
            <span className="hero-dot size-2.5 rounded-full bg-accent-warm" />
          </div>
        </aside>
      </div>
    </section>
  );
}
