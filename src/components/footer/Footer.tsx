"use client";

import { animate, createScope, stagger } from "animejs";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function Footer() {
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

      animate(".footer-item", {
        y: [24, 0],
        opacity: [0, 1],
        duration,
        delay: stagger(90),
        ease: "out(3)",
      });
    });

    return () => {
      scope.current?.revert();
      scope.current = null;
    };
  }, []);

  return (
    <footer
      ref={root}
      className="fixed bottom-0 left-0 z-50 w-full border-t border-line bg-background/95 px-4 py-3 backdrop-blur sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link
          href="/"
          className="footer-item font-mono text-xs font-semibold uppercase text-foreground opacity-0"
        >
          APARICIO
        </Link>
        <div className="footer-item flex items-center gap-3 text-xs text-muted opacity-0 sm:gap-5">
          <p>CL4-Bisk</p>
          <p>Developer Portfolio</p>
          <p>2026</p>
        </div>
      </div>
    </footer>
  );
}
