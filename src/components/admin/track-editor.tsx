"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isPublicActivity } from "@/lib/journey/logic";
import type { Activity, Track } from "@/lib/journey/types";

const inputClass =
  "border-input bg-background focus-visible:ring-ring mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2";
type Option = { slug: string; title: string };
export function TrackEditor({
  initial,
  activities,
  projects,
  onSave,
  identifierLocked = false,
}: {
  initial: Track;
  activities: Activity[];
  projects: Option[];
  onSave: (track: Track) => Promise<void>;
  identifierLocked?: boolean;
}) {
  const [track, setTrack] = useState(initial);
  const [technologies, setTechnologies] = useState(
    initial.technologies.join(", "),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  function set<K extends keyof Track>(key: K, value: Track[K]) {
    setTrack((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }
  function milestone(
    index: number,
    patch: Partial<Track["milestones"][number]>,
  ) {
    set(
      "milestones",
      track.milestones.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    );
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(track.slug) ||
      track.slug === "activity"
    ) {
      setError("Enter a valid track slug.");
      return;
    }
    if (!track.title.trim() || !track.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    if (
      track.milestones.some((item) => !item.id.trim() || !item.title.trim())
    ) {
      setError("Every milestone needs an ID and a title.");
      return;
    }
    const data = {
      ...track,
      technologies: technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    setSaving(true);
    try {
      await onSave(data);
      setSaved(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save this track.",
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
            {initial.title ? "Edit track" : "New track"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Progress is calculated from completed milestones.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save track"}
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
          Track saved.
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="gap-0">
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              Title
              <input
                required
                maxLength={200}
                className={inputClass}
                value={track.title}
                onChange={(event) => set("title", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Slug
              <input
                required
                maxLength={120}
                className={inputClass}
                readOnly={identifierLocked}
                value={track.slug}
                onChange={(event) => set("slug", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Description
              <textarea
                required
                rows={4}
                maxLength={2000}
                className={inputClass}
                value={track.description}
                onChange={(event) => set("description", event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Technologies{" "}
              <span className="text-muted-foreground font-normal">
                (comma separated)
              </span>
              <input
                className={inputClass}
                value={technologies}
                onChange={(event) => {
                  setTechnologies(event.target.value);
                  setSaved(false);
                }}
              />
            </label>
            <fieldset className="space-y-3">
              <legend className="mb-3 text-sm font-medium">Milestones</legend>
              {track.milestones.map((item, index) => (
                <div
                  key={index}
                  className="border-border space-y-3 rounded-md border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">
                      Milestone {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        set(
                          "milestones",
                          track.milestones.filter((_, i) => i !== index),
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  <label className="block text-sm">
                    ID
                    <input
                      required
                      className={inputClass}
                      value={item.id}
                      onChange={(event) =>
                        milestone(index, { id: event.target.value })
                      }
                    />
                  </label>
                  <label className="block text-sm">
                    Title
                    <input
                      required
                      className={inputClass}
                      value={item.title}
                      onChange={(event) =>
                        milestone(index, { title: event.target.value })
                      }
                    />
                  </label>
                  <label className="block text-sm">
                    Supporting published activity
                    <select
                      className={inputClass}
                      value={item.activitySlug || ""}
                      onChange={(event) =>
                        milestone(index, {
                          activitySlug: event.target.value || undefined,
                        })
                      }
                    >
                      <option value="">Select activity</option>
                      {activities.filter(isPublicActivity).map((activity) => (
                        <option key={activity.slug} value={activity.slug}>
                          {activity.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    Completion date
                    <input
                      type="date"
                      className={inputClass}
                      value={item.completedAt?.slice(0, 10) || ""}
                      onChange={(event) =>
                        milestone(index, {
                          completedAt: event.target.value || undefined,
                        })
                      }
                    />
                  </label>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  set("milestones", [
                    ...track.milestones,
                    { id: `milestone-${Date.now()}`, title: "" },
                  ])
                }
              >
                Add milestone
              </Button>
            </fieldset>
          </CardContent>
        </Card>
        <Card className="h-fit gap-0">
          <CardContent className="space-y-4">
            <h2 className="font-medium">Track settings</h2>
            <label className="block text-sm font-medium">
              Status
              <select
                className={inputClass}
                value={track.status}
                onChange={(event) =>
                  set("status", event.target.value as Track["status"])
                }
              >
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="on-break">On break</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Visibility
              <select
                className={inputClass}
                value={track.visibility}
                onChange={(event) =>
                  set("visibility", event.target.value as Track["visibility"])
                }
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Start date
              <input
                type="date"
                className={inputClass}
                value={track.startDate?.slice(0, 10) || ""}
                onChange={(event) =>
                  set("startDate", event.target.value || undefined)
                }
              />
            </label>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                Related projects
              </legend>
              <div className="space-y-2">
                {projects.length ? (
                  projects.map((project) => (
                    <label
                      key={project.slug}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={track.projectSlugs.includes(project.slug)}
                        onChange={(event) =>
                          set(
                            "projectSlugs",
                            event.target.checked
                              ? [...track.projectSlugs, project.slug]
                              : track.projectSlugs.filter(
                                  (slug) => slug !== project.slug,
                                ),
                          )
                        }
                      />
                      {project.title}
                    </label>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No projects available.
                  </p>
                )}
              </div>
            </fieldset>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
