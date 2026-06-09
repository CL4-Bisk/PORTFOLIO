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
        <div className="hero-item flex items-center justify-between opacity-0">
            <span className="font-mono text-sm">APARICIO</span>
            <nav className="flex gap-6 text-sm">
                <p>© footer</p>
            </nav>
        </div>
    )
}