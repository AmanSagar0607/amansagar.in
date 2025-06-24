import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, LayoutGrid, Zap, GitBranch, Lightbulb } from "lucide-react";
import { getProjectBySlug, getAllProjects } from "@/lib/projects";
import { Container } from "@/components/Container";
import { Heading } from "@/components/heading";
import { TechStack } from "@/components/ui/tech-stack";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params; // Await params here
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: `${project.title} | Aman Sagar`,
    description: project.description,
    openGraph: {
      images: [project.src],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params; // Await params here
  const project = getProjectBySlug(slug);

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-start justify-center ">
      <Container className="min-h-screen py-24 md:py-24 px-4 md:px-8">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-primary mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Link>

        {/* Project Image */}
        <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 mb-8">
          <Image
            src={project.src}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </div>

        {/* Project Header with Title and Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Heading as="h1" className="mb-2">
              {project.title}
            </Heading>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {project.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors w-full md:w-auto"
              >
                Live Demo
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-neutral-200 dark:border-neutral-800 text-sm font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full md:w-auto"
              >
                <Github className="w-4 h-4 mr-2" />
                Code
              </a>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
          {/* Left Column - Main Content */}
          <div className="md:col-span-4 lg:col-span-8 space-y-6">
            {/* Overview Card */}
            <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 mb-4">
                <LayoutGrid className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Project Overview</h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {project.overview}
              </p>
            </div>

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <h3 className="font-medium">Key Features</h3>
                </div>
                <ul className="space-y-2">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Challenges & Learnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.challenges && project.challenges.length > 0 && (
                <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2 mb-3">
                    <GitBranch className="w-4 h-4 text-yellow-500" />
                    <h3 className="font-medium">Challenges</h3>
                  </div>
                  <ul className="space-y-2">
                    {project.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="mr-2">•</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.learnings && project.learnings.length > 0 && (
                <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                    <h3 className="font-medium">Key Learnings</h3>
                  </div>
                  <ul className="space-y-2">
                    {project.learnings.map((learning, index) => (
                      <li key={index} className="flex items-start text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="mr-2">•</span>
                        {learning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="md:col-span-2 lg:col-span-4 space-y-4">
            {/* Project Details */}
            <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-medium mb-4">Project Details</h3>
              <div className="space-y-4">
                {project.date && (
                  <div>
                    <p className="text-xs text-neutral-500">Date</p>
                    <p className="text-sm">
                      {new Date(project.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                )}

                {project.deployment && (
                  <div>
                    <p className="text-xs text-neutral-500">Deployment</p>
                    <a 
                      href={project.deployment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {project.deployment.platform}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Technology Stack */}
            <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
              <h3 className="font-medium">Technology Stack</h3>
              <TechStack 
                technologies={project.technologies}
                developmentTools={project.developmentTools}
                designTools={project.designTools}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}