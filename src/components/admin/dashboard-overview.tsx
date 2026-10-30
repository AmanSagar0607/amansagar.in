import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarCheck,
  FilePenLine,
  FileText,
  FolderKanban,
  Route,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardMetrics } from "@/lib/admin/dashboard";

export function DashboardOverview({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    { label: "Published posts", value: metrics.publishedPosts, icon: FileText },
    { label: "Projects", value: metrics.projects, icon: FolderKanban },
    { label: "Journey activities", value: metrics.activities, icon: BookOpen },
    { label: "Active tracks", value: metrics.activeTracks, icon: Route },
    {
      label: "Completed challenges",
      value: metrics.completedChallenges,
      icon: CalendarCheck,
    },
    {
      label: "Earned achievements",
      value: metrics.earnedAchievements,
      icon: Award,
    },
    { label: "Drafts", value: metrics.drafts, icon: FilePenLine },
  ];
  return (
    <div className="space-y-8">
      <div>
        <p className="text-muted-foreground text-sm">Portfolio / Overview</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Your content, learning and work in one place.
        </p>
      </div>
      <nav aria-label="Quick actions" className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/admin/posts/new">New post</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/projects/new">New project</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/activities/new">New activity</Link>
        </Button>
      </nav>
      <section
        aria-label="Content overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="gap-3 py-5">
            <CardHeader className="flex items-center justify-between gap-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {label}
              </CardTitle>
              <Icon className="text-muted-foreground size-4" aria-hidden />
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold tabular-nums">
                {value}
              </span>
            </CardContent>
          </Card>
        ))}
      </section>
      <section aria-labelledby="activity-chart-title">
        <div className="mb-4">
          <h2 id="activity-chart-title" className="text-lg font-semibold">
            Published activity
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Public articles and journey updates, by month.
          </p>
        </div>
        <Card className="py-5">
          <CardContent>
            <div
              className="flex h-40 items-end gap-2 sm:gap-4"
              role="img"
              aria-label={metrics.monthlyActivity
                .map((item) => item.label + ": " + item.count)
                .join(", ")}
            >
              {metrics.monthlyActivity.map((item) => {
                const max = Math.max(
                  1,
                  ...metrics.monthlyActivity.map((value) => value.count),
                );
                return (
                  <div
                    key={item.month}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {item.count}
                    </span>
                    <div
                      className="bg-muted flex w-full items-end overflow-hidden rounded-sm"
                      style={{ height: "100%" }}
                    >
                      <div
                        className="bg-foreground/80 w-full rounded-sm"
                        style={{
                          height:
                            Math.max(
                              item.count ? 4 : 0,
                              (item.count / max) * 100,
                            ) + "%",
                        }}
                      />
                    </div>
                    <span className="text-muted-foreground truncate text-xs">
                      {item.label.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent updates</h2>
          <Link
            className="text-muted-foreground hover:text-foreground inline-flex min-h-10 items-center gap-1 text-sm"
            href="/admin/activities"
          >
            View journey <ArrowRight className="size-4" />
          </Link>
        </div>
        <Card className="gap-0 py-0">
          <CardContent className="px-0">
            {metrics.recentUpdates.length ? (
              <ul>
                {metrics.recentUpdates.map((item) => (
                  <li
                    key={item.id}
                    className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 last:border-0"
                  >
                    <div>
                      <Link
                        href={item.href}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {item.kind} · {item.status}
                      </p>
                    </div>
                    <time
                      className="text-muted-foreground text-xs"
                      dateTime={item.date}
                    >
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground px-5 py-10 text-sm">
                No content updates yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
