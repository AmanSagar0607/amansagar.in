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
      <Container className="min-h-[200vh] p-4 md:pt-28 pt-22 md:pb-10 pb-10 md:px-12 px-8">
        <Heading as="h1">Hey, I&apos;m Aman Sagar</Heading>
        <SubHeading as="h2">
          I am a <b>Full Stack Developer</b> experienced in building scalable web applications and AI-powered solutions. I specialize in frontend and backend development using modern frameworks and excel at integrating no-code tools like Make.com to automate workflows and boost efficiency. A quick learner and a collaborative team player, I adapt swiftly to new technologies and thrive in fast-paced, problem-solving environments.
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
