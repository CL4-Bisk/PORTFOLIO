/* eslint-disable @next/next/no-img-element -- README images are arbitrary remote content without known dimensions; this static export uses unoptimized remote images. */
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import type { PortfolioRepo } from "@/libraries/github";
import {
  getReadmeLinkAttributes,
  resolveReadmeUrl,
} from "@/libraries/readme";

type RepositoryReadmeProps = {
  repo: PortfolioRepo;
};

export function RepositoryReadme({ repo }: RepositoryReadmeProps) {
  if (repo.private) {
    return (
      <section className="rounded-xl border border-line bg-panel p-6 sm:p-7">
        <h2 className="text-xl font-semibold">README</h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Private repository content is not published.
        </p>
      </section>
    );
  }

  if (!repo.readmeMarkdown || !repo.readmePath) {
    return (
      <section className="rounded-xl border border-line bg-panel p-6 sm:p-7">
        <h2 className="text-xl font-semibold">README</h2>
        <p className="mt-3 text-sm leading-6 text-muted">README unavailable</p>
        <a
          href={repo.githubUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-5 inline-flex text-sm font-medium text-accent-strong underline decoration-line transition hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Repository
        </a>
      </section>
    );
  }

  const context = {
    owner: repo.owner,
    repo: repo.name,
    defaultBranch: repo.defaultBranch,
    readmePath: repo.readmePath,
  };

  return (
    <section className="min-w-0 rounded-xl border border-line bg-panel p-5 sm:p-7">
      <div className="mb-7 flex items-center justify-between gap-4 border-b border-line pb-4">
        <h2 className="text-xl font-semibold">README</h2>
        <span className="shrink-0 rounded-md border border-line bg-panel-muted px-2.5 py-1 font-mono text-[0.65rem] font-medium uppercase tracking-wide text-muted">
          Synced from GitHub
        </span>
      </div>

      <div className="min-w-0 text-sm leading-7 text-muted">
        <ReactMarkdown
          rehypePlugins={[rehypeSlug]}
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, children, ...props }) => (
              <h3
                {...props}
                className="mb-5 mt-10 text-3xl font-semibold leading-tight tracking-tight text-foreground first:mt-0 sm:text-4xl"
              >
                {children}
                {void node}
              </h3>
            ),
            h2: ({ node, children, ...props }) => (
              <h4
                {...props}
                className="mb-4 mt-10 text-2xl font-semibold leading-tight text-foreground sm:text-3xl"
              >
                {children}
                {void node}
              </h4>
            ),
            h3: ({ node, children, ...props }) => (
              <h5
                {...props}
                className="mb-3 mt-8 text-xl font-semibold leading-tight text-foreground"
              >
                {children}
                {void node}
              </h5>
            ),
            h4: ({ node, children, ...props }) => (
              <h6
                {...props}
                className="mb-3 mt-7 text-lg font-semibold leading-tight text-foreground"
              >
                {children}
                {void node}
              </h6>
            ),
            h5: ({ node, children, ...props }) => (
              <h6
                {...props}
                className="mb-3 mt-7 text-base font-semibold leading-tight text-foreground"
              >
                {children}
                {void node}
              </h6>
            ),
            h6: ({ node, children, ...props }) => (
              <h6
                {...props}
                className="mb-3 mt-7 text-sm font-semibold leading-tight text-foreground"
              >
                {children}
                {void node}
              </h6>
            ),
            p: ({ children }) => <p className="my-5">{children}</p>,
            ul: ({ children }) => (
              <ul className="my-5 list-disc space-y-2 pl-6 marker:text-accent">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-5 list-decimal space-y-2 pl-6 marker:text-accent">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="pl-1">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="my-6 border-l-2 border-accent bg-accent-soft/40 py-2 pl-4 text-foreground">
                {children}
              </blockquote>
            ),
            code: ({ className, children }) => {
              const isBlock = Boolean(className);
              return (
                <code
                  className={
                    isBlock
                      ? `${className} block min-w-max p-4 font-mono text-xs leading-6 text-foreground`
                      : "rounded bg-panel-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
                  }
                >
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="my-6 max-w-full overflow-x-auto rounded-lg border border-line bg-panel-muted">
                {children}
              </pre>
            ),
            hr: () => <hr className="my-9 border-line" />,
            table: ({ children }) => (
              <div className="my-6 max-w-full overflow-x-auto rounded-lg border border-line">
                <table className="min-w-full border-collapse text-left text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-panel-muted text-foreground">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="border-b border-line px-3 py-2.5 font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => <td className="border-b border-line px-3 py-2.5">{children}</td>,
            a: ({ href = "", children, ...props }) => {
              const attributes = getReadmeLinkAttributes(href, context);
              if (!attributes) return <span>{children}</span>;

              return (
                <a
                  {...props}
                  {...attributes}
                  className="font-medium text-accent-strong underline decoration-line transition hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {children}
                </a>
              );
            },
            img: ({ src = "", alt = "" }) => {
              const safeSrc = resolveReadmeUrl(String(src), context, "image");
              return safeSrc ? (
                <img
                  src={safeSrc}
                  alt={alt}
                  loading="lazy"
                  className="my-6 h-auto max-w-full rounded-lg border border-line"
                />
              ) : null;
            },
          }}
        >
          {repo.readmeMarkdown}
        </ReactMarkdown>
      </div>
    </section>
  );
}
