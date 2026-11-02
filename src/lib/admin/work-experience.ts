export interface WorkPosition {
  id: string;
  title: string;
  employmentType?: string;
  employmentPeriod: { start: string; end?: string };
  description?: string;
  skills?: string[];
}
export interface WorkExperienceRecord {
  id: string;
  companyName: string;
  companyWebsite?: string;
  companyLogo?: string;
  isCurrentEmployer?: boolean;
  positions: WorkPosition[];
}

/** The same source records used by the public homepage before CMS overrides. */
export const defaultWorkExperience: WorkExperienceRecord[] = [
  { id: "nirnaya", companyName: "Nirnaya - Ministry of Defence", isCurrentEmployer: true, positions: [{ id: "nirnaya-sd", title: "Software Engineer", employmentType: "Full-time", employmentPeriod: { start: "10.2025" }, description: "- Built secure internal web platforms and production dashboards for operational workflows.\n- Developed full-stack features across UI, APIs, and data pipelines.\n- Shipped product improvements with a strong focus on usability, performance, and delivery discipline.", skills: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"] }] },
  { id: "triggrsweb", companyName: "TriggrsWeb Solutions", positions: [{ id: "triggrsweb-mern", title: "MERN Stack Developer", employmentType: "Full-time", employmentPeriod: { start: "04.2025", end: "10.2025" }, description: "- Built modular client-facing applications and worked across UI, APIs, and deployment flows.\n- Contributed to reusable systems and smoother release cycles across projects.", skills: ["React", "Node.js", "MongoDB", "Express"] }] },
  { id: "khuladibba", companyName: "Khuladibba Enterprises", positions: [{ id: "khuladibba-fsd", title: "Full Stack Developer", employmentType: "Full-time", employmentPeriod: { start: "10.2024", end: "03.2025" }, description: "- Shipped e-commerce and product features with a focus on performance, UX, and delivery.\n- Helped turn business requirements into working product experiences quickly.", skills: ["Next.js", "React", "Node.js", "Tailwind CSS"] }] },
];
