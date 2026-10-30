import "server-only";
import type { ContentService } from "@/lib/admin/content-service";
import type { MediaProvider } from "@/lib/admin/media-service";
import { dashboardMetrics } from "@/lib/admin/dashboard";
import { defaultSiteSettings } from "@/lib/admin/site-settings";
import {
  ContentEdit,
  ContentList,
  type ContentSection,
} from "./content-workspace";
import { DashboardOverview } from "./dashboard-overview";
import { MediaScreen } from "./media-screen";
import { SettingsScreen } from "./settings-screen";

/** These server entry points always authorize through their bound service before rendering private data. */
export async function AuthorizedDashboard({
  service,
}: {
  service: ContentService;
}) {
  const snapshot = await service.readAdmin();
  return <DashboardOverview metrics={dashboardMetrics(snapshot)} />;
}
export async function AuthorizedContentList({
  service,
  section,
}: {
  service: ContentService;
  section: ContentSection;
}) {
  const snapshot = await service.readAdmin();
  return <ContentList section={section} snapshot={snapshot} />;
}
export async function AuthorizedContentEdit({
  service,
  section,
  id,
  creating,
}: {
  service: ContentService;
  section: ContentSection;
  id: string;
  creating: boolean;
}) {
  const snapshot = await service.readAdmin();
  return (
    <ContentEdit
      key={`${section}:${creating ? "create" : id}`}
      section={section}
      id={id}
      creating={creating}
      snapshot={snapshot}
    />
  );
}
export async function AuthorizedSettings({
  service,
}: {
  service: ContentService;
}) {
  const snapshot = await service.readAdmin();
  return (
    <SettingsScreen initial={snapshot.settings || { ...defaultSiteSettings }} />
  );
}
export async function AuthorizedMedia({
  service,
  provider,
}: {
  service: ContentService;
  provider: MediaProvider;
}) {
  await service.authorize();
  const page = await provider.list();
  return <MediaScreen initial={page} />;
}
