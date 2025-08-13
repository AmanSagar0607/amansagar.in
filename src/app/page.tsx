import { Container } from "@/components/Container";
import { Projects } from "@/components/projects";
import { LandingBlogs } from "@/components/landing-blogs";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/subheading";
import { projects } from "@/constants/projects";
import { ProfileLinks } from "@/components/profile-link1";

export default function Home() {
  return (
    <div className={`min-h-screen flex items-start justify-center`}>
      <Container className="min-h-[200vh] p-4 md:pt-28 pt-22 md:pb-10 pb-10 md:px-12">
        <Heading as="h1">Hey, I&apos;m Aman Sagar</Heading>
        <SubHeading as="h2">
          👋 Hi, I’m Aman Sagar — a <b>Full Stack Developer</b> crafting scalable web apps, integrating AI solutions with RAG pipelines, and automating workflows using Make.com. I focus on clean UI, fast performance, and building tools that solve real problems.
        </SubHeading>
        <ProfileLinks />
        <Projects 
          projects={projects.slice(0, 4)} 
          showHeader={true}
          showViewAll={true}
        />
        <LandingBlogs />
      </Container>
    </div>
  );
}
