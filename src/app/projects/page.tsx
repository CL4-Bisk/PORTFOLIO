import Projects from "@/components/projects/Projects";
import { getGithubRepos } from "@/libraries/github";

export default async function ProjectsPage() {
  const repos = await getGithubRepos();

  return <Projects repos={repos} />;
}