import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Circle,
  FlaskConical,
  Hammer,
  LockKeyhole,
  NotebookPen,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { activityHref, trackProgress } from "@/lib/journey/logic";
import type { Activity, Track, AchievementView } from "@/lib/journey/types";

export const activityLabels = {
  learning: "Learning",
  research: "Research",
  building: "Building",
  article: "Articles",
  milestone: "Milestones",
};
const activityIcons = {
  learning: BookOpen,
  research: FlaskConical,
  building: Hammer,
  article: NotebookPen,
  milestone: Trophy,
};

export function JourneySection({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="page-section">
      <div className="section-bar screen-line-bottom">
        <h2 className="section-title">{title}</h2>
        {meta ? <span className="mono-note">{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function Technologies({ items }: { items: string[] }) {
  return items.length ? (
    <ul className="flex flex-wrap gap-2" aria-label="Technologies">
      {items.map((item) => (
        <li key={item} className="stack-chip !text-xs">
          {item}
        </li>
      ))}
    </ul>
  ) : null;
}

const trackStatuses = {
  planned: { label: "Planned", dot: "bg-muted-foreground", pulse: false },
  active: { label: "Active", dot: "bg-green-500", pulse: true },
  paused: { label: "Paused", dot: "bg-red-500", pulse: true },
  "on-break": { label: "On break", dot: "bg-orange-500", pulse: true },
  completed: { label: "Completed", dot: "bg-muted-foreground", pulse: false },
} satisfies Record<
  Track["status"],
  { label: string; dot: string; pulse: boolean }
>;

export function TrackStatus({ status }: { status: Track["status"] }) {
  const { label, dot, pulse } = trackStatuses[status];
  return (
    <span className="text-muted-foreground inline-flex items-center gap-2 font-mono text-xs">
      <span aria-hidden="true" className="relative inline-flex size-2 shrink-0">
        {pulse && (
          <span
            className={`absolute inline-flex size-full rounded-full opacity-50 motion-safe:animate-ping ${dot}`}
          />
        )}
        <span className={`relative inline-flex size-2 rounded-full ${dot}`} />
      </span>
      <span className="sr-only">Track status: </span>
      {label}
    </span>
  );
}

export function ActivityCard({ activity }: { activity: Activity }) {
  const Icon = activityIcons[activity.type];
  return (
    <article className="screen-line-bottom px-4 py-5">
      <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs">
        <Icon className="size-4" aria-hidden />
        <span>
          {activity.type === "article"
            ? "Article"
            : activityLabels[activity.type]}
        </span>
        <time dateTime={activity.date}>
          {new Date(activity.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })}
        </time>
        {activity.completion === "completed" && (
          <span className="inline-flex items-center gap-1">
            <Check className="size-3" aria-hidden />
            Completed
          </span>
        )}
      </div>
      <h3 className="text-base font-medium">
        <Link href={activityHref(activity)} className="link-underline">
          {activity.title}
        </Link>
      </h3>
      <p className="text-muted-foreground mt-2 max-w-[65ch] text-sm leading-6">
        {activity.description}
      </p>
      <div className="mt-4">
        <Technologies items={activity.technologies} />
      </div>
      {activity.trackSlugs.length > 0 && (
        <div className="text-muted-foreground mt-3 flex flex-wrap gap-3 text-xs">
          {activity.trackSlugs.map((slug) => (
            <Link
              key={slug}
              href={`/journey/${slug}`}
              className="link-underline inline-flex min-h-11 items-center"
            >
              {slug.replaceAll("-", " ")}
            </Link>
          ))}
        </div>
      )}
      {activity.projectSlugs.length > 0 && (
        <div className="text-muted-foreground mt-3 flex flex-wrap gap-3 text-xs">
          {activity.projectSlugs.map((slug) => (
            <Link
              key={slug}
              href={`/projects/${slug}`}
              className="link-underline inline-flex min-h-11 items-center"
            >
              Project: {slug.replaceAll("-", " ")}
            </Link>
          ))}
        </div>
      )}
      <Link
        href={activityHref(activity)}
        className="link-underline mt-4 inline-flex min-h-11 items-center gap-1 text-xs"
      >
        Read more
        <ArrowUpRight className="size-3" aria-hidden />
      </Link>
    </article>
  );
}

export function LearningTrackCard({
  track,
  featured = false,
}: {
  track: Track;
  featured?: boolean;
}) {
  const progress = trackProgress(track);
  return (
    <Card className="border-border bg-background mx-4 gap-0 py-5 shadow-none">
      <CardContent className="space-y-4 px-5">
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <span>{featured ? "Currently exploring" : "Learning track"}</span>
          <TrackStatus status={track.status} />
        </div>
        <h3 className="text-lg font-medium">
          <Link href={`/journey/${track.slug}`} className="link-underline">
            {track.title}
          </Link>
        </h3>
        <p className="text-muted-foreground text-sm leading-6">
          {track.description}
        </p>
        <Technologies items={track.technologies} />
        <div>
          <div className="text-muted-foreground mb-2 flex justify-between text-xs">
            <span>
              {track.milestones.filter((m) => m.completedAt).length} /{" "}
              {track.milestones.length} milestones
            </span>
            <span className="font-mono tabular-nums">{progress}%</span>
          </div>
          <progress
            aria-label={`${track.title} progress`}
            value={progress}
            max={100}
            className="bg-muted accent-foreground [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-foreground [&::-moz-progress-bar]:bg-foreground h-1.5 w-full overflow-hidden rounded-full"
          />
        </div>
        <Link
          href={`/journey/${track.slug}`}
          className="link-underline inline-flex min-h-11 items-center gap-1 text-sm"
        >
          Explore track
          <ArrowUpRight className="size-3" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}

export function AchievementGrid({
  achievements,
}: {
  achievements: AchievementView[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2">
      {achievements.map((badge) => (
        <Card
          key={badge.id}
          className="border-border bg-background gap-0 py-5 shadow-none"
        >
          <CardContent className="space-y-3 px-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">{badge.title}</h3>
              {badge.earnedAt ? (
                <Trophy className="size-4" aria-label="Earned" />
              ) : (
                <LockKeyhole
                  className="text-muted-foreground size-4"
                  aria-label="Locked"
                />
              )}
            </div>
            <p className="text-muted-foreground text-sm leading-6">
              {badge.description}
            </p>
            <p className="text-muted-foreground text-xs leading-5">
              {badge.requirement}
            </p>
            <div className="text-muted-foreground flex items-center justify-between gap-2 font-mono text-xs">
              <span>
                {badge.earnedAt
                  ? `Earned ${new Date(badge.earnedAt).toLocaleDateString("en-US", { timeZone: "UTC" })}`
                  : "Locked"}
              </span>
              <span className="tabular-nums">
                {Math.min(badge.current, badge.target)} / {badge.target}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function LearningMilestones({ track }: { track: Track }) {
  return (
    <ol className="px-4">
      {track.milestones.map((milestone, index) => (
        <li
          key={milestone.id}
          className="border-border flex items-start gap-3 border-b py-4"
        >
          {milestone.completedAt ? (
            <Check className="mt-1 size-4 shrink-0" aria-label="Completed" />
          ) : (
            <Circle
              className="text-muted-foreground mt-1 size-4 shrink-0"
              aria-label="Pending"
            />
          )}
          <div className="text-sm leading-6">
            <span className="text-muted-foreground mr-2 font-mono text-xs">
              {String(index + 1).padStart(2, "0")}
            </span>
            {milestone.title}
            {milestone.completedAt && (
              <time
                className="text-muted-foreground ml-2 text-xs"
                dateTime={milestone.completedAt}
              >
                {new Date(milestone.completedAt).toLocaleDateString("en-US", {
                  timeZone: "UTC",
                })}
              </time>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function JourneyBreadcrumbs({
  title,
  track,
}: {
  title: string;
  track?: { title: string; slug: string };
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-muted-foreground flex flex-wrap items-center gap-2 px-4 pt-6 text-xs"
    >
      <Link
        href="/journey"
        className="link-underline inline-flex min-h-11 items-center"
      >
        Journey
      </Link>
      <span aria-hidden>/</span>
      {track && (
        <>
          <Link
            href={`/journey/${track.slug}`}
            className="link-underline inline-flex min-h-11 items-center"
          >
            {track.title}
          </Link>
          <span aria-hidden>/</span>
        </>
      )}
      <span aria-current="page">{title}</span>
    </nav>
  );
}
