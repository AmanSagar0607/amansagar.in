export type TechnologyGroup = { label: string; items: string[] };
export const defaultTechnologyStack: TechnologyGroup[] = [
  {
    label: "Technologies",
    items: [
      "Next.js",
      "React",
      "TypeScript",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Supabase",
      "Milvus",
      "Zilliz Cloud",
      "Vector Search",
      "AI Agents",
    ],
  },
  {
    label: "Development Tools",
    items: ["Git", "GitHub", "Docker", "Playwright", "Pytest", "REST APIs"],
  },
  { label: "Design Tools", items: ["Figma", "Interface Design System"] },
];
