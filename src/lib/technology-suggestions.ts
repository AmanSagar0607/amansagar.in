const catalog = [
  { name: "Next.js", aliases: ["next.js", "nextjs"] },
  { name: "React", aliases: ["react", "react.js"] },
  { name: "TypeScript", aliases: ["typescript", "ts"] },
  { name: "Python", aliases: ["python"] },
  { name: "FastAPI", aliases: ["fastapi"] },
  { name: "PostgreSQL", aliases: ["postgresql", "postgres"] },
  { name: "Supabase", aliases: ["supabase"] },
  { name: "Milvus", aliases: ["milvus"] },
  { name: "Zilliz Cloud", aliases: ["zilliz cloud", "zilliz"] },
  {
    name: "Vector Search",
    aliases: ["vector search", "vector database", "vector db"],
  },
  { name: "AI Agents", aliases: ["ai agent", "ai agents", "agentic"] },
  { name: "Git", aliases: ["git"] },
  { name: "GitHub", aliases: ["github"] },
  { name: "Docker", aliases: ["docker"] },
  { name: "Playwright", aliases: ["playwright"] },
  { name: "Pytest", aliases: ["pytest"] },
  { name: "REST APIs", aliases: ["rest api", "restful api"] },
  { name: "Figma", aliases: ["figma"] },
  {
    name: "Interface Design System",
    aliases: ["interface design system", "design system"],
  },
];

/** Suggest known technologies mentioned in project copy; never silently edits saved metadata. */
export function suggestTechnologiesFromText(markdown: string): string[] {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .toLocaleLowerCase();
  return catalog
    .filter(({ aliases }) =>
      aliases.some((alias) =>
        new RegExp(
          `(^|[^\\p{L}\\p{N}])${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}\\p{N}]|$)`,
          "iu",
        ).test(text),
      ),
    )
    .map(({ name }) => name);
}
