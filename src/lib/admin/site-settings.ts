export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
}
export const defaultSiteSettings: Readonly<SiteSettings> = {
  siteTitle: "Aman Sagar",
  siteDescription:
    "Software Engineer from India building Context-OS, AI agents, RAG pipelines, retrieval systems, and GenAI product infrastructure.",
  contactEmail: "amansagar0307@gmail.com",
};
export function validateSiteSettings(input: unknown): SiteSettings {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Settings must be an object.");
  const data = input as Record<string, unknown>;
  if (
    typeof data.siteTitle !== "string" ||
    !data.siteTitle.trim() ||
    data.siteTitle.length > 120
  )
    throw new Error("Site title is required and must be under 120 characters.");
  if (
    typeof data.siteDescription !== "string" ||
    !data.siteDescription.trim() ||
    data.siteDescription.length > 320
  )
    throw new Error(
      "Site description is required and must be under 320 characters.",
    );
  if (
    typeof data.contactEmail !== "string" ||
    data.contactEmail.length > 320 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)
  )
    throw new Error("Enter a valid contact email.");
  return {
    siteTitle: data.siteTitle.trim(),
    siteDescription: data.siteDescription.trim(),
    contactEmail: data.contactEmail.trim(),
  };
}
