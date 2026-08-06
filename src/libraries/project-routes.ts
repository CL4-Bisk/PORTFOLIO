type ProjectIdentity = { owner: string; name: string };

export function getProjectDetailPath(project: ProjectIdentity) {
  return `/projects/${encodeURIComponent(project.owner)}/${encodeURIComponent(project.name)}/`;
}

export function getProjectStaticParams(projects: ProjectIdentity[]) {
  return projects.map((project) => ({
    owner: project.owner,
    repo: project.name,
  }));
}

export function findProjectByRoute<T extends ProjectIdentity>(
  projects: T[],
  owner: string,
  repo: string,
) {
  const ownerKey = owner.toLowerCase();
  const repoKey = repo.toLowerCase();
  return projects.find(
    (project) =>
      project.owner.toLowerCase() === ownerKey &&
      project.name.toLowerCase() === repoKey,
  );
}
