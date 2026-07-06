import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="page-section">
        <PageHeader
          eyebrow="Missing"
          title="404."
          description="The page you're looking for doesn't exist or has moved."
          meta="Try the homepage"
        />
        <div className="screen-line-bottom p-4">
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Back home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
