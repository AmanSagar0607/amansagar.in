import { Container } from "@/components/Container";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/subheading";
import Timeline from "@/components/timeline";

export default function Home() {
  return (
    <div className={`flex min-h-screen items-start justify-center`}>
     <Container className="min-h-[200vh] p-4 md:pt-28 pt-24 md:pb-10 pb-10 md:px-12 px-8">
        <Heading as="h1"> About Me</Heading>
       <SubHeading as="h2"> As a MERN Stack Developer, I focus on React.js and Next.js, specializing in backend development, automation REST APIs, and AI integration. I build efficient, scalable web applications with a strong emphasis on performance optimization and user experience. Let's create something amazing together! 🚀 </SubHeading>
          {/* I craft visually stunning web interfaces and applications, blending
          UI/UX excellence with REACT and NEXT.JS. A FULL STACK MERN DEVELOPER,
          excelling in BUSINESS AI and WORKFLOW AUTOMATION with MAKE.COM. */}
        <Timeline/>
      </Container>
    </div>
  );
}
