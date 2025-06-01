"use client";

import { Timeline } from "@/components/ui/timeline-component";
import { Briefcase, GraduationCap, Award, MapPin, Calendar } from "lucide-react";

type TimelineItem = {
  id: number;
  year: string;
  title: string;
  company: string;
  description: string;
  date: string;
  location: string;
  icon: React.ReactNode;
  type: 'work' | 'education';
  score?: string;
};

export default function TimelinePage() {
  const timelineItems: TimelineItem[] = [
    {
      id: 1,
      year: "2025",
      title: "MERN Full Stack Developer",
      company: "TW Solutions",
      description: "Developed and maintained full-stack applications, implemented new features, and optimized performance for better user experience.",
      date: "April 2025 - Present",
      location: "Indore, MP",
      icon: <Briefcase className="h-5 w-5 text-secondary bg-neutral-100 rounded-lg p-1 flex-shrink-0" />,
      type: 'work'
    },
    {
      id: 2,
      year: "2024",
      title: "Full Stack Developer",
      company: "Khuladibba Enterprises",
      description: "Developed and maintained full-stack applications, implemented new features, and optimized performance for better user experience.",
      date: "Oct 2024 - Mar 2025",
      location: "Remote",
      icon: <Briefcase className="h-5 w-5 text-secondary bg-neutral-100 rounded-lg p-1 flex-shrink-0" />,
      type: 'work'
    },
    {
      id: 3,
      year: "2020 - 2024",
      title: "B.Tech in Computer Science",
      company: "University Institute of Technology, RGPV Bhopal",
      description: "Specialized in Computer Science with coursework in Data Structures, Algorithms, Web Development, and Database Management Systems.",
      date: "2020 - 2024",
      location: "Bhopal, MP",
      icon: <GraduationCap className="h-5 w-5 text-secondary bg-neutral-100 rounded-lg p-1 flex-shrink-0" />,
      type: 'education',
      score: "7.15 CGPA"
    },
    {
      id: 4,
      year: "2018 - 2020",
      title: "Higher Secondary (12th)",
      company: "Scholars Public Higher Secondary School - MP Board",
      description: "Specialized in Science with coursework in Physics, Chemistry, and Mathematics.",
      date: "2018 - 2020",
      location: "Indore, MP",
      icon: <GraduationCap className="h-5 w-5 text-secondary bg-neutral-100 rounded-lg p-1 flex-shrink-0" />,
      type: 'education',
      score: "80%"
    },
    {
      id: 5,
      year: "2017 - 2018",
      title: "High School (10th)",
      company: "Rani Laxmi Bai Public Academy High School - MP Board",
      description: "Specialized in Science with coursework in Physics, Chemistry, and Mathematics.",
      date: "2017 - 2018",
      location: "Indore, MP",
      icon: <GraduationCap className="h-5 w-5 text-secondary bg-neutral-100 rounded-lg p-1 flex-shrink-0" />,
      type: 'education',
      score: "91.4%"
    }
  ];

  const timelineData = timelineItems.map(item => ({
    title: item.year,
    content: (
      <div className="space-y-6">
        <div className="bg-card">
          <div className="flex items-start gap-4">
            <div className="w-full md:-ml-0 -ml-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <h4 className="text-base font-semibold flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-secondary">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{item.date}</span>
                  </span>
                  <span className="flex items-center gap-1 sm:ml-0">
                    {item.type === 'education' ? (
                      <Award className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span>{item.type === 'education' ? item.score : item.location}</span>
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-2">{item.company}</p>
              <p className="mt-1.5 text-sm text-secondary">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }));

  return (
    <div className="min-h-screen">
      <Timeline 
        data={timelineData}
        title="My Journey"
        description="A timeline of my professional and educational milestones"
      />
    </div>
  );
}