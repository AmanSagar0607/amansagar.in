import { Containers } from "@/components/Container";

export default function Home() {
  return (
    <div className={`min-h-screen flex items-start justify-center`}>
      <Containers className="min-h-[200vh] p-4 md:pt-20 md:pb-10">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-primary">
          Hello, there!
        </h1>
        <p className="text-secondary md:text-base text-sm pt-4 max-w-lg">
          Hello , I'm Aman, and i am working as a Full Stack Developer, with have more than 6 months of experience, and i am a quick learner also i am a team player
        </p>
      </Containers>
    </div>
  );
}
