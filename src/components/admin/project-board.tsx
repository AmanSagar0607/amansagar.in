"use client";
import { Input as FormInput } from "@/components/ui/input";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Github, Search } from "lucide-react";
import type { ManagedProject } from "@/lib/admin/content-types";
import { GithubRepositoryCheck } from "./github-repository-check";

export function ProjectBoard({ projects }: { projects: ManagedProject[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter(({ project }) =>
      [project.title, project.description, ...project.technologies.map((item) => item.name)]
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [projects, query]);
  const columns = [
    { label: "Draft", matches: (item: ManagedProject) => item.status === "draft" },
    { label: "Private", matches: (item: ManagedProject) => item.status !== "draft" && item.visibility === "private" },
    { label: "Published", matches: (item: ManagedProject) => item.status === "published" && item.visibility === "public" },
  ];
  return (
    <div className="space-y-4">
      <label className="border-input bg-background focus-within:ring-ring flex max-w-md items-center gap-2 rounded-lg border px-3 focus-within:ring-2">
        <Search className="text-muted-foreground size-4" aria-hidden />
        <span className="sr-only">Search projects</span>
        <FormInput className="h-11 w-full bg-transparent text-sm outline-none" placeholder="Search projects or technology" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map(({ label, matches }) => {
          const items = filtered.filter(matches);
          return <section key={label} aria-label={`${label} projects`} className="bg-muted/40 rounded-xl border p-3">
            <h2 className="px-1 pb-3 text-sm font-semibold">{label} <span className="text-muted-foreground ml-1 font-normal">{items.length}</span></h2>
            <div className="space-y-3">
              {items.map(({ slug, project }) => <article key={slug} className="bg-background space-y-3 rounded-lg border p-4">
                <Link href={`/admin/projects/edit/${encodeURIComponent(slug)}`} className="block font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">{project.title}</Link>
                <p className="text-muted-foreground line-clamp-3 text-sm">{project.description}</p>
                <div className="flex flex-wrap gap-1">{project.technologies.map((technology) => <span key={technology.name} className="bg-muted rounded-md px-2 py-1 text-xs">{technology.name}</span>)}</div>
                {project.githubUrl && /^https:\/\/github\.com\//i.test(project.githubUrl) && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground inline-flex min-h-10 items-center gap-2 text-sm"><Github className="size-4" aria-hidden /> Repository <span className="sr-only">(opens in a new tab)</span></a>}
                {project.githubUrl && <GithubRepositoryCheck slug={slug} />}
              </article>)}
              {items.length === 0 && <p className="text-muted-foreground px-1 py-6 text-sm">No projects in this column.</p>}
            </div>
          </section>;
        })}
      </div>
    </div>
  );
}