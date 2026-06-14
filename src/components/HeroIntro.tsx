// src/components/HeroIntro.tsx
"use client";

import { animate, createScope, stagger } from "animejs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
type StatusKey = "available" | "busy" | "working" | "learning" | "vacay";
type StatusDetail = {
  label: string;
  value: string;
};
type StatusContent = {
  label: string;
  shortLabel: string;
  image: string;
  imageAlt: string;
  summary: string;
  glow: string;
  dot: string;
  active: string;
  details: StatusDetail[];
};

const defaultStatus: StatusKey = "available";
const stack = ["Next.js", "React", "TypeScript", "APIs", "UI Systems"];
const statusOptions = {
  available: {
    label: "Available to build",
    shortLabel: "Build",
    image: "/assets/status/status-available.svg",
    imageAlt: "Light bulb with a check mark",
    summary: "Open for portfolio work, useful tools, and clean web apps.",
    glow: "drop-shadow-[0_0_22px_rgba(216,165,25,0.45)]",
    dot: "bg-accent",
    active: "border-accent bg-accent-soft text-accent-strong",
    details: [
      { label: "Current focus", value: "New builds and portfolio polish" },
      { label: "Reply pace", value: "Fast when the brief is clear" },
      { label: "Energy", value: "Ready to ship" },
    ],
  },
  busy: {
    label: "Busy",
    shortLabel: "Busy",
    image: "/assets/status/status-busy.svg",
    imageAlt: "Calendar with a busy marker",
    summary: "Queued up with commitments and slower replies.",
    glow: "drop-shadow-[0_0_20px_rgba(240,138,172,0.35)]",
    dot: "bg-accent-alt",
    active: "border-accent-alt bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-200",
    details: [
      { label: "Current focus", value: "Deadlines and queued tasks" },
      { label: "Reply pace", value: "Slower than usual" },
      { label: "Energy", value: "Low bandwidth" },
    ],
  },
  working: {
    label: "Working",
    shortLabel: "Work",
    image: "/assets/status/status-working.svg",
    imageAlt: "Laptop with code brackets",
    summary: "In implementation mode, building and debugging.",
    glow: "drop-shadow-[0_0_20px_rgba(39,124,104,0.35)]",
    dot: "bg-emerald-500",
    active: "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200",
    details: [
      { label: "Current focus", value: "Implementation and fixes" },
      { label: "Reply pace", value: "Best after a work block" },
      { label: "Energy", value: "Deep work" },
    ],
  },
  learning: {
    label: "Learning",
    shortLabel: "Learn",
    image: "/assets/status/status-learning.svg",
    imageAlt: "Open book with a graduation cap",
    summary: "Studying docs, patterns, and experiments.",
    glow: "drop-shadow-[0_0_20px_rgba(216,165,25,0.3)]",
    dot: "bg-yellow-500",
    active: "border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200",
    details: [
      { label: "Current focus", value: "Research and practice" },
      { label: "Reply pace", value: "Available between sessions" },
      { label: "Energy", value: "Building range" },
    ],
  },
  vacay: {
    label: "Vacay",
    shortLabel: "Vacay",
    image: "/assets/status/status-vacay.svg",
    imageAlt: "Sun and beach umbrella",
    summary: "Offline or resting, back after the break.",
    glow: "drop-shadow-[0_0_22px_rgba(119,210,178,0.35)]",
    dot: "bg-teal-400",
    active: "border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-950/30 dark:text-teal-200",
    details: [
      { label: "Current focus", value: "Rest and reset" },
      { label: "Reply pace", value: "Mostly offline" },
      { label: "Energy", value: "Recharging" },
    ],
  },
} satisfies Record<StatusKey, StatusContent>;

const statusKeys = Object.keys(statusOptions) as StatusKey[];

export function HeroIntro() {
  const root = useRef<HTMLElement | null>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const [statusKey, setStatusKey] = useState<StatusKey>(defaultStatus);
  const status = statusOptions[statusKey];

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
          <div className="grid gap-5 border-b border-line pb-5 sm:grid-cols-[minmax(0,1fr)_6rem] sm:items-center">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold uppercase text-muted">
                Status
              </p>
              <h2 className="mt-2 text-2xl font-semibold" aria-live="polite">
                {status.label}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {status.summary}
              </p>
            </div>
            <div className="grid size-24 place-items-center rounded-lg border border-line bg-panel-muted">
              <Image
                src={`${basePath}${status.image}`}
                alt={status.imageAlt}
                width={80}
                height={80}
                className={`size-20 ${status.glow}`}
              />
            </div>
          </div>

          <div
            aria-label="Choose status"
            className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {statusKeys.map((key) => {
              const option = statusOptions[key];
              const isSelected = key === statusKey;

              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setStatusKey(key)}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    isSelected
                      ? option.active
                      : "border-line bg-panel text-muted hover:border-accent hover:bg-panel-muted hover:text-foreground"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full ${option.dot}`}
                  />
                  {option.shortLabel}
                </button>
              );
            })}
          </div>

          <dl className="mt-5 space-y-4">
            {status.details.map((detail) => (
              <div
                key={detail.label}
                className="grid gap-1 border-b border-line pb-4 last:border-b-0 last:pb-0"
              >
                <dt className="text-sm text-muted">{detail.label}</dt>
                <dd className="font-medium text-foreground">{detail.value}</dd>
              </div>
            ))}
          </dl>

          <div className="hero-item mt-6 flex gap-2 opacity-0">
            {statusKeys.slice(0, 5).map((key) => (
              <span
                key={key}
                className={`hero-dot size-2.5 rounded-full ${statusOptions[key].dot}`}
              />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
