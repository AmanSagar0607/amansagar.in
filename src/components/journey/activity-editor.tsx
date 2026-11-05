"use client";

import { useState } from "react";
import { ActivityMarkdown } from "@/components/journey/activity-markdown";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input as FormInput } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/select";
import { Textarea as FormTextarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  activityTypes,
  type Activity,
  type JourneyData,
  type Track,
} from "@/lib/journey/types";
import { validateJourney } from "@/lib/journey/validation";

type Option = { slug: string; title: string };
const inputClass =
  "mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const split = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

function StringListField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [text, setText] = useState(values.join(", "));
  return (
    <Field label={label}>
      <FormInput
        className={inputClass}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChange(split(event.target.value));
        }}
      />
    </Field>
  );
}
function newActivity(): Activity {
  const now = new Date().toISOString();
  return {
    slug: `update-${Date.now()}`,
    title: "",
    description: "",
    content: "",
    type: "learning",
    date: now,
    updatedAt: now,
    status: "draft",
    visibility: "private",
    sample: false,
    completion: "in-progress",
    trackSlugs: [],
    projectSlugs: [],
    technologies: [],
    tags: [],
    references: [],
    attachments: [],
  };
}

export function ActivityEditor({
  activity: a,
  onChange,
  tracks,
  projects,
  blogPosts,
  identifierLocked = false,
  enableMedia = false,
}: {
  activity: Activity;
  onChange: (activity: Activity) => void;
  tracks: Track[];
  projects: Option[];
  blogPosts: Option[];
  identifierLocked?: boolean;
  enableMedia?: boolean;
}) {
  const [preview, setPreview] = useState(false);
  const set = <K extends keyof Activity>(key: K, value: Activity[K]) =>
    onChange({ ...a, [key]: value, updatedAt: new Date().toISOString() });
  const textField = (
    key:
      | "title"
      | "slug"
      | "description"
      | "githubUrl"
      | "demoUrl"
      | "coverImage"
      | "seoTitle"
      | "seoDescription"
      | "verifiedEvidenceUrl",
    label: string,
    type = "text",
  ) => (
    <div className="space-y-2">
      <Field label={label}>
        <FormInput
          className={inputClass}
          type={type}
          readOnly={key === "slug" && identifierLocked}
          value={a[key] || ""}
          onChange={(e) => set(key, e.target.value)}
        />
      </Field>
      {key === "coverImage" && enableMedia && (
        <MediaPicker onSelect={(url) => set("coverImage", url)} />
      )}
    </div>
  );
  const multi = (
    key: "trackSlugs" | "projectSlugs",
    label: string,
    options: Option[],
  ) => (
    <fieldset className="border-border rounded-md border p-3">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      {options.length ? (
        <ScrollArea className="max-h-56 min-w-0 pr-1">
          {options.map((option) => (
            <label
              key={option.slug}
              className="flex min-h-11 min-w-0 items-center gap-2 text-sm"
            >
              <Checkbox
                checked={a[key].includes(option.slug)}
                onCheckedChange={(checked) =>
                  set(
                    key,
                    checked === true
                      ? [...a[key], option.slug]
                      : a[key].filter((s) => s !== option.slug),
                  )
                }
              />
              <span className="min-w-0 break-words">{option.title}</span>
            </label>
          ))}
        </ScrollArea>
      ) : (
        <p className="text-muted-foreground text-sm">No options yet.</p>
      )}
    </fieldset>
  );
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Activity type">
          <FormSelect
            className={inputClass}
            value={a.type}
            onChange={(e) => set("type", e.target.value as Activity["type"])}
          >
            {activityTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </FormSelect>
        </Field>
        {textField("title", "Title")}
        {textField("slug", "URL slug")}
        {textField("description", "Short description")}
      </div>
      {a.type === "article" ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Long articles use the existing blog MDX pipeline. Create or edit the
            file in src/content/posts, then link it here. Content and
            publication visibility come from that post.
          </p>
          <Field label="Existing article">
            <FormSelect
              className={inputClass}
              value={a.blogSlug || ""}
              onChange={(e) => set("blogSlug", e.target.value || undefined)}
            >
              <option value="">Select a blog article</option>
              {blogPosts.map((p) => (
                <option value={p.slug} key={p.slug}>
                  {p.title}
                </option>
              ))}
            </FormSelect>
          </Field>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">
              Detailed content / Markdown
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreview(!preview)}
            >
              {preview ? "Continue writing" : "Preview content"}
            </Button>
          </div>
          {preview ? (
            <div className="article-body border-border min-h-48 rounded-md border p-4">
              <ActivityMarkdown
                content={a.content || "*Your preview will appear here.*"}
              />
            </div>
          ) : (
            <Field label="Content">
              <FormTextarea
                className={`${inputClass} min-h-64 font-mono`}
                value={a.content}
                onChange={(e) => set("content", e.target.value)}
              />
            </Field>
          )}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {multi("trackSlugs", "Learning tracks", tracks)}
        {multi("projectSlugs", "Existing projects", projects)}
        <StringListField
          label="Technologies (comma separated)"
          values={a.technologies}
          onChange={(values) => set("technologies", values)}
        />
        <StringListField
          label="Tags (comma separated)"
          values={a.tags}
          onChange={(values) => set("tags", values)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Publication date (UTC)">
          <FormInput
            className={inputClass}
            type="datetime-local"
            value={a.date.slice(0, 16)}
            onChange={(e) =>
              e.target.value && set("date", `${e.target.value}:00.000Z`)
            }
          />
        </Field>
        <Field label="Completion">
          <FormSelect
            className={inputClass}
            value={a.completion}
            onChange={(e) =>
              set("completion", e.target.value as Activity["completion"])
            }
          >
            {["planned", "in-progress", "completed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </FormSelect>
        </Field>
        <Field label="Publication state">
          <FormSelect
            className={inputClass}
            value={a.status}
            onChange={(e) =>
              set("status", e.target.value as Activity["status"])
            }
          >
            <option>draft</option>
            <option>published</option>
          </FormSelect>
        </Field>
        <Field label="Visibility">
          <FormSelect
            className={inputClass}
            value={a.visibility}
            onChange={(e) =>
              set("visibility", e.target.value as Activity["visibility"])
            }
          >
            <option>private</option>
            <option>public</option>
          </FormSelect>
        </Field>
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <Checkbox
          checked={a.sample}
          onCheckedChange={(checked) => set("sample", checked === true)}
        />
        Sample content / excluded from public pages and achievements
      </label>
      <details className="border-border rounded-md border p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Links, evidence, attachments and SEO
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {textField("githubUrl", "GitHub URL", "url")}
          {textField("demoUrl", "Demo URL", "url")}
          {textField("coverImage", "Cover image URL")}
          {textField("seoTitle", "SEO title")}
          {textField("seoDescription", "SEO description")}
          <Field label="Milestone kind">
            <FormSelect
              className={inputClass}
              value={a.milestoneKind || ""}
              onChange={(e) =>
                set(
                  "milestoneKind",
                  (e.target.value as Activity["milestoneKind"]) || undefined,
                )
              }
            >
              <option value="">General milestone</option>
              <option value="project-shipped">Project shipped</option>
              <option value="open-source">
                Verified open-source contribution
              </option>
            </FormSelect>
          </Field>
          {textField(
            "verifiedEvidenceUrl",
            "Verified contribution evidence URL",
            "url",
          )}
          {(["references", "attachments"] as const).map((key) => (
            <div key={key} className="space-y-2 sm:col-span-2">
              <h3 className="text-sm font-medium capitalize">{key}</h3>
              {a[key].map((resource, i) => (
                <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]" key={i}>
                  <Field label="Label">
                    <FormInput
                      className={inputClass}
                      value={resource.title}
                      onChange={(e) =>
                        set(
                          key,
                          a[key].map((r, j) =>
                            j === i ? { ...r, title: e.target.value } : r,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="URL">
                    <FormInput
                      type="url"
                      className={inputClass}
                      value={resource.url}
                      onChange={(e) =>
                        set(
                          key,
                          a[key].map((r, j) =>
                            j === i ? { ...r, url: e.target.value } : r,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Button
                    className="self-end"
                    variant="ghost"
                    onClick={() =>
                      set(
                        key,
                        a[key].filter((_, j) => j !== i),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => set(key, [...a[key], { title: "", url: "" }])}
              >
                Add {key === "references" ? "reference" : "attachment"}
              </Button>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function MilestoneControls({
  tracks,
  activities,
  onChange,
}: {
  tracks: Track[];
  activities: Activity[];
  onChange: (tracks: Track[]) => void;
}) {
  return (
    <div className="space-y-4">
      {tracks.map((track, ti) => (
        <fieldset
          key={track.slug}
          className="border-border space-y-3 rounded-md border p-4"
        >
          <legend className="px-1 text-sm font-medium">{track.title}</legend>
          <Field label="Track status">
            <FormSelect
              className={inputClass}
              value={track.status}
              onChange={(event) =>
                onChange(
                  tracks.map((item, index) =>
                    index === ti
                      ? {
                          ...item,
                          status: event.target.value as Track["status"],
                        }
                      : item,
                  ),
                )
              }
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="on-break">On break</option>
              <option value="completed">Completed</option>
            </FormSelect>
          </Field>
          {track.milestones.map((milestone, mi) => {
            const updateMilestone = (patch: Partial<typeof milestone>) =>
              onChange(
                tracks.map((t, i) =>
                  i === ti
                    ? {
                        ...t,
                        milestones: t.milestones.map((m, j) =>
                          j === mi ? { ...m, ...patch } : m,
                        ),
                      }
                    : t,
                ),
              );
            return (
              <div
                key={milestone.id}
                className="border-border grid gap-3 border-b pb-3 last:border-0 sm:grid-cols-2"
              >
                <p className="text-sm sm:col-span-2">
                  {mi + 1}. {milestone.title}
                </p>
                <Field label="Supporting activity">
                  <FormSelect
                    className={inputClass}
                    value={milestone.activitySlug || ""}
                    onChange={(e) =>
                      updateMilestone({
                        activitySlug: e.target.value || undefined,
                      })
                    }
                  >
                    <option value="">Select evidence</option>
                    {activities.map((a) => (
                      <option key={a.slug} value={a.slug}>
                        {a.title} / {a.status}
                      </option>
                    ))}
                  </FormSelect>
                </Field>
                <Field label="Completed on (leave empty until done)">
                  <FormInput
                    type="date"
                    className={inputClass}
                    value={milestone.completedAt?.slice(0, 10) || ""}
                    onChange={(e) =>
                      updateMilestone({
                        completedAt: e.target.value || undefined,
                      })
                    }
                  />
                </Field>
              </div>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}

export function JourneyEditor() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<JourneyData | null>(null);
  const [projects, setProjects] = useState<Option[]>([]);
  const [posts, setPosts] = useState<Option[]>([]);
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState("activities");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [advanced, setAdvanced] = useState("");
  const [dirty, setDirty] = useState(false);
  const [advancedDirty, setAdvancedDirty] = useState(false);
  const update = (next: JourneyData) => {
    setData(next);
    setDirty(true);
  };
  async function request(save = false) {
    setBusy(true);
    setMessage("");
    try {
      const result = await fetch("/api/admin/journey", {
        method: save ? "PUT" : "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...(save ? { body: JSON.stringify(data) } : {}),
        cache: "no-store",
      });
      const body = await result.json();
      if (!result.ok)
        throw new Error(body.error || "Publishing request failed.");
      setData(body.journey);
      setDirty(false);
      if (!save) {
        setProjects(body.projects);
        setPosts(body.blogPosts);
      }
      setMessage(
        save
          ? "Saved locally. Review the content diff, commit and redeploy to update the live site."
          : "Content loaded.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }
  function switchTab(value: string) {
    if (advancedDirty) {
      setMessage("Apply the JSON changes before changing sections.");
      return;
    }
    setTab(value);
    if (data && value !== "activities")
      setAdvanced(
        JSON.stringify(
          data[value as "tracks" | "challenges" | "badgeRules"],
          null,
          2,
        ),
      );
  }
  function applyAdvanced() {
    if (!data) return;
    try {
      const value: unknown = JSON.parse(advanced);
      if (!Array.isArray(value)) throw new Error("Expected a JSON array.");
      update(
        validateJourney(
          { ...data, [tab]: value },
          projects.map((p) => p.slug),
          posts.map((p) => p.slug),
        ),
      );
      setAdvancedDirty(false);
      setMessage(
        "Changes applied to the editor. Save all changes to validate and write the files.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invalid JSON.");
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grow">
          <Field label="Publishing token">
            <FormInput
              type="password"
              autoComplete="off"
              className={inputClass}
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </Field>
        </div>
        <Button
          disabled={busy || !token || dirty || advancedDirty}
          onClick={() => request()}
        >
          {busy ? "Working..." : "Load content"}
        </Button>
        {data && (
          <Button
            disabled={busy || !dirty || advancedDirty}
            onClick={() => request(true)}
          >
            Save all changes
          </Button>
        )}
      </div>
      <p
        className="text-muted-foreground text-sm"
        role="status"
        aria-live="polite"
      >
        {message ||
          "Set JOURNEY_ADMIN_TOKEN in .env.local (at least 32 characters), restart npm run dev, then enter the token here. It stays in memory for this browser tab."}
        {dirty && " Unsaved changes."}
      </p>
      {data && (
        <>
          <nav aria-label="Editor sections" className="flex flex-wrap gap-2">
            {["activities", "tracks", "challenges", "badgeRules"].map(
              (value) => (
                <Button
                  key={value}
                  variant={tab === value ? "secondary" : "ghost"}
                  aria-pressed={tab === value}
                  onClick={() => switchTab(value)}
                >
                  {value === "badgeRules"
                    ? "Achievements"
                    : value[0].toUpperCase() + value.slice(1)}
                </Button>
              ),
            )}
          </nav>
          {tab === "activities" ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="grow">
                  <Field label="Activity">
                    <FormSelect
                      className={inputClass}
                      value={selected}
                      onChange={(e) => setSelected(Number(e.target.value))}
                    >
                      {data.activities.map((a, i) => (
                        <option key={i} value={i}>
                          {a.title || "Untitled update"} / {a.status}
                        </option>
                      ))}
                    </FormSelect>
                  </Field>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    update({
                      ...data,
                      activities: [...data.activities, newActivity()],
                    });
                    setSelected(data.activities.length);
                  }}
                >
                  New activity
                </Button>
              </div>
              {data.activities[selected] ? (
                <Card>
                  <CardContent>
                    <ActivityEditor
                      key={selected}
                      activity={data.activities[selected]}
                      onChange={(a) =>
                        update({
                          ...data,
                          activities: data.activities.map((item, i) =>
                            i === selected ? a : item,
                          ),
                        })
                      }
                      tracks={data.tracks}
                      projects={projects}
                      blogPosts={posts}
                    />
                  </CardContent>
                </Card>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Create your first activity to start writing.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm leading-6">
                {tab === "tracks"
                  ? "Manage concurrent tracks and ordered milestones. Progress is calculated from completedAt dates. Use activitySlug and projectSlugs to connect existing work. Leave completedAt absent until there is real evidence."
                  : tab === "challenges"
                    ? "Optional challenges have id, title, description, category and visibility. Completion requires a completedAt date and either a public activitySlug or evidenceUrl. No daily streak is required."
                    : "Badge rules use an actual activity metric and a positive target. Existing earned records are preserved automatically; tags cannot award badges."}
              </p>
              {tab === "tracks" && (
                <MilestoneControls
                  tracks={data.tracks}
                  activities={data.activities}
                  onChange={(tracks) => {
                    if (advancedDirty) {
                      setMessage(
                        "Apply the JSON changes before editing milestone controls.",
                      );
                      return;
                    }
                    update({ ...data, tracks });
                    setAdvanced(JSON.stringify(tracks, null, 2));
                  }}
                />
              )}
              <Field
                label={`${tab === "badgeRules" ? "Badge rules" : tab}  /  JSON array`}
              >
                <FormTextarea
                  spellCheck={false}
                  className={`${inputClass} min-h-96 font-mono`}
                  value={advanced}
                  onChange={(e) => {
                    setAdvanced(e.target.value);
                    setAdvancedDirty(true);
                  }}
                />
              </Field>
              <Button variant="outline" onClick={applyAdvanced}>
                Apply to editor
              </Button>
              {tab === "badgeRules" && (
                <div>
                  <h3 className="mb-2 text-sm font-medium">Earned records</h3>
                  {data.awards.length ? (
                    <ul className="space-y-2 text-sm">
                      {data.awards.map((award) => (
                        <li key={award.badgeId}>
                          {award.badgeId} / {award.earnedAt}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No achievements earned yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
