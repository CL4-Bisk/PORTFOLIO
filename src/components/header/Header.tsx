"use client";

import { animate, createScope, stagger } from "animejs";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "themechange";

const getSavedTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;

  return null;
};

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getThemeSnapshot = (): Theme => getSavedTheme() ?? getSystemTheme();
const getServerThemeSnapshot = (): Theme => "light";

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
};

const subscribeToTheme = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => onStoreChange();

  media.addEventListener("change", handleChange);
  window.addEventListener("storage", handleChange);
  window.addEventListener(THEME_CHANGE_EVENT, handleChange);

  return () => {
    media.removeEventListener("change", handleChange);
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(THEME_CHANGE_EVENT, handleChange);
  };
};

const saveTheme = (theme: Theme) => {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
};

export function Header() {
  const root = useRef<HTMLElement | null>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    saveTheme(nextTheme);
  };

  useEffect(() => {
    if (!root.current) return;

    scope.current = createScope({
      root: root.current,
      mediaQueries: {
        reducedMotion: "(prefers-reduced-motion: reduce)",
      },
    }).add((self) => {
      const duration = self?.matches.reducedMotion ? 0 : 700;

      animate(".header-item", {
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
    <header ref={root} className="fixed top-0 left-0 z-50 w-full flex items-center justify-between border-b border-foreground/10 bg-background/95 px-4 py-6 backdrop-blur sm:px-8 sm:py-10">
      <Link href="/" className="header-item font-mono text-sm opacity-0">APARICIO</Link>
      <nav className="header-item flex items-center justify-center gap-3 text-sm opacity-0 sm:gap-6">
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/about">About</Link>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="grid size-6 place-items-center"
        >
          <Image
            src={
              theme === "dark"
                ? "/assets/bulbs/bulb-filled-yellow.svg"
                : "/assets/bulbs/bulb-outline-black.svg"
            }
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 dark:drop-shadow-[0_0_10px_rgba(250,204,21,0.75)]"
          />
        </button>
      </nav>
    </header>
  );
}
