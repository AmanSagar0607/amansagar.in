import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
  ActivityCard,
  JourneyBreadcrumbs,
  JourneySection,
  LearningMilestones,
  Technologies,
  TrackStatus,
} from "@/components/journey/journey-ui";
import { getPublicActivities, getPublicTracks } from "@/lib/public-journey";
import { trackProgress } from "@/lib/journey/logic";
import { journeyMetadata } from "@/lib/journey/seo";
import { getPublicProjectsBySlug } from "@/lib/public-projects";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const track = (await getPublicTracks()).find((item) => item.slug === slug);
  if (!track)
    return {
      title: "Track not found",
      robots: { index: false, follow: false },
    };
  const activities = (await getPublicActivities()).filter((activity) =>
    activity.trackSlugs.includes(slug),
  );
  return journeyMetadata(
    track.title,
    track.description,
    `/journey/${slug}`,
    activities.length > 0,
    track.technologies,
  );
}

export default async function LearningTrackPage({ params }: Props) {
  const { slug } = await params;
  const [tracks, allActivities] = await Promise.all([
    getPublicTracks(),
    getPublicActivities(),
  ]);
  const track = tracks.find((item) => item.slug === slug);
  if (!track) notFound();
  const activities = allActivities.filter((activity) =>
    activity.trackSlugs.includes(slug),
  );
  const projects = await getPublicProjectsBySlug([...new Set([...track.projectSlugs, ...activities.flatMap(activity => activity.projectSlugs)])]);
  const progress = trackProgress(track);
  return (
    <main className="page-shell pb-12">
      <JourneyBreadcrumbs title={track.title} />
      <PageHeader
        eyebrow="Learning track"
        title={track.title}
        description={track.description}
        meta={`${track.milestones.filter((m) => m.completedAt).length} / ${track.milestones.length} milestones complete`}
      />
      <div className="screen-line-bottom space-y-5 px-4 py-6">
        <TrackStatus status={track.status} />
        <Technologies items={track.technologies} />
        <div className="flex items-center gap-4">
          <progress
            aria-label="Track progress"
            value={progress}
            max={100}
            className="bg-muted accent-foreground [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-foreground [&::-moz-progress-bar]:bg-foreground h-1.5 w-full overflow-hidden rounded-full"
          />
          <span className="text-muted-foreground font-mono text-xs tabular-nums">
            {progress}%
          </span>
        </div>
        {track.startDate && (
          <p className="text-muted-foreground text-xs">
            Started{" "}
            <time dateTime={track.startDate}>
              {new Date(track.startDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </time>
          </p>
        )}
      </div>
      <JourneySection title="milestones.">
        <LearningMilestones track={track} />
      </JourneySection>
      <JourneySection
        title="related activities."
        meta={`${activities.length} published`}
      >
        {activities.length ? (
          activities.map((activity) => (
            <ActivityCard key={activity.slug} activity={activity} />
          ))
        ) : (
          <p className="text-muted-foreground px-4 text-sm leading-6">
            The first notes for this track are being prepared. Completed work
            and useful findings will appear here as they are published.
          </p>
        )}
      </JourneySection>
      {projects.length > 0 && (
        <JourneySection title="related projects.">
          <div className="list-grid">
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="list-row screen-line-bottom"
              >
                <span className="list-row-title">{project.title}</span>
                <span className="list-row-meta">View project ↗</span>
              </Link>
            ))}
          </div>
        </JourneySection>
      )}
    </main>
  );
}

