export type TechnologyGroup = { label: string; items: string[] };
export const defaultTechnologyStack: TechnologyGroup[] = [
  { label: "Language", items: ["TypeScript", "JavaScript", "Python"] },
  { label: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "shadcn/ui", "Radix UI", "Base UI", "Motion", "Expo", "TanStack", "MobX-State-Tree"] },
  { label: "Backend & Database", items: ["Node.js", "Python", "Bun", "PostgreSQL", "MongoDB", "Redis", "nginx"] },
  { label: "Workflow & AI", items: ["Cursor", "Claude", "Gemini", "ChatGPT", "Git", "GitHub", "Docker", "Vercel"] },
  { label: "Analytics", items: ["OpenPanel", "PostHog"] },
  { label: "Design", items: ["Figma", "Paper", "Photoshop"] },
];
