import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { JourneyEditor } from "@/components/journey/activity-editor";

export const metadata: Metadata = {
  title: "Journey publishing",
  robots: { index: false, follow: false },
};
export default function JourneyAdminPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="page-shell">
      <section className="page-section">
        <PageHeader
          eyebrow="Local publishing"
          title="journey editor."
          description="Write a short update, connect it to your work, and preview before publishing."
        />
        <div className="px-4 py-6 md:px-8">
          <p className="text-muted-foreground mb-6 text-sm leading-6">
            This editor runs only in development with a configured publishing
            token. Saves update repository content files. Review and commit
            those files, then deploy through the existing site workflow.
          </p>
          <JourneyEditor />
        </div>
      </section>
    </main>
  );
}
