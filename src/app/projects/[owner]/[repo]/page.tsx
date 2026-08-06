import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProjectDetail from "@/components/projects/ProjectDetail";
import { getGithubRepos } from "@/libraries/github";
import {
  findProjectByRoute,
  getProjectStaticParams,
} from "@/libraries/project-routes";

type ProjectPageProps = {
  params: Promise<{ owner: string; repo: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getProjectStaticParams(await getGithubRepos());
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { owner, repo: repoName } = await params;
  const repo = findProjectByRoute(await getGithubRepos(), owner, repoName);

  if (!repo) return { title: "Project not found | APARICIO" };

  return {
    title: `${repo.name} | APARICIO Projects`,
    description:
      repo.description ?? `GitHub repository details for ${repo.fullName}.`,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { owner, repo: repoName } = await params;
  const repo = findProjectByRoute(await getGithubRepos(), owner, repoName);

  if (!repo) notFound();

  return <ProjectDetail repo={repo} />;
}
