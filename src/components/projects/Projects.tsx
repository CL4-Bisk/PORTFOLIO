import type { PortfolioRepo } from "@/libraries/github";

type ProjectsProps = {
  repos: PortfolioRepo[];
};

export default function Projects({ repos }: ProjectsProps) {
  return (
    <main>
      <h1>Projects</h1>

      {repos.map((repo) => (
        <article key={repo.id}>
          <h2>{repo.name}</h2>
          <p>{repo.description}</p>

          <a href={repo.githubUrl} target="_blank" rel="noreferrer">
            View in repo
          </a>

          {repo.websiteUrl ? (
            <a href={repo.websiteUrl} target="_blank" rel="noreferrer">
              View website
            </a>
          ) : null}

          <a href={`/api/github/readme?owner=${repo.owner}&repo=${repo.name}`}>
            View README
          </a>
        </article>
      ))}
    </main>
  );
}