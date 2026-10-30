import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { AchievementGrid } from "@/components/journey/journey-ui";
import { getAchievements } from "@/lib/public-journey";
import { journeyMetadata } from "@/lib/journey/seo";

export const metadata = journeyMetadata(
  "Achievements",
  "Milestones earned through published learning, research, building and contributions.",
  "/achievements",
);

export default async function AchievementsPage() {
  const achievements = await getAchievements();
  return (
    <main className="page-shell pb-12">
      <PageHeader
        eyebrow="Journey"
        title="achievements."
        description="Small markers of progress, earned through real work. Each badge shows the published activity or completed milestones needed to unlock it."
        meta={`${achievements.filter((badge) => badge.earnedAt).length} earned · ${achievements.length} available`}
      />
      <section className="page-section pt-6">
        <h2 className="sr-only">Earned and locked achievements</h2>
        <AchievementGrid achievements={achievements} />
        <Link
          href="/journey"
          className="link-underline mx-4 inline-flex min-h-11 items-center self-start text-sm"
        >
          Back to Journey
        </Link>
      </section>
    </main>
  );
}

