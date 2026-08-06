export type LanguageTone = {
  dot: string;
  label: string;
};

const languageTones: Record<string, LanguageTone> = {
  TypeScript: {
    dot: "bg-sky-400",
    label: "text-sky-700 dark:text-sky-300",
  },
  JavaScript: {
    dot: "bg-yellow-400",
    label: "text-yellow-700 dark:text-yellow-300",
  },
  Python: {
    dot: "bg-emerald-500",
    label: "text-emerald-700 dark:text-emerald-300",
  },
  CSS: {
    dot: "bg-blue-500",
    label: "text-blue-700 dark:text-blue-300",
  },
  HTML: {
    dot: "bg-orange-500",
    label: "text-orange-700 dark:text-orange-300",
  },
  Java: {
    dot: "bg-red-500",
    label: "text-red-700 dark:text-red-300",
  },
};

const fallbackLanguageTone: LanguageTone = {
  dot: "bg-muted",
  label: "text-muted",
};

const compactNumberFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
});

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatNumber(value: number) {
  return compactNumberFormatter.format(value);
}

export function formatUpdatedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Recently";
  }

  return dateFormatter.format(date);
}

export function getLanguageTone(language: string | null) {
  if (!language) return fallbackLanguageTone;

  return languageTones[language] ?? fallbackLanguageTone;
}
