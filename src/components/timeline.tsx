"use client";

import { Timeline } from "@/components/ui/timeline-component";
import { Briefcase, GraduationCap, Award, MapPin, Calendar } from "lucide-react";

export default function TimelinePage() {
  const timelineData = [
    {
      title: "2025",
      content: (
        <div className="space-y-6">
        <div className="bg-card">
          <div className="flex items-start gap-4">
            <div className="w-full">
              <div className="flex justify-between items-start">
                <h4 className="text-base font-semibold inline-flex items-center">
                  <Briefcase className="h-6 w-6 text-secondary bg-neutral-100 rounded-lg p-1" />
                  <span className="ml-2">MERN Full Stack Developer</span>
                </h4>
                <div className="flex items-center gap-4 text-sm text-secondary">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    April 2025 - Present
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                   Indore, MP
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-1">TW Solutions</p>
              <p className="mt-1.5 text-sm text-secondary">
                Developed and maintained full-stack applications, implemented new features, and optimized performance for better user experience.
              </p>
            </div>
          </div>
        </div>
      </div>
      ),
    },
    {
      title: "2024",
      content: (
        <div className="space-y-6">
          <div className="bg-card">
            <div className="flex items-start gap-4">
              <div className="w-full">
                <div className="flex justify-between items-start">
                  <h4 className="text-base font-semibold inline-flex items-center">
                    <Briefcase className="h-6 w-6 text-secondary bg-neutral-100 rounded-lg p-1" />
                    <span className="ml-2">Full Stack Developer</span>
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Oct 2024 - Mar 2025
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Remote
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mt-1">Khuladibba Enterprises</p>
                <p className="mt-1 text-sm text-secondary">
                  Developed and maintained full-stack applications, implemented new features, and optimized performance for better user experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "2020 - 2024",
      content: (
        <div className="space-y-6">
          <div className="bg-card">
            <div className="flex items-start gap-4">
              <div className="w-full">
                <div className="flex justify-between items-start">
                  <h4 className="text-base font-semibold inline-flex items-center">
                    <GraduationCap className="h-6 w-6 text-secondary bg-neutral-100 rounded-lg p-1" />
                    <span className="ml-2">B.Tech in Computer Science</span>
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      2020 - 2024
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      7.15 CGPA
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mt-1">University Institute of Technology, RGPV Bhopal</p>
                <p className="mt-1.5 text-sm text-secondary">
                  Specialized in Computer Science with coursework in Data Structures, Algorithms, Web Development, and Database Management Systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "2018 - 2020",
      content: (
        <div className="space-y-6">
          <div className="bg-card">
            <div className="flex items-start gap-4">
              <div className="w-full">
                <div className="flex justify-between items-start">
                  <h4 className="text-base font-semibold inline-flex items-center">
                    <GraduationCap className="h-6 w-6 text-secondary bg-neutral-100 rounded-lg p-1" />
                    <span className="ml-2">Higher Secondary (12th)</span>
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      2018 - 2020
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                     80%
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mt-1">Scholars Public Higher Secondary School - MP Board</p>
                <p className="mt-1.5 text-sm text-secondary">
                  Specialized in Science with coursework in Physics, Chemistry, and Mathematics.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "2017 - 2018",
      content: (
        <div className="space-y-6">
          <div className="bg-card">
            <div className="flex items-start gap-4">
              <div className="w-full">
                <div className="flex justify-between items-start">
                  <h4 className="text-base font-semibold inline-flex items-center">
                    <GraduationCap className="h-6 w-6 text-secondary bg-neutral-100 rounded-lg p-1" />
                    <span className="ml-2">High School (10th)</span>
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      2017 - 2018
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                     91.4%
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mt-1">Rani Laxmi Bai Public Academy High School - MP Board</p>
                <p className="mt-1.5 text-sm text-secondary">
                  Specialized in Science with coursework in Physics, Chemistry, and Mathematics.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

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