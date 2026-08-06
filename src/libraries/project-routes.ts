type ProjectIdentity = { owner: string; name: string };

export function getProjectDetailPath(project: ProjectIdentity) {
  return `/projects/${encodeURIComponent(project.owner)}/${encodeURIComponent(project.name)}/`;
}
