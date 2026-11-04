"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MediaPicker } from "./media-picker";
import type { ManagedProject } from "@/lib/admin/content-types";
import type { Project, Technology } from "@/types/project";

const inputClass =
  "border-input bg-background focus-visible:ring-ring mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2";
const textFields = [
  ["title", "Title"],
  ["description", "Description"],
  ["overview", "Overview"],
  ["src", "Cover image URL"],
  ["link", "Live URL"],
  ["githubUrl", "GitHub URL"],
] as const;
const listFields = [
  ["features", "Key features"],
  ["challenges", "Challenges"],
  ["learnings", "Learnings"],
  ["process", "Process"],
] as const;
const techFields = [
  ["technologies", "Technologies"],
  ["developmentTools", "Development tools"],
  ["designTools", "Design tools"],
] as const;
function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ProjectEditor({
  initial,
  onSave,
  identifierLocked = false,
}: {
  initial: ManagedProject;
  onSave: (project: ManagedProject) => Promise<void>;
  identifierLocked?: boolean;
}) {
  const [item, setItem] = useState(initial);
  const [draftLists, setDraftLists] = useState(
    () =>
      Object.fromEntries(
        listFields.map(([key]) => [
          key,
          (initial.project[key] || []).join("\n"),
        ]),
      ) as Record<(typeof listFields)[number][0], string>,
  );
  const [techLists, setTechLists] = useState(
    () =>
      Object.fromEntries(
        techFields.map(([key]) => [
          key,
          (initial.project[key] || []).map((tech) => tech.name).join("\n"),
        ]),
      ) as Record<(typeof techFields)[number][0], string>,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  function changeProject<K extends keyof Project>(key: K, value: Project[K]) {
    setItem((current) => ({
      ...current,
      project: { ...current.project, [key]: value },
    }));
    setSaved(false);
  }
  function changeItem<K extends keyof ManagedProject>(
    key: K,
    value: ManagedProject[K],
  ) {
    setItem((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) {
      setError("Use a lowercase slug with letters, numbers and hyphens.");
      return;
    }
    if (
      !item.project.title.trim() ||
      !item.project.description.trim() ||
      !item.project.overview.trim()
    ) {
      setError("Title, description and overview are required.");
      return;
    }
    for (const value of [
      item.project.src,
      item.project.link,
      item.project.githubUrl,
    ])
      if (value) {
        if (
          value === item.project.src &&
          value.startsWith("/") &&
          !value.startsWith("//") &&
          !value.includes("\\")
        )
          continue;
        try {
          if (!/^https?:$/.test(new URL(value).protocol)) throw new Error();
        } catch {
          setError("Image and project links must use HTTP or HTTPS.");
          return;
        }
      }
    if (!Number.isFinite(Date.parse(item.project.date))) {
      setError("Enter a valid project date.");
      return;
    }
    const tech = Object.fromEntries(
      techFields.map(([key]) => [
        key,
        lines(techLists[key]).map(
          (name) =>
            (item.project[key] || []).find(
              (existing) =>
                existing.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
            ) || ({ name, category: "other" } satisfies Technology),
        ),
      ]),
    );
    const project = {
      ...item.project,
      ...tech,
      slug: item.slug,
      ...Object.fromEntries(
        listFields.map(([key]) => [key, lines(draftLists[key])]),
      ),
    };
    setSaving(true);
    try {
      await onSave({ ...item, project, updatedAt: new Date().toISOString() });
      setSaved(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save this project.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {initial.project.title ? "Edit project" : "New project"}
          </h1>
          {initial.updatedAt && <p className="text-muted-foreground mt-2 text-xs">Version {initial.version ?? 1} · Last edited {new Date(initial.updatedAt).toLocaleString()}</p>}
          {initial.updatedAt && <p className="text-muted-foreground mt-2 text-xs">Version {initial.version ?? 1} · Last edited {new Date(initial.updatedAt).toLocaleString()}</p>}
          <p className="text-muted-foreground mt-1 text-sm">
            Manage the project details shown on your portfolio.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save project"}
        </Button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-500/50 px-4 py-3 text-sm text-red-500"
        >
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-muted-foreground text-sm">
          Project saved.
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="gap-0">
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              Slug
              <input
                required
                maxLength={120}
                className={inputClass}
                readOnly={identifierLocked}
                value={item.slug}
                onChange={(event) => changeItem("slug", event.target.value)}
              />
            </label>
            {textFields.map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium">
                  {label}
                  {key === "description" || key === "overview" ? (
                    <textarea
                      required
                      rows={key === "overview" ? 5 : 3}
                      className={inputClass}
                      value={item.project[key] || ""}
                      onChange={(event) =>
                        changeProject(key, event.target.value)
                      }
                    />
                  ) : (
                    <input
                      required={key === "title"}
                      type={key === "title" || key === "src" ? "text" : "url"}
                      className={inputClass}
                      value={item.project[key] || ""}
                      onChange={(event) =>
                        changeProject(key, event.target.value)
                      }
                    />
                  )}
                </label>
                {key === "src" && (
                  <MediaPicker onSelect={(url) => changeProject("src", url)} />
                )}
              </div>
            ))}
            {techFields.map(([key, label]) => (
              <label key={key} className="block text-sm font-medium">
                {label}
                <span className="text-muted-foreground ml-1 font-normal">
                  (one per line)
                </span>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={techLists[key]}
                  onChange={(event) => {
                    setTechLists((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }));
                    setSaved(false);
                  }}
                />
              </label>
            ))}
            {listFields.map(([key, label]) => (
              <label key={key} className="block text-sm font-medium">
                {label}
                <span className="text-muted-foreground ml-1 font-normal">
                  (one per line)
                </span>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={draftLists[key]}
                  onChange={(event) => {
                    setDraftLists((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }));
                    setSaved(false);
                  }}
                />
              </label>
            ))}
          </CardContent>
        </Card>
        <Card className="h-fit gap-0">
          <CardContent className="space-y-4">
            <h2 className="font-medium">Publishing</h2>
            <label className="block text-sm font-medium">
              Status
              <select
                className={inputClass}
                value={item.status}
                onChange={(event) =>
                  changeItem(
                    "status",
                    event.target.value as ManagedProject["status"],
                  )
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Visibility
              <select
                className={inputClass}
                value={item.visibility}
                onChange={(event) =>
                  changeItem(
                    "visibility",
                    event.target.value as ManagedProject["visibility"],
                  )
                }
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Project date
              <input
                required
                type="date"
                className={inputClass}
                value={item.project.date.slice(0, 10)}
                onChange={(event) => changeProject("date", event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.pinned === true} onChange={(event) => changeItem("pinned", event.target.checked)} />Pin to homepage</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={item.pinned === true} onChange={(event) => changeItem("pinned", event.target.checked)} />Pin to homepage</label>
            <p className="text-muted-foreground text-xs leading-5">
              Existing technology categories and icons are preserved when names
              match.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
