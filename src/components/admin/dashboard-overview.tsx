import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Award, BookOpen, CalendarCheck, FilePenLine, FileText, FolderKanban, Plus, Route } from "lucide-react";
import type { DashboardMetrics } from "@/lib/admin/dashboard";

const panel = "rounded-xl border border-white/10 bg-[#121213] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]";

export function DashboardOverview({ metrics }: { metrics: DashboardMetrics }) {
  const maxActivity = Math.max(1, ...metrics.monthlyActivity.map((item) => item.count));
  const cards = [
    { label: "Published posts", value: metrics.publishedPosts, icon: FileText, href: "/admin/posts" },
    { label: "Projects", value: metrics.projects, icon: FolderKanban, href: "/admin/projects" },
    { label: "Journey activities", value: metrics.activities, icon: BookOpen, href: "/admin/activities" },
    { label: "Active tracks", value: metrics.activeTracks, icon: Route, href: "/admin/tracks" },
    { label: "Completed challenges", value: metrics.completedChallenges, icon: CalendarCheck, href: "/admin/challenges" },
    { label: "Earned achievements", value: metrics.earnedAchievements, icon: Award, href: "/admin/achievements" },
    { label: "Drafts", value: metrics.drafts, icon: FilePenLine, href: null },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-orange-400">Your workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-400">Your content, learning and work in one place.</p>
        </div>
        <Link href="/admin/posts/new" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-black transition-colors hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400">
          <Plus className="size-4" /> New post
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-4">
          <section aria-label="Content overview" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ label, value, icon: Icon, href }, index) => {
              const content = (
                <>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm text-zinc-400">{label}</span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/5 text-orange-400"><Icon className="size-4" aria-hidden /></span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-3xl font-semibold tracking-tight text-white tabular-nums">{value}</span>
                  {href && <ArrowUpRight className="size-4 text-zinc-600 transition-colors group-hover:text-orange-400" aria-hidden />}
                </div>
                </>
              );
              const className = `${panel} group relative min-h-32 overflow-hidden p-5 ${index === 0 ? "bg-[radial-gradient(ellipse_at_bottom_right,rgba(234,88,12,0.19),transparent_65%)] sm:col-span-2 lg:col-span-1" : ""}`;
              return href ? (
                <Link key={label} href={href} className={`${className} transition-colors hover:border-orange-400/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400`}>{content}</Link>
              ) : <div key={label} className={className}>{content}</div>;
            })}
          </section>
          <section aria-labelledby="activity-chart-title" className={`${panel} p-5 sm:p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs text-zinc-400">Your learning journey</p><h2 id="activity-chart-title" className="mt-1 text-lg font-medium text-white">Published activity</h2></div>
              <span className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-zinc-400">Last 6 months</span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">Public journey updates by month.</p>
            <div className="mt-7 flex h-40 items-end gap-3 sm:gap-5" role="img" aria-label={metrics.monthlyActivity.map((item) => item.label + ": " + item.count).join(", ")}>
              {metrics.monthlyActivity.map((item) => (
                <div key={item.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs text-zinc-400 tabular-nums">{item.count}</span>
                  <div className="flex w-full flex-1 items-end overflow-hidden rounded-sm bg-white/[0.03]">
                    <div className="w-full rounded-sm bg-gradient-to-t from-orange-700 to-orange-400" style={{ height: Math.max(item.count ? 4 : 0, (item.count / maxActivity) * 100) + "%" }} />
                  </div>
                  <span className="truncate text-xs text-zinc-400">{item.label.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="space-y-4">
          <section className={`${panel} p-5`} aria-labelledby="quick-actions-title">
            <div className="flex items-center justify-between"><h2 id="quick-actions-title" className="text-base font-medium text-white">Quick actions</h2><Plus className="size-4 text-zinc-400" aria-hidden /></div>
            <p className="mt-1 text-sm text-zinc-400">Pick up where you left off.</p>
            <nav aria-label="Quick actions" className="mt-5 space-y-2">
              {[{ label: "New post", href: "/admin/posts/new", icon: FileText }, { label: "New project", href: "/admin/projects/new", icon: FolderKanban }, { label: "New activity", href: "/admin/activities/new", icon: BookOpen }].map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className="group flex min-h-12 items-center gap-3 rounded-lg bg-white/[0.035] px-3 text-sm text-zinc-200 transition-colors hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-orange-400">
                  <span className="grid size-8 place-items-center rounded-md bg-white/5 text-orange-400"><Icon className="size-4" aria-hidden /></span>{label}<ArrowRight className="ml-auto size-4 text-zinc-500 group-hover:text-orange-400" aria-hidden />
                </Link>
              ))}
            </nav>
          </section>
          <section className={`${panel} overflow-hidden`} aria-labelledby="recent-updates-title">
            <div className="flex items-center justify-between gap-3 p-5">
              <div><p className="text-xs text-zinc-400">Your latest work</p><h2 id="recent-updates-title" className="mt-1 text-base font-medium text-white">Recent updates</h2></div>
              <Link className="grid size-9 place-items-center rounded-lg bg-white/5 text-zinc-300 hover:text-orange-400" href="/admin/activities" aria-label="View journey"><ArrowUpRight className="size-4" /></Link>
            </div>
            {metrics.recentUpdates.length ? (
              <ul className="divide-y divide-white/5">
                {metrics.recentUpdates.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/5 text-zinc-400"><ArrowDownRight className="size-4" aria-hidden /></span>
                    <div className="min-w-0 flex-1"><Link href={item.href} className="block truncate text-sm font-medium text-zinc-100 underline-offset-4 hover:underline">{item.title}</Link><p className="mt-1 text-xs text-zinc-400">{item.kind} · {item.status}</p></div>
                    <time className="shrink-0 text-xs text-zinc-400" dateTime={item.date}>{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time>
                  </li>
                ))}
              </ul>
            ) : <p className="px-5 pb-6 text-sm text-zinc-400">No content updates yet.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
