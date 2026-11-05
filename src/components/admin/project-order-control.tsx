"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reorderProjects } from "@/lib/admin/client";
import type { ManagedProject } from "@/lib/admin/content-types";

function orderedSlugs(projects: ManagedProject[]) {
  return projects
    .map((project, index) => ({ project, index }))
    .sort((a, b) => {
      const pinOrder = Number(b.project.pinned === true) - Number(a.project.pinned === true);
      if (pinOrder) return pinOrder;
      if (a.project.sortOrder !== undefined && b.project.sortOrder !== undefined)
        return a.project.sortOrder - b.project.sortOrder;
      if (a.project.sortOrder !== undefined) return -1;
      if (b.project.sortOrder !== undefined) return 1;
      return Date.parse(b.project.project.date) - Date.parse(a.project.project.date) || a.index - b.index;
    })
    .map(({ project }) => project.slug);
}

export function ProjectOrderControl({
  projects,
}: {
  projects: ManagedProject[];
}) {
  const projectBySlug = useMemo(
    () => new Map(projects.map((project) => [project.slug, project])),
    [projects],
  );
  const initialOrder = useMemo(() => orderedSlugs(projects), [projects]);
  const [order, setOrder] = useState(initialOrder);
  const [savedOrder, setSavedOrder] = useState(initialOrder);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
    setSavedOrder(initialOrder);
  }, [initialOrder]);

  const rows = order.flatMap((slug) => {
    const project = projectBySlug.get(slug);
    return project ? [project] : [];
  });
  const dirty = order.some((slug, index) => slug !== savedOrder[index]);

  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (
      target < 0 ||
      target >= rows.length ||
      (rows[index].pinned === true) !== (rows[target].pinned === true)
    )
      return;
    setOrder((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const result = await reorderProjects(order);
      setSavedOrder(order);
      toast.success("Project order saved.");
      if (!result.revalidated)
        toast.warning("Saved, but the public project pages could not be refreshed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save project order.");
    } finally {
      setSaving(false);
    }
  }

  if (!projects.length) return null;

  return (
    <section className="space-y-3 rounded-xl border p-4" aria-labelledby="project-order-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="project-order-heading" className="font-semibold">Website project order</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Pinned projects appear first. Reorder projects within each group; this order is used on the homepage and Projects page.
          </p>
        </div>
        <Button type="button" onClick={() => void save()} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save order"}
        </Button>
      </div>
      <ol className="divide-y rounded-lg border">
        {rows.map((project, index) => {
          const pinned = project.pinned === true;
          const canMoveUp = index > 0 && (rows[index - 1].pinned === true) === pinned;
          const canMoveDown = index < rows.length - 1 && (rows[index + 1].pinned === true) === pinned;
          return (
            <li key={project.slug} className="flex min-h-14 items-center gap-3 px-3 py-2">
              <span className="text-muted-foreground w-7 shrink-0 text-center text-xs tabular-nums">
                {pinned ? <Pin className="mx-auto size-3.5" aria-label="Pinned" /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{project.project.title}</span>
                <span className="text-muted-foreground block text-xs">
                  {pinned ? "Pinned" : "Unpinned"} · {project.status} · {project.visibility}
                </span>
              </span>
              <div className="flex shrink-0 gap-1">
                <Button type="button" variant="ghost" size="icon" className="size-9" aria-label={`Move ${project.project.title} up`} disabled={!canMoveUp || saving} onClick={() => move(index, -1)}>
                  <ArrowUp className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="size-9" aria-label={`Move ${project.project.title} down`} disabled={!canMoveDown || saving} onClick={() => move(index, 1)}>
                  <ArrowDown className="size-4" />
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
