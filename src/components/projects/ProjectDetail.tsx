import Link from "next/link";

import type { PortfolioRepo } from "@/libraries/github";

import { ContributorCredits } from "./ContributorCredits";
import { formatNumber, formatUpdatedDate } from "./project-formatters";
import { RepositoryReadme } from "./RepositoryReadme";

type ProjectDetailProps = {
  repo: PortfolioRepo;
};

function RepositoryFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-5 border-t border-line pt-3 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

export default function ProjectDetail({ repo }: ProjectDetailProps) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/projects/"
            className="inline-flex min-h-10 items-center rounded-md border border-line bg-panel px-3 text-sm font-medium transition hover:border-accent hover:bg-accent-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ← Back to Projects
          </Link>
          <div className="flex flex-wrap gap-2">
            <a
              href={repo.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-10 items-center rounded-md border border-line bg-panel px-3 text-sm font-medium transition hover:border-accent hover:bg-accent-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Repository
            </a>
            {repo.websiteUrl ? (
              <a
                href={repo.websiteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-10 items-center rounded-md bg-foreground px-3 text-sm font-medium text-background transition hover:bg-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                View live project
              </a>
            ) : null}
          </div>
        </div>

        <header className="grid gap-10 border-b border-line pb-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div className="min-w-0">
            <p className="font-mono text-sm font-medium uppercase tracking-wide text-accent">
              GitHub repository
            </p>
            <p className="mt-4 break-all font-mono text-sm text-muted">{repo.owner}</p>
            <h1 className="mt-2 break-words text-5xl font-semibold tracking-tight sm:text-6xl">
              {repo.name}
            </h1>
            {repo.description ? (
              <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
                {repo.description}
              </p>
            ) : null}
          </div>

          <dl className="grid gap-3" aria-label="GitHub repository facts">
            <RepositoryFact label="Visibility" value={repo.private ? "Private" : "Public"} />
            <RepositoryFact label="Default branch" value={repo.defaultBranch} />
            <RepositoryFact label="Contributors" value={formatNumber(repo.contributors.length)} />
            <RepositoryFact label="Last updated" value={formatUpdatedDate(repo.pushedAt)} />
          </dl>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <RepositoryReadme repo={repo} />
          </div>

          <aside
            aria-label="GitHub repository details"
            className="h-fit min-w-0 rounded-xl border border-line bg-panel p-5 sm:p-6"
          >
            <p className="font-mono text-xs font-medium uppercase tracking-wide text-accent">
              From GitHub
            </p>
            <h2 className="mt-2 text-xl font-semibold">Repository snapshot</h2>

            <dl className="mt-5 grid gap-3">
              <RepositoryFact label="Stars" value={formatNumber(repo.stars)} />
              <RepositoryFact label="Forks" value={formatNumber(repo.forks)} />
            </dl>

            {!repo.private && repo.languageBreakdown.length > 0 ? (
              <section className="mt-7 border-t border-line pt-5" aria-labelledby="languages-heading">
                <h3 id="languages-heading" className="font-mono text-xs font-medium uppercase tracking-wide text-muted">
                  Languages
                </h3>
                <ul className="mt-4 space-y-4">
                  {repo.languageBreakdown.map((language) => {
                    const percentage = Number.isFinite(language.percentage)
                      ? Math.min(100, Math.max(0, language.percentage))
                      : 0;
                    return (
                      <li key={language.name}>
                        <div className="flex items-center justify-between gap-3 text-xs text-muted">
                          <span className="min-w-0 truncate">{language.name}</span>
                          <span className="shrink-0 font-mono">{percentage}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-muted">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <ContributorCredits repo={repo} />

            {!repo.private && repo.latestRelease ? (
              <section className="mt-6 border-t border-line pt-5" aria-labelledby="release-heading">
                <h3 id="release-heading" className="font-mono text-xs font-medium uppercase tracking-wide text-muted">
                  Latest release
                </h3>
                <a
                  href={repo.latestRelease.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 block text-sm font-medium text-accent-strong underline decoration-line transition hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {repo.latestRelease.name}
                </a>
                <p className="mt-1 text-xs text-muted">
                  {repo.latestRelease.tagName} · {formatUpdatedDate(repo.latestRelease.publishedAt)}
                </p>
              </section>
            ) : null}

            {repo.websiteUrl ? (
              <a
                href={repo.websiteUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex min-h-10 w-full items-center justify-center rounded-md border border-line bg-panel px-3 text-sm font-medium transition hover:border-accent hover:bg-accent-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Live project
              </a>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}
