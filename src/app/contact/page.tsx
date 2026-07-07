import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TallyForm } from "@/components/tally-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Aman Sagar for software engineering roles, referrals, AI agent projects, RAG systems, and GenAI product work.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Aman Sagar",
    description:
      "Reach Aman Sagar for software engineering roles, referrals, AI agent projects, RAG systems, and product engineering work.",
    url: "/contact",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Aman Sagar",
    description:
      "Reach Aman Sagar for software engineering roles, referrals, AI agent projects, RAG systems, and product engineering work.",
    images: ["/opengraph-image"],
  },
};

export default function ContactPage() {
  return (
    <main className="page-shell">
      <section className="page-section">
        <PageHeader
          eyebrow="Contact"
          title="contact."
          description="Reach out for software engineering roles, AI product work, referrals, or just to talk through an interesting system problem."
          meta="Open to thoughtful work"
        />
        <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-[#e7e7e7] dark:border-[#1c1c1c]" />
        <div className="px-4 py-3">
          <p className="mt-4 text-sm text-muted-foreground">
            Direct email:
            {" "}
            <Link href="mailto:amansagar0307@gmail.com" className="footer-link text-foreground">
              amansagar0307@gmail.com
            </Link>
          </p>
        </div>
        <div className="p-4">
          <TallyForm />
        </div>
      </section>
    </main>
  );
}
