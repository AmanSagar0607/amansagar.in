import { Container } from "@/components/container";
import { Projects } from "@/components/projects";
import { LandingBlogs } from "@/components/landing-blogs";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/subheading";


export default function Home() {
  return (
    <div className={`min-h-screen flex items-start justify-center`}>
       <Container className="min-h-[200vh] p-4 md:pt-28 pt-20 md:pb-10 pb-10 md:px-12 px-8">
        <Heading as="h1"> Aman Sagar</Heading>
        <SubHeading as="h2">Hello, I&apos;m Aman, and I am working as a Full Stack Developer with more than 6 months of experience. I am a quick learner and a team player.</SubHeading>
        <Projects/>
        <LandingBlogs/>
      </Container>
    </div>
  );
}
