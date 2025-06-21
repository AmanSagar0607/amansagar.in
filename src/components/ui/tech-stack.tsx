"use client";

import React, { useEffect, useState } from 'react';
import { Technology } from "@/types/project";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { validateTechnologies } from "@/lib/tech-utils";

interface TechStackProps {
  technologies: (Technology | string)[] | undefined;
  className?: string;
  fetchFromGithub?: boolean;
  githubUrl?: string;
}

export function TechStack({ 
  technologies: initialTechnologies = [], 
  className, 
  fetchFromGithub = false, 
  githubUrl 
}: TechStackProps) {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTechnologies = async () => {
      setIsLoading(true);
      try {
        let techs = [...(initialTechnologies || [])];
        
        if (fetchFromGithub && githubUrl) {
          try {
            const repoUrl = new URL(githubUrl);
            if (repoUrl.hostname === 'github.com') {
              const packageJsonUrl = `https://raw.githubusercontent.com${repoUrl.pathname}/main/package.json`;
              const response = await fetch(packageJsonUrl);
              if (response.ok) {
                const packageJson = await response.json();
                const deps = {
                  ...(packageJson.dependencies || {}),
                  ...(packageJson.devDependencies || {})
                };
                techs = [...techs, ...Object.keys(deps)];
              }
            }
          } catch (error) {
            console.error('Error fetching from GitHub:', error);
          }
        }

        const validatedTechs = validateTechnologies(techs);
        setTechnologies(validatedTechs);
      } catch (error) {
        console.error('Error processing technologies:', error);
        setTechnologies(validateTechnologies(initialTechnologies || []));
      } finally {
        setIsLoading(false);
      }
    };

    loadTechnologies();
  }, [initialTechnologies, fetchFromGithub, githubUrl]);

  if (isLoading) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        ))}
      </div>
    );
  }

  if (!technologies.length) return null;

  const getIcon = (tech: Technology) => {
    const { name } = tech;
    const normalizedName = name.toLowerCase();

    switch (true) {
      case normalizedName.includes('next'):
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#000"/>
            <path d="M7.5 17.5l9-13.5h-7.5l-9 13.5h7.5z" fill="#fff"/>
          </svg>
        );
      case normalizedName.includes('typescript'):
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 12v12h24V0H0v12zm13.5-8.25c1.5 0 2.25.75 2.25 2.25 0 1.5-.75 2.25-2.25 2.25v6h-1.5V3h1.5zm-3 0h1.5v1.5h-1.5V3.75z" fill="#3178C6"/>
          </svg>
        );
      case normalizedName.includes('tailwind'):
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.36 1.2 1.26 2.6 2.7 6.1 2.7 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.36C15.61 7.3 14.21 6 12 6zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.9 1.36 1.2 1.26 2.6 2.7 6.1 2.7 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.9-1.36-1.2-1.26-2.6-2.7-6.1-2.7z" fill="#38BDF8"/>
          </svg>
        );
      case normalizedName.includes('node'):
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0a12 12 0 100 24 12 12 0 000-24zm-1.5 4.5h3v15h-3v-15zm6.75 3.75c1.5 0 2.25.75 2.25 2.25v6c0 1.5-.75 2.25-2.25 2.25h-9c-1.5 0-2.25-.75-2.25-2.25v-6c0-1.5.75-2.25 2.25-2.25h9z" fill="#339933"/>
          </svg>
        );
      case normalizedName.includes('mongo'):
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-3.31 0-6 2.69-6 6v12c0 1.5 1.5 2.25 3 2.25s3-.75 3-2.25V6h-1.5v12c0 .75-.75 1.5-1.5 1.5s-1.5-.75-1.5-1.5V6c0-2.48 2.02-4.5 4.5-4.5s4.5 2.02 4.5 4.5v12c0 1.5 1.5 2.25 3 2.25s3-.75 3-2.25V6c0-3.31-2.69-6-6-6z" fill="#47A248"/>
          </svg>
        );
      case normalizedName.includes('figma'):
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.5 24c2.08 0 3.75-1.67 3.75-3.75V15H8.5c-2.08 0-3.75 1.67-3.75 3.75S6.42 24 8.5 24z" fill="#0ACF83"/>
            <path d="M4.75 12c0-2.08 1.67-3.75 3.75-3.75h3.75v7.5H8.5c-2.08 0-3.75-1.67-3.75-3.75z" fill="#A259FF"/>
            <path d="M4.75 5.25c0-2.08 1.67-3.75 3.75-3.75h3.75v7.5H8.5c-2.08 0-3.75-1.67-3.75-3.75z" fill="#F24E1E"/>
            <path d="M12.25 1.5H16c2.08 0 3.75 1.67 3.75 3.75S18.08 9 16 9h-3.75V1.5z" fill="#FF7262"/>
            <path d="M19.75 12c0 2.08-1.67 3.75-3.75 3.75s-3.75-1.67-3.75-3.75 1.67-3.75 3.75-3.75 3.75 1.67 3.75 3.75z" fill="#1ABCFE"/>
          </svg>
        );
      default:
        return <span className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full" />;
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <TooltipProvider>
        {technologies.map((tech, index) => (
          <Tooltip key={`${tech.name}-${index}`}>
            <TooltipTrigger asChild>
              <div 
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border shadow-sm",
                  "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
                  "hover:shadow transition-shadow"
                )}
              >
                {getIcon(tech)}
                <span className="font-medium">{tech.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tech.category || tech.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
