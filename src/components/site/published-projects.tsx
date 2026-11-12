/* eslint-disable @next/next/no-img-element -- Images are selected from verified media records. */
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type PublishedProject = {
  id: string; slug: string; title: string; clientName: string; industry: string | null; services: string | null;
  projectUrl: string | null; summary: string; challenge: string; approach: string; outcome: string | null;
  coverMedia: { url: string; altText: string | null } | null;
};

export function PublishedProjects({ projects }: { projects: PublishedProject[] }) {
  return <div className="published-projects">{projects.map((project, index) => <article className={`published-project${project.coverMedia ? "" : " is-text-only"}`} id={project.slug} key={project.id}>
    {project.coverMedia && <div className="published-project-image"><img src={project.coverMedia.url} alt={project.coverMedia.altText || `${project.title} project image`} loading="lazy" /></div>}
    <div className="published-project-copy"><p className="eyebrow">{String(index + 1).padStart(2, "0")} / {project.industry || "Client project"}</p><h3>{project.title}</h3><p className="published-project-client">For {project.clientName}</p><p className="published-project-summary">{project.summary}</p>
      {project.services && <p className="published-project-services"><strong>Work:</strong> {project.services}</p>}
      <details><summary>Read the case study <span aria-hidden="true">↗</span></summary><div className="published-project-story"><section><h4>The challenge</h4><Markdown skipHtml remarkPlugins={[remarkGfm]}>{project.challenge}</Markdown></section><section><h4>Our approach</h4><Markdown skipHtml remarkPlugins={[remarkGfm]}>{project.approach}</Markdown></section>{project.outcome && <section><h4>The outcome</h4><Markdown skipHtml remarkPlugins={[remarkGfm]}>{project.outcome}</Markdown></section>}</div></details>
      {project.projectUrl && <a className="published-project-link" href={project.projectUrl} target="_blank" rel="noopener noreferrer">Visit the project website ↗</a>}
    </div>
  </article>)}</div>;
}
