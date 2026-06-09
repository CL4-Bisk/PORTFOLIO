// src/components/HeroIntro.tsx
"use client";

import { animate, createScope, stagger } from "animejs";
import { useEffect, useRef } from "react";

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
    <section ref={root} className="min-h-screen px-8 py-10">
      <main className="mt-28 max-w-3xl">
        <p className="hero-item opacity-0 text-sm uppercase">Portfolio</p>
        <h1 className="hero-item opacity-0 mt-4 text-5xl font-semibold">
          Full-stack developer building clean, useful web apps.
        </h1>
        <p className="hero-item opacity-0 mt-6 text-lg text-neutral-500">
          I work with React, Next.js, APIs, and practical interfaces.
        </p>

        <div className="hero-item mt-8 flex gap-3 opacity-0">
          <span className="hero-dot h-3 w-3 rounded-full bg-foreground" />
          <span className="hero-dot h-3 w-3 rounded-full bg-neutral-500" />
          <span className="hero-dot h-3 w-3 rounded-full bg-neutral-300" />
        </div>
      </main>
    </section>
  );
}
