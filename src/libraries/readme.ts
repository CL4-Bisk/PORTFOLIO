export type ReadmeUrlKind = "link" | "image";

export type ReadmeUrlContext = {
  owner: string;
  repo: string;
  defaultBranch: string;
  readmePath: string;
};

const safeProtocols = new Set(["http:", "https:"]);

function encodePath(value: string) {
  return value
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

export function resolveReadmeUrl(
  value: string,
  context: ReadmeUrlContext,
  kind: ReadmeUrlKind,
) {
  const candidate = value.trim();

  if (!candidate) return "";
  if (kind === "link" && candidate.startsWith("#")) return candidate;

  const owner = encodeURIComponent(context.owner);
  const repo = encodeURIComponent(context.repo);
  const branch = encodeURIComponent(context.defaultBranch);
  const readmePath = encodePath(context.readmePath || "README.md");
  const readmeDirectory = readmePath.split("/").slice(0, -1).join("/");
  const linkBase = `https://github.com/${owner}/${repo}/blob/${branch}/${readmePath}`;
  const imageBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${readmeDirectory ? `${readmeDirectory}/` : ""}`;

  try {
    const url = new URL(candidate, kind === "image" ? imageBase : linkBase);
    return safeProtocols.has(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

export function getReadmeLinkAttributes(
  value: string,
  context: ReadmeUrlContext,
) {
  const href = resolveReadmeUrl(value, context, "link");

  if (!href) return null;

  const external = !href.startsWith("#");
  return {
    href,
    target: external ? "_blank" : undefined,
    rel: external ? "noreferrer noopener" : undefined,
  } as const;
}
