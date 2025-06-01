import { Container } from "@/components/container";
import { Projects } from "@/components/projects";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/subheading";


export default function ProjectsPage() {
  return (
    <div className={`flex min-h-screen items-start justify-center`}>
     <Container className="min-h-[200vh] p-4 md:pt-28 pt-20 md:pb-10 pb-10 md:px-12 px-8">
        <Heading as="h1">My Projects</Heading>
        <SubHeading as="h2">I build visually stunning web interfaces and applications, blending
          UI/UX excellence with REACT and NEXT.JS. </SubHeading>
       <Projects/>
      </Container>
    </div>
  );
}
