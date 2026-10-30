"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ActivityEditor } from "@/components/journey/activity-editor";
import { isChallengeComplete, reconcileAwards } from "@/lib/journey/logic";
import { isPublicContent } from "@/lib/admin/validation";
import { publicJourneyActivities } from "@/lib/admin/public-journey";
import { saveContent, deleteContent } from "@/lib/admin/client";
import type { ContentKind } from "@/lib/admin/revalidation";
import type {
  InitialContentSnapshot,
  ManagedPost,
  ManagedProject,
} from "@/lib/admin/content-types";
import type {
  Activity,
  BadgeRule,
  Challenge,
  Track,
} from "@/lib/journey/types";
import { AchievementEditor } from "./achievement-editor";
import { ChallengeEditor } from "./challenge-editor";
import { ContentTable, type AdminTableRow } from "./content-table";
import { DeleteContentDialog } from "./delete-content-dialog";
import { PostEditor } from "./post-editor";
import { ProjectEditor } from "./project-editor";
import { TrackEditor } from "./track-editor";

export { isContentSection } from "@/lib/admin/content-sections";
import {
  contentSections,
  type ContentSection,
} from "@/lib/admin/content-sections";
export type { ContentSection } from "@/lib/admin/content-sections";
const now = () => new Date().toISOString();
function emptyPost(): ManagedPost {
  const date = now();
  return {
    slug: "",
    title: "",
    description: "",
    content: "",
    publishedAt: date.slice(0, 10),
    updatedAt: date,
    status: "draft",
    visibility: "private",
    sample: false,
    frontmatter: {},
  };
}
function emptyProject(): ManagedProject {
  const date = now();
  return {
    slug: "",
    status: "draft",
    visibility: "private",
    updatedAt: date,
    project: {
      slug: "",
      title: "",
      description: "",
      overview: "",
      src: "",
      link: "",
      date: date.slice(0, 10),
      technologies: [],
    },
  };
}
function emptyActivity(): Activity {
  const date = now();
  return {
    slug: `update-${Date.now()}`,
    title: "",
    description: "",
    content: "",
    type: "learning",
    date,
    updatedAt: date,
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
function emptyTrack(): Track {
  return {
    slug: "",
    title: "",
    description: "",
    technologies: [],
    status: "planned",
    visibility: "private",
    milestones: [],
    projectSlugs: [],
  };
}
function emptyChallenge(): Challenge {
  return {
    id: "",
    title: "",
    category: "Learning",
    description: "",
    visibility: "private",
  };
}
function emptyAchievement(): BadgeRule {
  return {
    id: "",
    title: "",
    description: "",
    requirement: "",
    metric: "learning",
    target: 1,
  };
}
function status(item: {
  status: string;
  visibility: string;
  sample?: boolean;
  publishedAt?: string;
}) {
  return item.sample
    ? "Sample"
    : item.status === "draft"
      ? "Draft"
      : item.visibility === "private"
        ? "Private"
        : item.publishedAt && Date.parse(item.publishedAt) > Date.now()
          ? "Scheduled"
          : "Published";
}

export function contentRows(
  section: ContentSection,
  snapshot: InitialContentSnapshot,
): AdminTableRow[] {
  const root = `/admin/${section}`;
  if (section === "posts")
    return snapshot.posts.map((item) => ({
      id: item.slug,
      href: `${root}/edit/${item.slug}`,
      values: {
        title: item.title,
        status: status(item),
        date: item.updatedAt.slice(0, 10),
      },
    }));
  if (section === "projects")
    return snapshot.projects.map((item) => ({
      id: item.slug,
      href: `${root}/edit/${item.slug}`,
      values: {
        title: item.project.title,
        status: status(item),
        date: item.updatedAt.slice(0, 10),
      },
    }));
  if (section === "activities")
    return snapshot.journey.activities.map((item) => ({
      id: item.slug,
      href: `${root}/edit/${item.slug}`,
      values: {
        title: item.title,
        status: status({ ...item, publishedAt: item.date }),
        type: item.type,
        date: item.updatedAt.slice(0, 10),
      },
    }));
  if (section === "tracks")
    return snapshot.journey.tracks.map((item) => ({
      id: item.slug,
      href: `${root}/edit/${item.slug}`,
      values: {
        title: item.title,
        status: item.status.replaceAll("-", " "),
        visibility: item.visibility,
        date: item.startDate?.slice(0, 10) || "—",
      },
    }));
  if (section === "challenges")
    return snapshot.journey.challenges.map((item) => ({
      id: item.id,
      href: `${root}/edit/${item.id}`,
      values: {
        title: item.title,
        status: isChallengeComplete(item, snapshot.journey.activities)
          ? "Completed"
          : "Open",
        category: item.category,
        date: item.completedAt?.slice(0, 10) || item.date?.slice(0, 10) || "—",
      },
    }));
  const awards = reconcileAwards({
    ...snapshot.journey,
    activities: publicJourneyActivities(snapshot),
  }).awards;
  return snapshot.journey.badgeRules.map((item) => ({
    id: item.id,
    href: `${root}/edit/${item.id}`,
    values: {
      title: item.title,
      status: awards.some((award) => award.badgeId === item.id)
        ? "Earned"
        : "Locked",
      criterion: item.metric.replaceAll("-", " "),
      date:
        awards
          .find((award) => award.badgeId === item.id)
          ?.earnedAt.slice(0, 10) || "—",
    },
  }));
}
export function ContentList({
  section,
  snapshot,
}: {
  section: ContentSection;
  snapshot: InitialContentSnapshot;
}) {
  const definition = contentSections[section];
  const rows = contentRows(section, snapshot);
  const columns = [
    { key: "title", label: "Title", sortable: true },
    { key: "status", label: "Status", sortable: true },
    ...(section === "activities"
      ? [{ key: "type", label: "Type", sortable: true }]
      : section === "tracks"
        ? [{ key: "visibility", label: "Visibility", sortable: true }]
        : section === "challenges"
          ? [{ key: "category", label: "Category", sortable: true }]
          : section === "achievements"
            ? [{ key: "criterion", label: "Criterion", sortable: true }]
            : []),
    { key: "date", label: "Date", sortable: true },
  ];
  const filters = [
    {
      key: "status",
      label: "Status",
      options: [...new Set(rows.map((row) => row.values.status))].sort(),
    },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{definition.label}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your {definition.label.toLocaleLowerCase()}.
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/${section}/new`}>
            <Plus />
            New {definition.singular}
          </Link>
        </Button>
      </div>
      <ContentTable
        columns={columns}
        rows={rows}
        filters={filters}
        emptyMessage={`No ${definition.label.toLocaleLowerCase()} found.`}
      />
    </div>
  );
}

function ActivityForm({
  initial,
  snapshot,
  onSave,
  identifierLocked,
}: {
  initial: Activity;
  snapshot: InitialContentSnapshot;
  onSave: (value: Activity) => Promise<void>;
  identifierLocked: boolean;
}) {
  const [activity, setActivity] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const projects = snapshot.projects.map((item) => ({
    slug: item.slug,
    title: item.project.title,
  }));
  const blogPosts = snapshot.posts
    .filter((post) => isPublicContent(post))
    .map((post) => ({ slug: post.slug, title: post.title }));
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(activity);
      setSaved(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save this activity.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {initial.title ? "Edit activity" : "New activity"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Share a learning, research or building update.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save activity"}
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
          Activity saved.
        </p>
      )}
      <ActivityEditor
        activity={activity}
        identifierLocked={identifierLocked}
        enableMedia
        onChange={(value) => {
          setActivity(value);
          setSaved(false);
        }}
        tracks={snapshot.journey.tracks}
        projects={projects}
        blogPosts={blogPosts}
      />
    </form>
  );
}

export function ContentEdit({
  section,
  id,
  snapshot,
  creating = id === "new",
}: {
  section: ContentSection;
  id: string;
  snapshot: InitialContentSnapshot;
  creating?: boolean;
}) {
  const router = useRouter();
  const definition = contentSections[section];
  const [created, setCreated] = useState<{ source: string; id: string } | null>(
    null,
  );
  const createdId = created?.source === `${section}:${id}` ? created.id : null;
  const item = useMemo(() => {
    if (section === "posts")
      return creating
        ? emptyPost()
        : snapshot.posts.find((row) => row.slug === id);
    if (section === "projects")
      return creating
        ? emptyProject()
        : snapshot.projects.find((row) => row.slug === id);
    if (section === "activities")
      return creating
        ? emptyActivity()
        : snapshot.journey.activities.find((row) => row.slug === id);
    if (section === "tracks")
      return creating
        ? emptyTrack()
        : snapshot.journey.tracks.find((row) => row.slug === id);
    if (section === "challenges")
      return creating
        ? emptyChallenge()
        : snapshot.journey.challenges.find((row) => row.id === id);
    return creating
      ? emptyAchievement()
      : snapshot.journey.badgeRules.find((row) => row.id === id);
  }, [section, id, snapshot, creating]);
  if (!item)
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Content not found</h1>
        <p className="text-muted-foreground text-sm">
          This record may have been removed.
        </p>
        <Link href={`/admin/${section}`} className="underline">
          Back to {definition.label}
        </Link>
      </div>
    );
  const list = `/admin/${section}`;
  async function save<T>(value: T) {
    const result = await saveContent<T>(
      definition.kind as ContentKind,
      value,
      createdId || (creating ? undefined : id),
    );
    if (!result.revalidated)
      toast.warning(
        "Saved, but public pages could not be refreshed. Refresh them after resolving the cache issue.",
      );
    else toast.success("Saved successfully.");
    if (creating) {
      const saved = result.record as Record<string, unknown>;
      const identifier =
        definition.kind === "challenge" || definition.kind === "achievement"
          ? saved.id
          : saved.slug;
      setCreated({ source: `${section}:${id}`, id: String(identifier) });
      router.replace(`${list}/edit/${encodeURIComponent(String(identifier))}`);
    }
    router.refresh();
  }
  async function remove() {
    const result = await deleteContent(definition.kind, id);
    if (!result.revalidated)
      toast.warning("Deleted, but public pages could not be refreshed.");
    else toast.success("Deleted successfully.");
    router.replace(list);
    router.refresh();
  }

  const projects = snapshot.projects.map((project) => ({
    slug: project.slug,
    title: project.project.title,
  }));
  const tracks = snapshot.journey.tracks.map((track) => ({
    slug: track.slug,
    title: track.title,
  }));
  const awards = reconcileAwards({
    ...snapshot.journey,
    activities: publicJourneyActivities(snapshot),
  }).awards;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={list}
          className="text-muted-foreground hover:text-foreground inline-flex min-h-10 items-center gap-2 text-sm"
        >
          <ArrowLeft className="size-4" />
          {definition.label}
        </Link>
        {!creating && (
          <DeleteContentDialog title={definition.singular} onDelete={remove} />
        )}
      </div>
      {section === "posts" && (
        <PostEditor
          key={`${section}:${id}`}
          initial={item as ManagedPost}
          identifierLocked={!creating || Boolean(createdId)}
          tracks={tracks}
          projects={projects}
          onSave={save}
        />
      )}
      {section === "projects" && (
        <ProjectEditor
          key={`${section}:${id}`}
          initial={item as ManagedProject}
          identifierLocked={!creating || Boolean(createdId)}
          onSave={save}
        />
      )}
      {section === "activities" && (
        <ActivityForm
          key={`${section}:${id}`}
          initial={item as Activity}
          identifierLocked={!creating || Boolean(createdId)}
          snapshot={snapshot}
          onSave={save}
        />
      )}
      {section === "tracks" && (
        <TrackEditor
          key={`${section}:${id}`}
          initial={item as Track}
          identifierLocked={!creating || Boolean(createdId)}
          activities={snapshot.journey.activities}
          projects={projects}
          onSave={save}
        />
      )}
      {section === "challenges" && (
        <ChallengeEditor
          key={`${section}:${id}`}
          initial={item as Challenge}
          identifierLocked={!creating || Boolean(createdId)}
          activities={snapshot.journey.activities}
          onSave={save}
        />
      )}
      {section === "achievements" && (
        <AchievementEditor
          key={`${section}:${id}`}
          initial={item as BadgeRule}
          identifierLocked={!creating || Boolean(createdId)}
          earned={awards.some((award) => award.badgeId === id)}
          onSave={save}
        />
      )}
    </div>
  );
}
