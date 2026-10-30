import "server-only";
import { getCmsPublicContent } from "@/lib/cms-public-content";
import {
  getAchievements as getSourceAchievements,
  getJourney,
  getPublicActivities as getSourceActivities,
  getPublicTracks as getSourceTracks,
} from "@/lib/journey/store";

/** Public Journey access boundary with a file-backed fallback before CMS import. */
export async function getPublicActivities() {
  const cms = await getCmsPublicContent();
  return cms ? cms.activities() : getSourceActivities();
}
export async function getPublicTracks() {
  const cms = await getCmsPublicContent();
  return cms ? cms.tracks() : getSourceTracks();
}
export async function getAchievements() {
  const cms = await getCmsPublicContent();
  return cms ? cms.achievements() : getSourceAchievements();
}
export async function getPublicChallenges() {
  const cms = await getCmsPublicContent();
  if (cms) return cms.challenges();
  return (await getJourney()).challenges.filter(
    (challenge) => challenge.visibility === "public",
  );
}
