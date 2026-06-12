import "server-only";

type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  homepage: string | null;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  default_branch: string;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  owner: { login: string };
};

export type PortfolioRepo = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  description: string | null;
  language: string | null;
  githubUrl: string;
  websiteUrl: string | null;
  defaultBranch: string;
  stars: number;
  forks: number;
  pushedAt: string;
};

const tokens = [
  process.env.GITHUB_TOKEN_PERSONAL,
  process.env.GITHUB_TOKEN_UPDIKO,
  process.env.GITHUB_TOKEN_TWOBIT_FORGE,
].filter((token): token is string => Boolean(token));

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2026-03-10",
  };
}

async function fetchReposForToken(token: string): Promise<PortfolioRepo[]> {
  const response = await fetch(
    "https://api.github.com/user/repos?visibility=all&affiliation=owner,collaborator,organization_member&sort=pushed&direction=desc&per_page=100",
    {
      headers: githubHeaders(token),
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub repositories");
  }

  const repos: GithubRepo[] = await response.json();

  return repos
    .filter((repo) => !repo.archived && !repo.fork)
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      description: repo.description,
      language: repo.language,
      githubUrl: repo.html_url,
      websiteUrl: repo.homepage || null,
      defaultBranch: repo.default_branch,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      pushedAt: repo.pushed_at,
    }));
}

export async function getGithubRepos() {
  const repoLists = await Promise.all(tokens.map(fetchReposForToken));
  const uniqueRepos = new Map<number, PortfolioRepo>();

  for (const repo of repoLists.flat()) {
    uniqueRepos.set(repo.id, repo);
  }

  return [...uniqueRepos.values()].sort(
    (a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt)
  );
}