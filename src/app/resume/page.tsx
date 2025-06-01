import { Container } from "@/components/container";


export default function ResumePage() {
  return (
    <div className={`flex min-h-screen items-start justify-center`}>
     <Container className="min-h-[200vh] p-4 md:pt-28 pt-20 md:pb-10 pb-10 md:px-12 px-8">
        <h1 className="text-primary text-2xl font-bold tracking-tight md:text-4xl">
          My Resume
        </h1>
        <p className="text-secondary max-w-lg pt-4 text-sm md:text-base">
          I build visually stunning web interfaces and applications, blending
          UI/UX excellence with REACT and NEXT.JS. 
        </p>
       
      </Container>
    </div>
  );
}
