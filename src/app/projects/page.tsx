import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PortfolioProjectGrid } from "@/components/portfolio-project-grid";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects that show how I build software, AI tools, and product systems.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects | Aman Sagar",
    description: "Selected projects led by Context-OS, agent memory, retrieval systems, and product engineering work.",
    url: "/projects",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Aman Sagar",
    description: "Selected projects led by Context-OS, agent memory, retrieval systems, and product engineering work.",
    images: ["/opengraph-image"],
  },
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <main className="page-shell">
      <section className="page-section">
        <PageHeader
          eyebrow="Projects"
          title="projects."
          description="Product, interface, and engineering work arranged in the same bordered showcase system as the homepage, with both grid and list views."
          meta={`${projects.length} selected builds`}
        />
        <PortfolioProjectGrid projects={projects} className="screen-line-top" featuredCount={projects.length} />
      </section>
    </main>
  );
}
