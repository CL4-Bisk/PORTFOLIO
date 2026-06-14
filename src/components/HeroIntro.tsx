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
  image: string;
  imageAlt: string;
  summary: string;
  glow: string;
  dot: string;
  details: StatusDetail[];
};
type PublicStatusConfig = {
  status?: unknown;
};

const defaultStatus: StatusKey = "available";
const stack = ["Next.js", "React", "TypeScript", "APIs", "UI Systems"];
const statusOptions = {
  available: {
    label: "Available to build",
    image: "/assets/status/status-available.svg",
    imageAlt: "Light bulb with a check mark",
    summary: "Open for portfolio work, useful tools, and clean web apps.",
    glow: "drop-shadow-[0_0_22px_rgba(216,165,25,0.45)]",
    dot: "bg-accent",
    details: [
      { label: "Current focus", value: "New builds and portfolio polish" },
      { label: "Reply pace", value: "Fast when the brief is clear" },
      { label: "Energy", value: "Ready to ship" },
    ],
  },
  busy: {
    label: "Busy",
    image: "/assets/status/status-busy.svg",
    imageAlt: "Calendar with a busy marker",
    summary: "Queued up with commitments and slower replies.",
    glow: "drop-shadow-[0_0_20px_rgba(240,138,172,0.35)]",
    dot: "bg-accent-alt",
    details: [
      { label: "Current focus", value: "Deadlines and queued tasks" },
      { label: "Reply pace", value: "Slower than usual" },
      { label: "Energy", value: "Low bandwidth" },
    ],
  },
  working: {
    label: "Working",
    image: "/assets/status/status-working.svg",
    imageAlt: "Laptop with code brackets",
    summary: "In implementation mode, building and debugging.",
    glow: "drop-shadow-[0_0_20px_rgba(39,124,104,0.35)]",
    dot: "bg-emerald-500",
    details: [
      { label: "Current focus", value: "Company work, implementation and fixes" },
      { label: "Reply pace", value: "Best after a work block" },
      { label: "Energy", value: "Deep work" },
    ],
  },
  learning: {
    label: "Learning",
    image: "/assets/status/status-learning.svg",
    imageAlt: "Open book with a graduation cap",
    summary: "Studying docs, patterns, and experiments.",
    glow: "drop-shadow-[0_0_20px_rgba(216,165,25,0.3)]",
    dot: "bg-yellow-500",
    details: [
      { label: "Current focus", value: "Research and practice, aiming to graduate college" },
      { label: "Reply pace", value: "Available between sessions" },
      { label: "Energy", value: "Building range" },
    ],
  },
  vacay: {
    label: "On Vacation",
    image: "/assets/status/status-vacay.svg",
    imageAlt: "Sun and beach umbrella",
    summary: "Offline or resting, back after the break.",
    glow: "drop-shadow-[0_0_22px_rgba(119,210,178,0.35)]",
    dot: "bg-teal-400",
    details: [
      { label: "Current focus", value: "Rest and reset" },
      { label: "Reply pace", value: "Mostly offline" },
      { label: "Energy", value: "Recharging" },
    ],
  },
} satisfies Record<StatusKey, StatusContent>;

const statusKeys = Object.keys(statusOptions) as StatusKey[];
const publicStatusPath = `${basePath}/status.json`;

function isStatusKey(value: unknown): value is StatusKey {
  return typeof value === "string" && value in statusOptions;
}

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

  useEffect(() => {
    let isActive = true;

    async function loadPublicStatus() {
      try {
        const response = await fetch(publicStatusPath, { cache: "no-store" });

        if (!response.ok) return;

        const config = (await response.json()) as PublicStatusConfig;

        if (isActive && isStatusKey(config.status)) {
          setStatusKey(config.status);
        }
      } catch {
        // Keep the default status if the public JSON file is unavailable.
      }
    }

    void loadPublicStatus();

    return () => {
      isActive = false;
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
