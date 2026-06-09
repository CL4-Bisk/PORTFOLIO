"use client";

import { animate, createScope, stagger } from "animejs";
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
    <footer ref={root} className="flex items-center justify-between px-8 py-10">
      <span className="footer-item font-mono text-sm opacity-0">APARICIO</span>
      <nav className="footer-item flex gap-6 text-sm opacity-0">
        <p>© footer</p>
      </nav>
    </footer>
  );
}
