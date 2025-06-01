import { Container } from "@/components/container";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/subheading";


export default function ContactPage() {
  return (
    <div className={`flex min-h-screen items-start justify-center`}>
     <Container className="min-h-[200vh] p-4 md:pt-28 pt-20 md:pb-10 pb-10 md:px-12 px-8">
        <Heading as="h1">Contact Me</Heading>
        <SubHeading as="h2">I am always open to new opportunities and collaborations. Feel free to reach out to me via email or LinkedIn.</SubHeading>

        <div>
          <h2 className="text-primary mt-6 text-2xl font-bold tracking-tight md:text-4xl">My Contact Information</h2>
          <p className="text-secondary max-w-lg pt-4 text-sm md:text-base">Email: amansagar0307@gmail.com</p>
          <p className="text-secondary max-w-lg pt-4 text-sm md:text-base">LinkedIn: <a href="https://www.linkedin.com/in/amansagar0307/">https://www.linkedin.com/in/amansagar0307/</a></p>
        </div>
      
      </Container>
    </div>
  );
}
