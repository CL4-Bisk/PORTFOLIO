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

type GithubContributor = {
  id: number;
  login: string | null;
  avatar_url: string | null;
  html_url: string | null;
  contributions: number;
  type: string;
};

type GithubContributorWithProfile = GithubContributor & {
  login: string;
  avatar_url: string;
  html_url: string;
};

export type PortfolioContributor = {
  id: number;
  login: string;
  avatarUrl: string;
  profileUrl: string;
  contributions: number;
  role: "Maintainer" | "Contributor";
  isCurrentUser: boolean;
};

export type PortfolioLanguage = {
  name: string;
  bytes: number;
  percentage: number;
};

export type PortfolioRelease = {
  name: string;
  tagName: string;
  publishedAt: string;
  url: string;
};

export type PortfolioRepoDetails = {
  readmeMarkdown: string | null;
  readmePath: string | null;
  languageBreakdown: PortfolioLanguage[];
  latestRelease: PortfolioRelease | null;
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
  contributors: PortfolioContributor[];
  readmeMarkdown: string | null;
  readmePath: string | null;
  languageBreakdown: PortfolioLanguage[];
  latestRelease: PortfolioRelease | null;
};

const emptyPortfolioRepoDetails: PortfolioRepoDetails = {
  readmeMarkdown: null,
  readmePath: null,
  languageBreakdown: [],
  latestRelease: null,
};

const tokens = [
  process.env.GITHUB_TOKEN_PERSONAL,
  process.env.GITHUB_TOKEN_UPDIKO,
  process.env.GITHUB_TOKEN_TWOBIT_FORGE,
].filter((token): token is string => Boolean(token));
const githubUsername = process.env.GITHUB_USERNAME?.trim();

function parseAllowedRepos() {
  const repos =
    process.env.GITHUB_ALLOWED_REPOS?.split(",")
      .map((repo) => repo.trim())
      .filter(Boolean) ?? [];

  return [...new Set(repos)];
}

function githubHeaders(token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2026-03-10",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function hasContributorProfile(
  contributor: GithubContributor,
): contributor is GithubContributorWithProfile {
  return Boolean(
    contributor.login?.trim() &&
      contributor.avatar_url?.trim() &&
      contributor.html_url?.trim(),
  );
}

export function mapGithubContributorsForPortfolio(
  contributors: GithubContributor[],
  currentUsername = githubUsername,
) {
  const currentLogin = currentUsername?.trim().toLowerCase();

  return contributors
    .filter((contributor) => contributor.type !== "Bot")
    .filter(hasContributorProfile)
    .map((contributor) => {
      const isCurrentUser =
        Boolean(currentLogin) &&
        contributor.login.toLowerCase() === currentLogin;

      return {
        id: contributor.id,
        login: contributor.login,
        avatarUrl: contributor.avatar_url,
        profileUrl: contributor.html_url,
        contributions: contributor.contributions,
        role: isCurrentUser ? "Maintainer" : "Contributor",
        isCurrentUser,
      } satisfies PortfolioContributor;
    })
    .sort((a, b) => {
      if (a.isCurrentUser !== b.isCurrentUser) {
        return a.isCurrentUser ? -1 : 1;
      }

      return b.contributions - a.contributions || a.login.localeCompare(b.login);
    });
}

export function mapGithubLanguagesForPortfolio(
  languages: Record<string, number>,
): PortfolioLanguage[] {
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

  if (total <= 0) return [];

  return Object.entries(languages)
    .filter(([, bytes]) => Number.isFinite(bytes) && bytes > 0)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.round((bytes / total) * 1000) / 10,
    }))
    .sort((a, b) => b.bytes - a.bytes || a.name.localeCompare(b.name));
}

function toPortfolioRepo(
  repo: GithubRepo,
  contributors: PortfolioContributor[] = [],
  details: PortfolioRepoDetails = emptyPortfolioRepoDetails,
): PortfolioRepo {
  return {
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
    contributors,
    readmeMarkdown: details.readmeMarkdown,
    readmePath: details.readmePath,
    languageBreakdown: details.languageBreakdown,
    latestRelease: details.latestRelease,
  };
}

function shouldShowRepo(repo: GithubRepo) {
  return !repo.archived && !repo.fork;
}

async function fetchContributorsForRepo(
  owner: string,
  repo: string,
  token?: string,
) {
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=100`,
    {
      headers: githubHeaders(token),
      next: { revalidate: 3600 },
    },
  );

  if (response.status === 204 || !response.ok) {
    return [];
  }

  const contributors = (await response.json()) as unknown;

  if (!Array.isArray(contributors)) {
    return [];
  }

  return mapGithubContributorsForPortfolio(contributors).slice(0, 8);
}

type GithubReadme = {
  content?: unknown;
  encoding?: unknown;
  path?: unknown;
};

type GithubLatestRelease = {
  name?: unknown;
  tag_name?: unknown;
  published_at?: unknown;
  html_url?: unknown;
};

async function fetchReadmeDetails(
  url: string,
  options: RequestInit,
  request: typeof fetch,
) {
  try {
    const response = await request(url, options);

    if (response.status === 204 || !response.ok) {
      return null;
    }

    const readme = (await response.json()) as GithubReadme;

    if (
      readme.encoding !== "base64" ||
      typeof readme.content !== "string" ||
      typeof readme.path !== "string"
    ) {
      return null;
    }

    return {
      markdown: Buffer.from(readme.content.replace(/[\r\n]/g, ""), "base64").toString(
        "utf8",
      ),
      path: readme.path,
    };
  } catch {
    return null;
  }
}

async function fetchLanguageDetails(
  url: string,
  options: RequestInit,
  request: typeof fetch,
) {
  try {
    const response = await request(url, options);

    if (response.status === 204 || !response.ok) {
      return [];
    }

    const languages = await response.json();

    if (!languages || typeof languages !== "object" || Array.isArray(languages)) {
      return [];
    }

    return mapGithubLanguagesForPortfolio(languages as Record<string, number>);
  } catch {
    return [];
  }
}

async function fetchLatestRelease(
  url: string,
  options: RequestInit,
  request: typeof fetch,
) {
  try {
    const response = await request(url, options);

    if (response.status === 204 || !response.ok) {
      return null;
    }

    const release = (await response.json()) as GithubLatestRelease;

    if (
      typeof release.tag_name !== "string" ||
      typeof release.html_url !== "string" ||
      typeof release.published_at !== "string"
    ) {
      return null;
    }

    return {
      name:
        typeof release.name === "string" && release.name
          ? release.name
          : release.tag_name,
      tagName: release.tag_name,
      publishedAt: release.published_at,
      url: release.html_url,
    } satisfies PortfolioRelease;
  } catch {
    return null;
  }
}

export async function fetchPortfolioRepoDetails(
  repo: { owner: string; name: string; private: boolean },
  token?: string,
  request: typeof fetch = fetch,
): Promise<PortfolioRepoDetails> {
  if (repo.private) return { ...emptyPortfolioRepoDetails };

  const root = `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`;
  const options = { headers: githubHeaders(token), next: { revalidate: 3600 } };

  const [readme, languages, release] = await Promise.all([
    fetchReadmeDetails(`${root}/readme`, options, request),
    fetchLanguageDetails(`${root}/languages`, options, request),
    fetchLatestRelease(`${root}/releases/latest`, options, request),
  ]);

  return {
    readmeMarkdown: readme?.markdown ?? null,
    readmePath: readme?.path ?? null,
    languageBreakdown: languages,
    latestRelease: release,
  };
}

async function toPortfolioRepoWithContributors(
  repo: GithubRepo,
  token?: string,
) {
  const [contributors, details] = await Promise.all([
    fetchContributorsForRepo(repo.owner.login, repo.name, token),
    fetchPortfolioRepoDetails(
      { owner: repo.owner.login, name: repo.name, private: repo.private },
      token,
    ),
  ]);

  return toPortfolioRepo(repo, contributors, details);
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

  return Promise.all(
    repos
      .filter(shouldShowRepo)
      .map((repo) => toPortfolioRepoWithContributors(repo, token)),
  );
}

async function fetchPublicReposForUsername(
  username: string,
): Promise<PortfolioRepo[]> {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=pushed&direction=desc&per_page=100`,
    {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch public GitHub repositories for "${username}"`,
    );
  }

  const repos: GithubRepo[] = await response.json();

  return Promise.all(
    repos
      .filter(shouldShowRepo)
      .map((repo) => toPortfolioRepoWithContributors(repo)),
  );
}

async function fetchAllowedRepo(fullName: string): Promise<PortfolioRepo> {
  const parts = fullName.split("/");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `Invalid GITHUB_ALLOWED_REPOS entry "${fullName}". Use owner/repo format.`,
    );
  }

  const [owner, repo] = parts;
  const attempts = [...tokens, undefined];
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  for (const token of attempts) {
    const response = await fetch(url, {
      headers: githubHeaders(token),
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const githubRepo = (await response.json()) as GithubRepo;

      if (!shouldShowRepo(githubRepo)) {
        throw new Error(
          `${fullName} is archived or forked, so it is hidden from the portfolio.`,
        );
      }

      return toPortfolioRepoWithContributors(githubRepo, token);
    }
  }

  throw new Error(`Failed to fetch allowed GitHub repository "${fullName}".`);
}

export async function getGithubRepos() {
  const allowedRepos = parseAllowedRepos();

  if (allowedRepos.length > 0) {
    const repos = await Promise.all(allowedRepos.map(fetchAllowedRepo));

    return repos.sort(
      (a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt),
    );
  }

  const repoLists = await Promise.all(tokens.map(fetchReposForToken));
  const uniqueRepos = new Map<number, PortfolioRepo>();

  for (const repo of repoLists.flat()) {
    uniqueRepos.set(repo.id, repo);
  }

  if (uniqueRepos.size > 0) {
    return [...uniqueRepos.values()].sort(
      (a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt),
    );
  }

  if (githubUsername) {
    const publicRepos = await fetchPublicReposForUsername(githubUsername);

    return publicRepos.sort(
      (a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt),
    );
  }

  return [];
}
