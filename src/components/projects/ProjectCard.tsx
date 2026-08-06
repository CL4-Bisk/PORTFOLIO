import Link from "next/link";

import type { PortfolioRepo } from "@/libraries/github";
import { getProjectDetailPath } from "@/libraries/project-routes";

import { ContributorCredits } from "./ContributorCredits";
import {
  formatNumber,
  formatUpdatedDate,
  getLanguageTone,
} from "./project-formatters";

type ProjectCardProps = {
  repo: PortfolioRepo;
};

export function ProjectCard({ repo }: ProjectCardProps) {
  const languageTone = getLanguageTone(repo.language);
  const description =
    repo.description ??
    "Repository notes, implementation details, and project context are available from the source.";

  return (
    <article className="group relative grid h-full min-h-[23rem] min-w-0 grid-rows-[auto_minmax(4.5rem,auto)_auto_1fr_auto] rounded-lg border border-line bg-panel p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-all font-mono text-xs text-muted">{repo.owner}</p>
          <h2 className="mt-2 break-words text-xl font-semibold">
            <Link
              href={getProjectDetailPath(repo)}
              className="after:absolute after:inset-0 after:z-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {repo.name}
            </Link>
          </h2>
        </div>

        <span className="shrink-0 rounded-md border border-line bg-panel-muted px-2.5 py-1 text-xs text-muted">
          {repo.private ? "Private" : "Public"}
        </span>
      </div>

      <p className="mt-4 min-h-[4.5rem] overflow-hidden break-words text-sm leading-6 text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
        {description}
      </p>

      <ContributorCredits repo={repo} compact />

      <dl className="mt-6 grid grid-cols-2 gap-3 self-start text-sm">
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
          <dd className="mt-2 font-mono font-medium">{formatNumber(repo.stars)}</dd>
        </div>

        <div className="border-t border-line pt-3">
          <dt className="text-muted">Forks</dt>
          <dd className="mt-2 font-mono font-medium">{formatNumber(repo.forks)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <a
          href={repo.githubUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${repo.name} source repository`}
          className="relative z-10 inline-flex h-10 items-center justify-center rounded-md border border-line bg-panel px-3 text-sm font-medium transition hover:border-accent hover:bg-accent-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Repository
        </a>

        {repo.websiteUrl ? (
          <a
            href={repo.websiteUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${repo.name} live site`}
            className="relative z-10 inline-flex h-10 items-center justify-center rounded-md bg-foreground px-3 text-sm font-medium text-background transition hover:bg-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Live
          </a>
        ) : null}

        <span className="text-sm text-muted">View repository details →</span>
      </div>
    </article>
  );
}
