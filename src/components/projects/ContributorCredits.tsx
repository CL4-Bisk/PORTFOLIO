import Image from "next/image";

import type { PortfolioRepo } from "@/libraries/github";

import { formatNumber } from "./project-formatters";

type ContributorCreditsProps = {
  repo: PortfolioRepo;
  compact?: boolean;
};

const visibleContributorCount = 4;

function getCreditsLabel(repo: PortfolioRepo) {
  const [firstContributor] = repo.contributors;

  if (!firstContributor) {
    return null;
  }

  const otherCount = repo.contributors.length - 1;

  if (otherCount === 0) {
    return `${firstContributor.login} credited`;
  }

  return `${firstContributor.login} and ${otherCount} more credited`;
}

export function ContributorCredits({
  repo,
  compact = false,
}: ContributorCreditsProps) {
  const visibleContributors = repo.contributors.slice(0, visibleContributorCount);
  const hiddenContributorCount =
    repo.contributors.length - visibleContributors.length;
  const creditsLabel = getCreditsLabel(repo);

  return (
    <div
      className={
        compact
          ? "mt-6 h-[6.5rem] border-t border-line pt-4"
          : "mt-6 border-t border-line pt-4"
      }
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Built by
      </p>
      {repo.contributors.length === 0 ? (
        <p className="mt-3 text-xs text-muted">Contributor data unavailable</p>
      ) : (
        <div className="mt-3 flex min-w-0 items-center justify-between gap-3">
          <div className="flex shrink-0 -space-x-2">
            {visibleContributors.map((contributor) => (
              <a
                key={contributor.id}
                href={contributor.profileUrl}
                target="_blank"
                rel="noreferrer noopener"
                title={`${contributor.login} - ${contributor.role}, ${formatNumber(contributor.contributions)} commits`}
                aria-label={`Open ${contributor.login}'s GitHub profile`}
                className="relative z-10 block rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Image
                  src={contributor.avatarUrl}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                  className="size-9 rounded-full border-2 border-panel bg-panel-muted object-cover"
                />
              </a>
            ))}

            {hiddenContributorCount > 0 ? (
              <span className="flex size-9 items-center justify-center rounded-full border-2 border-panel bg-panel-muted font-mono text-xs text-muted">
                +{hiddenContributorCount}
              </span>
            ) : null}
          </div>

          {creditsLabel ? (
            <p className="min-w-0 truncate text-right text-xs text-muted">
              {creditsLabel}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
