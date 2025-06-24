import { Container } from "@/components/Container";
import { Heading } from "@/components/heading";
import { SubHeading } from "@/components/subheading";
import { ResumeCards } from "@/components/resume/resume-cards";

export default function ResumePage() {
  const resumeUrl = "https://drive.google.com/file/d/16TXNhVBthaWBVM-13WHx1h8gDH8cggvC/view?usp=sharing";
  const coverLetterUrl = "https://drive.google.com/file/d/16TXNhVBthaWBVM-13WHx1h8gDH8cggvC/view?usp=sharing";

  return (
    <div className={`flex min-h-screen items-start justify-center`}>
      <Container className="min-h-[200vh] p-4 px-8 pt-24 pb-10 md:px-12 md:pt-28 md:pb-10">
        <div className="mb-12">
          <Heading as="h1" className="mb-4">My Professional Profile</Heading>
          <SubHeading as="h2" className="max-w-3xl mx-auto">
            Full Stack Developer with expertise in modern web technologies and a passion for creating efficient, scalable applications.
          </SubHeading>
        </div>

        <ResumeCards 
          resumeUrl={resumeUrl}
          coverLetterUrl={coverLetterUrl}
        />

        {/* <SkillsSection /> */}
      </Container>
    </div>
  );
}
