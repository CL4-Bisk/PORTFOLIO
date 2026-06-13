import type { PortfolioRepo } from "@/libraries/github";

type ProjectsProps = {
  repos: PortfolioRepo[];
};

type LanguageTone = {
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

function formatNumber(value: number) {
  return compactNumberFormatter.format(value);
}

function formatUpdatedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Recently";
  }

  return dateFormatter.format(date);
}

function getLanguageTone(language: string | null) {
  if (!language) return fallbackLanguageTone;

  return languageTones[language] ?? fallbackLanguageTone;
}

export default function Projects({ repos }: ProjectsProps) {
  const languages = new Set(
    repos
      .map((repo) => repo.language)
      .filter((language): language is string => Boolean(language)),
  );
  const liveProjectCount = repos.filter((repo) =>
    Boolean(repo.websiteUrl),
  ).length;
  const totalStars = repos.reduce((total, repo) => total + repo.stars, 0);

  const stats = [
    { label: "Repositories", value: formatNumber(repos.length) },
    { label: "Live links", value: formatNumber(liveProjectCount) },
    { label: "Languages", value: formatNumber(languages.size) },
    { label: "Stars", value: formatNumber(totalStars) },
  ];

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="max-w-3xl">
            <p className="font-mono text-sm font-semibold uppercase text-accent">
              Project Index
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-balance sm:text-5xl">
              Builds, experiments, and repositories with real commit history.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              A GitHub-backed project board for shipped links, source code, and
              recent work across web apps, coursework, and practical developer
              tools.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-t border-line pt-4"
              >
                <dt className="text-sm text-muted">{stat.label}</dt>
                <dd className="mt-2 font-mono text-2xl font-semibold">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {repos.length === 0 ? (
          <section className="rounded-lg border border-dashed border-line bg-panel px-5 py-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold">No projects loaded</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
              Add GitHub tokens to the environment and rebuild the site to
              populate this page with repository data.
            </p>
          </section>
        ) : (
          <section
            aria-label="Project list"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {repos.map((repo) => {
              const languageTone = getLanguageTone(repo.language);
              const description =
                repo.description ??
                "Repository notes, implementation details, and project context are available from the source.";

              return (
                <article
                  key={repo.id}
                  className="group flex min-h-[23rem] min-w-0 flex-col justify-between rounded-lg border border-line bg-panel p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="break-all font-mono text-xs text-muted">
                          {repo.owner}
                        </p>
                        <h2 className="mt-2 break-words text-xl font-semibold">
                          {repo.name}
                        </h2>
                      </div>

                      <span className="shrink-0 rounded-md border border-line bg-panel-muted px-2.5 py-1 text-xs text-muted">
                        {repo.private ? "Private" : "Public"}
                      </span>
                    </div>

                    <p className="mt-4 break-words text-sm leading-6 text-muted">
                      {description}
                    </p>

                    <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                      <div className="border-t border-line pt-3">
                        <dt className="text-muted">Language</dt>
                        <dd
                          className={`mt-2 flex items-center gap-2 font-medium ${languageTone.label}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`size-2 rounded-full ${languageTone.dot}`}
                          />
                          {repo.language ?? "Mixed"}
                        </dd>
                      </div>

                      <div className="border-t border-line pt-3">
                        <dt className="text-muted">Updated</dt>
                        <dd className="mt-2 font-medium">
                          {formatUpdatedDate(repo.pushedAt)}
                        </dd>
                      </div>

                      <div className="border-t border-line pt-3">
                        <dt className="text-muted">Stars</dt>
                        <dd className="mt-2 font-mono font-medium">
                          {formatNumber(repo.stars)}
                        </dd>
                      </div>

                      <div className="border-t border-line pt-3">
                        <dt className="text-muted">Forks</dt>
                        <dd className="mt-2 font-mono font-medium">
                          {formatNumber(repo.forks)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <a
                      href={repo.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${repo.name} source repository`}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-panel px-3 text-sm font-medium transition hover:border-accent hover:bg-accent-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      Repository
                    </a>

                    {repo.websiteUrl ? (
                      <a
                        href={repo.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${repo.name} live site`}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-3 text-sm font-medium text-background transition hover:bg-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        Live
                      </a>
                    ) : null}

                    <a
                      href={`${repo.githubUrl}#readme`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${repo.name} README on GitHub`}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-panel px-3 text-sm font-medium transition hover:border-accent hover:bg-panel-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      README
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </section>
  );
}
