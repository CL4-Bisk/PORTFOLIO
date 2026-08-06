import type { PortfolioRepo } from "@/libraries/github";

import { ProjectCard } from "./ProjectCard";
import { formatNumber } from "./project-formatters";

type ProjectsProps = {
  repos: PortfolioRepo[];
};

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
              <div key={stat.label} className="border-t border-line pt-4">
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
            className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {repos.map((repo) => (
              <ProjectCard key={repo.id} repo={repo} />
            ))}
          </section>
        )}
      </div>
    </section>
  );
}
