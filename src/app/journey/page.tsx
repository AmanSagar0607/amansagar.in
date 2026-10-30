import Link from "next/link";
import { Check, Circle, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  ActivityCard,
  LearningTrackCard,
  JourneySection,
  activityLabels,
} from "@/components/journey/journey-ui";
import {
  getPublicActivities,
  getPublicTracks,
  getAchievements,
  getPublicChallenges,
} from "@/lib/public-journey";
import { activityHref, isChallengeComplete } from "@/lib/journey/logic";
import { journeyMetadata } from "@/lib/journey/seo";

export const metadata = journeyMetadata(
  "Journey",
  "Follow my learning, research, engineering experiments and the projects taking shape along the way.",
  "/journey",
);

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const [activities, tracks, achievements, challenges, query] =
    await Promise.all([
      getPublicActivities(),
      getPublicTracks(),
      getAchievements(),
      getPublicChallenges(),
      searchParams,
    ]);
  const filter =
    query.type && Object.hasOwn(activityLabels, query.type)
      ? query.type
      : "all";
  const filtered =
    filter === "all"
      ? activities
      : activities.filter((activity) => activity.type === filter);
  const activeTracks = tracks.filter((track) => track.status === "active");
  const projects = new Set(
    activities
      .filter((activity) => activity.completion === "in-progress")
      .flatMap((activity) => activity.projectSlugs),
  );
  const earned = achievements.filter((badge) => badge.earnedAt).length;
  return (
    <main className="page-shell pb-12">
      <PageHeader
        eyebrow="Build in public"
        title="journey."
        description="A working journal of what I’m learning, researching and building. Follow the questions, experiments and small steps behind the finished projects."
        meta="Learning in progress. Notes published when there is something useful to share."
      />
      <dl className="screen-line-bottom grid grid-cols-2 gap-6 px-4 py-6 sm:grid-cols-4">
        {[
          [activities.length, "published activities"],
          [tracks.length, "learning tracks"],
          [projects.size, "projects in progress"],
          [earned, "earned achievements"],
        ].map(([count, label]) => (
          <div key={label}>
            <dt className="text-muted-foreground text-xs leading-5">{label}</dt>
            <dd className="mt-2 font-mono text-xl tabular-nums">{count}</dd>
          </div>
        ))}
      </dl>
      <JourneySection
        title="currently exploring."
        meta={`${activeTracks.length} active`}
      >
        {activeTracks.length ? (
          activeTracks.map((track) => (
            <LearningTrackCard key={track.slug} track={track} featured />
          ))
        ) : (
          <p className="text-muted-foreground px-4 text-sm leading-6">
            The next learning focus is being prepared. New tracks will appear
            here when they begin.
          </p>
        )}
      </JourneySection>
      {tracks.some((track) => track.status !== "active") && (
        <JourneySection title="learning tracks.">
          {tracks
            .filter((track) => track.status !== "active")
            .map((track) => (
              <LearningTrackCard key={track.slug} track={track} />
            ))}
        </JourneySection>
      )}
      <JourneySection
        title="field notes."
        meta={`${filtered.length} ${filtered.length === 1 ? "entry" : "entries"}`}
      >
        <nav
          aria-label="Filter activities"
          className="flex flex-wrap gap-1 px-4"
        >
          {[["all", "All"], ...Object.entries(activityLabels)].map(
            ([value, label]) => (
              <Link
                key={value}
                href={value === "all" ? "/journey" : `/journey?type=${value}`}
                aria-current={filter === value ? "page" : undefined}
                className={`focus-visible:outline-ring inline-flex min-h-11 items-center rounded-md px-3 text-xs transition-colors focus-visible:outline-2 ${filter === value ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
              >
                {label}
              </Link>
            ),
          )}
        </nav>
        {filtered.length ? (
          <div>
            {filtered.map((activity) => (
              <ActivityCard key={activity.slug} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="px-4 py-6">
            <h3 className="text-sm font-medium">
              {filter === "all"
                ? "The first notes are being prepared."
                : "No published notes in this category yet."}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Research, practical experiments and lessons will appear here as
              they are published.
            </p>
            {filter !== "all" && (
              <Link
                href="/journey"
                className="link-underline mt-3 inline-flex min-h-11 items-center text-sm"
              >
                View all activities
              </Link>
            )}
          </div>
        )}
      </JourneySection>
      {challenges.length > 0 && (
        <JourneySection
          title="small challenges."
          meta="Progress, at my own pace"
        >
          <ul className="px-4">
            {challenges.map((challenge) => {
              const complete = isChallengeComplete(challenge, activities);
              const relatedActivity = activities.find(
                (activity) => activity.slug === challenge.activitySlug,
              );
              return (
                <li
                  key={challenge.id}
                  className="border-border flex items-start gap-3 border-b py-4"
                >
                  {complete ? (
                    <Check
                      className="mt-1 size-4 shrink-0"
                      aria-label="Completed"
                    />
                  ) : (
                    <Circle
                      className="text-muted-foreground mt-1 size-4 shrink-0"
                      aria-label="Open"
                    />
                  )}
                  <div>
                    <span className="text-muted-foreground font-mono text-xs">
                      {challenge.category}
                    </span>
                    <h3 className="mt-1 text-sm font-medium">
                      {challenge.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                      {challenge.description}
                    </p>
                    {complete && challenge.completedAt && (
                      <time
                        dateTime={challenge.completedAt}
                        className="text-muted-foreground mt-2 block text-xs"
                      >
                        Completed{" "}
                        {new Date(challenge.completedAt).toLocaleDateString(
                          "en-US",
                          { timeZone: "UTC" },
                        )}
                      </time>
                    )}
                    {complete && challenge.evidenceUrl && (
                      <a
                        href={challenge.evidenceUrl}
                        rel="noopener noreferrer"
                        className="link-underline mt-2 inline-flex min-h-11 items-center text-xs"
                      >
                        View evidence
                        <ArrowUpRight className="ml-1 size-3" aria-hidden />
                      </a>
                    )}
                    {complete && relatedActivity && (
                      <Link
                        href={activityHref(relatedActivity)}
                        className="link-underline mt-2 ml-3 inline-flex min-h-11 items-center text-xs"
                      >
                        Read activity
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </JourneySection>
      )}
      <JourneySection title="achievements." meta={`${earned} earned`}>
        <p className="text-muted-foreground px-4 text-sm leading-6">
          A record of real learning and shipped work. Badges unlock through
          published activity and completed milestones.
        </p>
        <Link
          href="/achievements"
          className="link-underline mx-4 inline-flex min-h-11 items-center gap-2 self-start text-sm"
        >
          View achievements
          <ArrowUpRight className="size-3" aria-hidden />
        </Link>
      </JourneySection>
    </main>
  );
}
