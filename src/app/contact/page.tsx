import { Container } from "@/components/Container";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/subheading";
import { TallyForm } from "@/components/tally-form";

export default function ContactPage() {
  return (
    <div className={`flex min-h-screen items-start justify-center`}>
      <Container className="min-h-screen p-4 px-8 pt-24 pb-10 md:px-12 md:pt-28 md:pb-10">
        <Heading as="h1">Contact Me</Heading>
        <SubHeading as="h2" className="mb-8">
          I am always open to new opportunities and collaborations. Feel free to
          reach out to me using the form below or via email/LinkedIn.
        </SubHeading>
        <TallyForm />
      </Container>
    </div>
  );
}
