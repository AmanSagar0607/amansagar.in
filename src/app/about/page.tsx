import { Container } from "@/components/container";
import { Projects } from "@/components/projects";
import { LandingBlogs } from "@/components/landing-blogs";
import Timeline from "@/components/timeline";

export default function Home() {
  return (
    <div className={`flex min-h-screen items-start justify-center`}>
      <Container className="min-h-[200vh] p-4 px-12 md:pt-28 md:pb-10">
        <h1 className="text-primary text-2xl font-bold tracking-tight md:text-4xl">
          About Me
        </h1>
        <p className="text-secondary max-w-lg pt-4 text-sm md:text-base">
          I craft visually stunning web interfaces and applications, blending
          UI/UX excellence with REACT and NEXT.JS. A FULL STACK MERN DEVELOPER,
          excelling in BUSINESS AI and WORKFLOW AUTOMATION with MAKE.COM.
        </p>
       
        <Timeline/>
      </Container>
    </div>
  );
}
