import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarCheck,
  Check,
  Clock3,
  FilePenLine,
  FileText,
  FolderKanban,
  Plus,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardMetrics, DashboardUpdate } from "@/lib/admin/dashboard";

const panel = "min-w-0 rounded-xl border border-white/[0.08] bg-[#101011]";
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400";
const count = (value: number) => value.toLocaleString("en-US");
const dateLabel = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
function contentIcon(kind: string) {
  return kind === "Project"
    ? FolderKanban
    : kind === "Journey"
      ? BookOpen
      : FileText;
}

function Status({ item }: { item: DashboardUpdate }) {
  const label =
    item.status === "draft"
      ? "Draft"
      : item.sample
        ? "Sample"
        : item.visibility === "private"
          ? "Private"
          : item.scheduled
            ? "Scheduled"
            : "Published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium whitespace-nowrap ${label === "Draft" ? "border-orange-400/15 bg-orange-500/[0.07] text-orange-300" : "border-white/[0.08] bg-white/[0.025] text-zinc-300"}`}
    >
      <span
        className={`size-1.5 rounded-full ${label === "Draft" ? "bg-orange-400" : label === "Published" ? "bg-zinc-300" : "bg-zinc-600"}`}
        aria-hidden
      />
      {label}
    </span>
  );
}

function PublishingChart({ metrics }: { metrics: DashboardMetrics }) {
  const hasPosts = !!metrics.monthlyPublications;
  const months =
    metrics.monthlyPublications ??
    metrics.monthlyActivity.map((month) => ({
      ...month,
      posts: 0,
      activities: month.count,
    }));
  const postTotal = months.reduce((total, month) => total + month.posts, 0);
  const activityTotal = months.reduce(
    (total, month) => total + month.activities,
    0,
  );
  const maximum = Math.max(
    4,
    Math.ceil(
      Math.max(
        0,
        ...months.flatMap((month) => [month.posts, month.activities]),
      ) / 4,
    ) * 4,
  );
  const period = months.length
    ? `${months[0].label} – ${months[months.length - 1].label}`
    : "Last 6 months";
  const isEmpty = postTotal + activityTotal === 0;
  return (
    <section
      className={`${panel} flex flex-col p-5 sm:p-6`}
      aria-labelledby="publishing-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="publishing-heading"
            className="text-base font-medium tracking-tight text-zinc-100"
          >
            Publishing activity
          </h2>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Posts and published journey entries by publication month.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-zinc-400">
          <CalendarCheck className="size-3.5" aria-hidden />
          {period}
        </span>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        {hasPosts && (
          <div className="flex items-baseline gap-2.5">
            <span className="size-2 rounded-sm bg-zinc-500" aria-hidden />
            <span className="text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
              {count(postTotal)}
            </span>
            <span className="text-xs text-zinc-400">blog posts</span>
          </div>
        )}
        <div className="flex items-baseline gap-2.5">
          <span className="size-2 rounded-sm bg-orange-400" aria-hidden />
          <span className="text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
            {count(activityTotal)}
          </span>
          <span className="text-xs text-zinc-400">public journey</span>
        </div>
      </div>
      <div className="mt-6 grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)] gap-3">
        <div
          className="relative h-48 text-right text-[10px] text-zinc-400 tabular-nums sm:h-56"
          aria-hidden
        >
          {[4, 3, 2, 1, 0].map((tick, index) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: `${8 + index * 21}%` }}
            >
              {(maximum * tick) / 4}
            </span>
          ))}
        </div>
        <div className="min-w-0">
          <svg
            className="h-48 w-full overflow-visible sm:h-56"
            viewBox="0 0 600 200"
            preserveAspectRatio="none"
            role="img"
            aria-labelledby="publication-chart-title publication-chart-description"
          >
            <title id="publication-chart-title">
              Publications over the last six months
            </title>
            <desc id="publication-chart-description">
              {months
                .map(
                  (month) =>
                    `${month.label}: ${hasPosts ? `${month.posts} posts, ` : ""}${month.activities} journey updates`,
                )
                .join(". ")}
              . Drafts, private, sample and future content are excluded.
            </desc>
            {[0, 1, 2, 3, 4].map((tick) => (
              <line
                key={tick}
                x1="0"
                x2="600"
                y1={16 + tick * 42}
                y2={16 + tick * 42}
                stroke="rgba(255,255,255,0.07)"
                strokeDasharray={tick === 4 ? undefined : "3 5"}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {months.map((month, index) => {
              const unit = 600 / Math.max(1, months.length);
              const middle = unit * (index + 0.5);
              const barWidth = Math.min(20, unit * 0.2);
              return (
                <g key={month.month}>
                  {hasPosts && month.posts > 0 && (
                    <rect
                      x={middle - barWidth - 3}
                      y={184 - (month.posts / maximum) * 168}
                      width={barWidth}
                      height={(month.posts / maximum) * 168}
                      rx="3"
                      fill="#71717a"
                    >
                      <title>
                        {month.label}: {month.posts} posts
                      </title>
                    </rect>
                  )}
                  {month.activities > 0 && (
                    <rect
                      x={hasPosts ? middle + 3 : middle - barWidth / 2}
                      y={184 - (month.activities / maximum) * 168}
                      width={barWidth}
                      height={(month.activities / maximum) * 168}
                      rx="3"
                      fill="#fb923c"
                    >
                      <title>
                        {month.label}: {month.activities} journey updates
                      </title>
                    </rect>
                  )}
                </g>
              );
            })}
          </svg>
          <div
            className="mt-2 grid text-center text-[11px] text-zinc-400"
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, months.length)}, minmax(0,1fr))`,
            }}
            aria-hidden
          >
            {months.map((month) => (
              <span key={month.month}>{month.label.split(" ")[0]}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <p className="max-w-sm text-[11px] leading-5 text-zinc-400">
          {isEmpty
            ? "No public content in this period. Your next publication will appear here."
            : "Posts and journey entries are counted independently. Drafts, private and sample content are excluded."}
        </p>
        <details className="group text-[11px] text-zinc-400">
          <summary
            className={`cursor-pointer rounded-sm underline-offset-4 hover:text-zinc-200 hover:underline ${focus}`}
          >
            View monthly data
          </summary>
          <div className="mt-3">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">
                Monthly public content counts
              </caption>
              <thead>
                <tr>
                  <th className="pr-4 pb-2 font-medium">Month</th>
                  {hasPosts && <th className="pr-4 pb-2 font-medium">Posts</th>}
                  <th className="pb-2 font-medium">Journey</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => (
                  <tr key={month.month}>
                    <th className="py-1 pr-4 font-normal">{month.label}</th>
                    {hasPosts && (
                      <td className="pr-4 tabular-nums">{month.posts}</td>
                    )}
                    <td className="tabular-nums">{month.activities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </section>
  );
}

function DraftQueue({ metrics }: { metrics: DashboardMetrics }) {
  const drafts =
    metrics.draftQueue ??
    metrics.recentUpdates.filter((item) => item.status === "draft").slice(0, 4);
  const breakdown = metrics.draftBreakdown;
  return (
    <section
      id="drafts"
      className={`${panel} flex scroll-mt-24 flex-col`}
      aria-labelledby="drafts-heading"
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <p className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">
            In progress
          </p>
          <h2
            id="drafts-heading"
            className="mt-1 text-base font-medium text-zinc-100"
          >
            Continue working
          </h2>
        </div>
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium tabular-nums ${metrics.drafts ? "border-orange-400/15 bg-orange-500/[0.07] text-orange-300" : "border-white/10 text-zinc-400"}`}
        >
          {count(metrics.drafts)} drafts
        </span>
      </div>
      {drafts.length ? (
        <ul className="mt-4 divide-y divide-white/[0.05] px-3 sm:px-4">
          {drafts.map((item) => {
            const Icon = contentIcon(item.kind);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`group flex min-h-20 items-center gap-3 rounded-md px-2 py-4 transition-colors hover:bg-white/[0.025] ${focus}`}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-zinc-400">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-200">
                      {item.title || "Untitled"}
                    </span>
                    <span className="mt-1 block text-[11px] text-zinc-400">
                      {item.kind} · Edited {dateLabel(item.date)}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-200"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-start justify-center px-6 py-10">
          <span className="mb-3 grid size-9 place-items-center rounded-full border border-white/10 text-zinc-400">
            <Check className="size-4" aria-hidden />
          </span>
          <p className="text-sm font-medium text-zinc-200">No drafts waiting</p>
          <p className="mt-1 text-xs leading-5 text-zinc-400">
            Start a post or document what you’re building.
          </p>
          <Link
            href="/admin/posts/new"
            className={`mt-4 inline-flex min-h-10 items-center gap-2 rounded-sm text-xs text-zinc-200 hover:underline ${focus}`}
          >
            Create a draft <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      )}
      <div className="mt-auto border-t border-white/[0.06] px-5 py-4 sm:px-6">
        {breakdown && (
          <nav
            aria-label="Draft content sections"
            className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-zinc-400"
          >
            {[
              { label: "Posts", value: breakdown.posts, href: "/admin/posts" },
              {
                label: "Projects",
                value: breakdown.projects,
                href: "/admin/projects",
              },
              {
                label: "Journey",
                value: breakdown.activities,
                href: "/admin/activities",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-h-8 items-center gap-2 rounded-sm hover:text-zinc-100 ${focus}`}
              >
                {item.label}
                <span className="font-medium text-zinc-200 tabular-nums">
                  {item.value}
                </span>
              </Link>
            ))}
          </nav>
        )}
        {!!metrics.nextPublication && (
          <Link
            href={metrics.nextPublication.href}
            className={`mt-3 flex items-start gap-2 rounded-md border border-white/[0.07] p-3 hover:bg-white/[0.025] ${focus}`}
          >
            <Clock3
              className="mt-0.5 size-3.5 shrink-0 text-zinc-400"
              aria-hidden
            />
            <span className="min-w-0 text-xs">
              <span className="block text-zinc-400">
                Next post · {dateLabel(metrics.nextPublication.date)}
              </span>
              <span className="mt-1 block truncate font-medium text-zinc-200">
                {metrics.nextPublication.title}
              </span>
              {(metrics.scheduledPosts ?? 0) > 1 && (
                <span className="mt-1 block text-[11px] text-zinc-400">
                  {metrics.scheduledPosts} posts scheduled
                </span>
              )}
            </span>
            <ArrowUpRight
              className="ml-auto size-3.5 shrink-0 text-zinc-400"
              aria-hidden
            />
          </Link>
        )}
      </div>
    </section>
  );
}

export function DashboardOverview({ metrics }: { metrics: DashboardMetrics }) {
  const stats = [
    {
      label: "Published posts",
      value: metrics.publishedPosts,
      note: "Public and live",
      icon: FileText,
      href: "/admin/posts",
    },
    {
      label: "Projects",
      value: metrics.projects,
      note: "Across your portfolio",
      icon: FolderKanban,
      href: "/admin/projects",
    },
    {
      label: "Journey activities",
      value: metrics.activities,
      note: "Managed journey records",
      icon: BookOpen,
      href: "/admin/activities",
    },
    {
      label: "Drafts",
      value: metrics.drafts,
      note: "Across posts, projects & journey",
      icon: FilePenLine,
      href: "#drafts",
    },
  ];
  const learning = [
    {
      label: "Active tracks",
      value: metrics.activeTracks,
      icon: Route,
      href: "/admin/tracks",
    },
    {
      label: "Completed challenges",
      value: metrics.completedChallenges,
      icon: CalendarCheck,
      href: "/admin/challenges",
    },
    {
      label: "Earned achievements",
      value: metrics.earnedAchievements,
      icon: Award,
      href: "/admin/achievements",
    },
  ];
  return (
    <div className="min-w-0 space-y-6 text-zinc-100">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-1">
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-zinc-400 uppercase">
            Studio overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[32px]">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Publishing, projects and your learning journey.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="min-h-11 border-white/10 bg-transparent text-zinc-300 hover:bg-white/5"
          >
            <Link href="/admin/projects/new">
              <FolderKanban className="size-4" aria-hidden />
              New project
            </Link>
          </Button>
          <Button
            asChild
            className="min-h-11 bg-orange-500 font-semibold text-black hover:bg-orange-400"
          >
            <Link href="/admin/posts/new">
              <Plus className="size-4" aria-hidden />
              New post
            </Link>
          </Button>
        </div>
      </header>
      <section
        aria-label="Content overview"
        className={`${panel} grid grid-cols-2 overflow-hidden sm:grid-cols-4`}
      >
        {stats.map(({ label, value, note, icon: Icon, href }, index) => (
          <Link
            key={label}
            href={href}
            className={`group min-w-0 px-4 py-5 transition-colors hover:bg-white/[0.025] sm:px-5 ${focus} ${index % 2 ? "border-l border-white/[0.08]" : ""} ${index > 1 ? "border-t border-white/[0.08] sm:border-t-0 sm:border-l" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-zinc-400">{label}</span>
              <Icon className="size-3.5 shrink-0 text-zinc-400" aria-hidden />
            </div>
            <p
              className={`mt-3 text-[32px] leading-none font-semibold tracking-tight tabular-nums ${label === "Drafts" && value > 0 ? "text-orange-300" : "text-zinc-100"}`}
            >
              {count(value)}
            </p>
            <p className="mt-2 text-[10px] leading-4 text-zinc-400">{note}</p>
          </Link>
        ))}
      </section>
      <div className="grid min-w-0 items-stretch gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
        <PublishingChart metrics={metrics} />
        <DraftQueue metrics={metrics} />
      </div>
      <section
        className={`${panel} overflow-hidden`}
        aria-labelledby="recent-work-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-5 sm:px-6">
          <div>
            <h2 id="recent-work-heading" className="text-base font-medium">
              Recent work
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Your latest edits across posts, projects and journey.
            </p>
          </div>
          <Link
            href="/admin/activities/new"
            className={`inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-xs font-medium text-zinc-300 hover:bg-white/5 ${focus}`}
          >
            <Plus className="size-3.5" aria-hidden />
            Log an activity
          </Link>
        </div>
        {metrics.recentUpdates.length ? (
          <table className="w-full table-fixed text-left">
            <caption className="sr-only">
              Recent content updates, their publication status, and edit links
            </caption>
            <thead className="border-b border-white/[0.05] bg-white/[0.015] text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                  Content
                </th>
                <th
                  scope="col"
                  className="hidden w-28 px-3 py-3 font-medium lg:table-cell"
                >
                  Type
                </th>
                <th scope="col" className="w-24 px-2 py-3 font-medium sm:w-28">
                  Status
                </th>
                <th
                  scope="col"
                  className="hidden w-28 px-3 py-3 font-medium md:table-cell"
                >
                  Updated
                </th>
                <th scope="col" className="w-14 pr-4">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {metrics.recentUpdates.map((item) => {
                const Icon = contentIcon(item.kind);
                return (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-white/[0.02]"
                  >
                    <th scope="row" className="px-5 py-4 font-normal sm:px-6">
                      <Link
                        href={item.href}
                        className={`flex min-h-10 min-w-0 items-center gap-3 rounded-sm ${focus}`}
                      >
                        <span className="hidden size-9 shrink-0 place-items-center rounded-lg border border-white/[0.06] text-zinc-400 sm:grid">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-zinc-200 group-hover:text-white">
                            {item.title || "Untitled"}
                          </span>
                          <span className="mt-1 block text-[10px] text-zinc-400 lg:hidden">
                            {item.kind}
                            <span className="md:hidden">
                              {" "}
                              · {dateLabel(item.date)}
                            </span>
                          </span>
                        </span>
                      </Link>
                    </th>
                    <td className="hidden px-3 text-xs text-zinc-400 lg:table-cell">
                      {item.kind}
                    </td>
                    <td className="px-2">
                      <Status item={item} />
                    </td>
                    <td className="hidden px-3 text-xs text-zinc-400 md:table-cell">
                      <time dateTime={item.date}>{dateLabel(item.date)}</time>
                    </td>
                    <td className="pr-3">
                      <Link
                        href={item.href}
                        aria-label={`Edit ${item.title}`}
                        className={`grid size-10 place-items-center rounded-md text-zinc-400 hover:bg-white/5 hover:text-zinc-100 ${focus}`}
                      >
                        <ArrowUpRight className="size-4" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-10">
            <div>
              <p className="text-sm text-zinc-300">No recent work yet</p>
              <p className="mt-1 text-xs text-zinc-400">
                Create your first post, project or journey update.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/posts/new">
                <Plus className="size-4" aria-hidden />
                Create a post
              </Link>
            </Button>
          </div>
        )}
      </section>
      <section
        aria-labelledby="learning-progress-heading"
        className="border-t border-white/[0.08] pt-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="learning-progress-heading"
            className="text-xs font-medium text-zinc-400"
          >
            Learning progress
          </h2>
          <Link
            href="/journey"
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-sm text-[11px] text-zinc-400 hover:text-zinc-200 ${focus}`}
          >
            View public journey
            <ArrowUpRight className="size-3" aria-hidden />
          </Link>
        </div>
        <div className="mt-2 grid gap-1 sm:grid-cols-3">
          {learning.map(({ label, value, icon: Icon, href }) => (
            <Link
              key={href}
              href={href}
              className={`group flex min-h-14 items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.025] ${focus}`}
            >
              <Icon className="size-4 shrink-0 text-zinc-400" aria-hidden />
              <span className="text-xs text-zinc-400">{label}</span>
              <span className="ml-auto text-lg font-medium tabular-nums">
                {count(value)}
              </span>
              <ArrowRight
                className="size-3.5 text-zinc-600 group-hover:text-zinc-300"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
