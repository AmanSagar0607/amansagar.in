import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllProjects } from "@/lib/projects";
import { Container } from "@/components/Container";
import { Heading } from "@/components/heading";

export const metadata: Metadata = {
  title: "Projects | Aman Sagar",
  description: "A collection of my recent projects and work.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="min-h-screen flex items-start justify-center">
      <Container className="min-h-screen p-4 md:pt-28 pt-22 md:pb-10 pb-10 md:px-12 px-8">
        <Heading as="h1" className="mb-2">My Projects</Heading>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          Here are some of the projects I&apos;ve worked on. Click on any project to learn more.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group block overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={project.src}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {project.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.technologies?.slice(0, 3).map((tech, i) => (
                    <span 
                      key={i}
                      className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full"
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
