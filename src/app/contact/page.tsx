import { Container } from "@/components/container";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/subheading";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className={`flex min-h-screen items-start justify-center`}>
      <Container className="min-h-[200vh] p-4 px-8 pt-24 pb-10 md:px-12 md:pt-28 md:pb-10">
        <Heading as="h1">Contact Me</Heading>
        <SubHeading as="h2">
          I am always open to new opportunities and collaborations. Feel free to
          reach out to me via email or LinkedIn.
        </SubHeading>
        <ContactForm />
      </Container>
    </div>
  );
}
