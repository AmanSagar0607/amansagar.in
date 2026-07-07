import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "About",
  description: "About Aman Sagar, a software engineer focused on AI systems, product engineering, and practical software craft.",
};

export default function AboutPage() {
  return (
    <main className="page-shell">
      <section className="page-section">
        <PageHeader
          eyebrow="About"
          title="about."
          description="I build software with a strong bias toward useful systems, thoughtful interfaces, and practical engineering choices."
          meta="Product-minded engineering"
        />

        <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-[#e7e7e7] dark:border-[#1c1c1c]" />

        <div className="px-4 py-6">
          <div className="hero-copy mx-auto w-full max-w-[680px]">
            <p>
              I&apos;m Aman Sagar, a software engineer from India focused on AI agents,
              retrieval workflows, internal tools, and product-minded full-stack delivery.
            </p>
            <p>
              The work I enjoy most sits between product and infrastructure: shaping the
              UI, building the APIs, making the data flow sane, and tightening the details
              until the whole thing feels reliable.
            </p>
            <p>
              This redesign shifts my portfolio into a more structured, token-driven visual
              system inspired by Chanh Dai&apos;s component language while keeping my own
              content, tone, and project story intact.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
