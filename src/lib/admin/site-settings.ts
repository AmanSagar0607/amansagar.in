export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  profileTagline?: string;
  profileRole?: string;
  profileBio?: string;
  profileFocus?: string;
  profileLocation?: string;
  profileAvailability?: string;
  featuredProjectName?: string;
  featuredProjectUrl?: string;
  featuredProjectDescription?: string;
  resumeUrl?: string;
  socialLinks?: { label: string; handle: string; href: string }[];
  workExperience?: WorkExperienceRecord[];
  technologyStack?: TechnologyGroup[];
  aboutDescription?: string;
  aboutParagraphs?: string[];
  releaseVersion?: string;
  homepageProjectsTitle?: string;
  homepageProjectsDescription?: string;
  homepageBlogTitle?: string;
  homepageBlogDescription?: string;
}
import { defaultWorkExperience, type WorkExperienceRecord, type WorkPosition } from "./work-experience";
import { defaultTechnologyStack, type TechnologyGroup } from "./technology-stack";
export const defaultSiteSettings: Readonly<SiteSettings> = {
  siteTitle: "Aman Sagar",
  siteDescription:
    "Software Engineer from India building Context-OS, AI agents, RAG pipelines, retrieval systems, and GenAI product infrastructure.",
  contactEmail: "amansagar0307@gmail.com",
  releaseVersion: "1.0.0",
  homepageProjectsTitle: "Projects",
  homepageProjectsDescription: "Selected work with product screenshots and deployment proof.",
  homepageBlogTitle: "Blog",
  homepageBlogDescription: "Notes on AI agents, product engineering, and systems thinking.",
  profileTagline: "Building practical AI systems. Small details matter.",
  profileRole: "Software Engineer",
  profileBio: "I build full-stack software with a strong bias toward practical AI systems, retrieval workflows, and interfaces that feel clear and human.",
  profileFocus: "AI systems",
  profileLocation: "India",
  profileAvailability: "Open to product work",
  featuredProjectName: "Context-OS",
  featuredProjectUrl: "https://github.com/AmanSagar0607/Context-OS",
  featuredProjectDescription: "Open-source memory and retrieval for AI agents.",
  resumeUrl: "https://drive.google.com/file/d/1flNfObtr9q55WtIA5DJRZLEkj_Trsw7-/view?usp=sharing",
  workExperience: defaultWorkExperience,
  technologyStack: defaultTechnologyStack,
  aboutDescription: "I build software with a strong bias toward useful systems, thoughtful interfaces, and practical engineering choices.",
  aboutParagraphs: [
    "I'm Aman Sagar, a software engineer from India focused on AI agents, retrieval workflows, internal tools, and product-minded full-stack delivery.",
    "The work I enjoy most sits between product and infrastructure: shaping the UI, building the APIs, making the data flow sane, and tightening the details until the whole thing feels reliable.",
    "This redesign shifts my portfolio into a more structured, token-driven visual system inspired by Chanh Dai's component language while keeping my own content, tone, and project story intact.",
  ],
  socialLinks: [
    { label: "GitHub", handle: "@AmanSagar0607", href: "https://github.com/AmanSagar0607" },
    { label: "LinkedIn", handle: "/in/amansagar0607", href: "https://www.linkedin.com/in/amansagar0607/" },
    { label: "X", handle: "@amansagar0607", href: "https://x.com/amansagar0607" },
    { label: "Medium", handle: "@amansagar0607", href: "https://medium.com/@amansagar0607" },
    { label: "Behance", handle: "@amansagar0607", href: "https://behance.net/amansagar0607" },
    { label: "Email", handle: "amansagar0307@gmail.com", href: "mailto:amansagar0307@gmail.com" },
  ],
};
export function validateSiteSettings(input: unknown): SiteSettings {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Settings must be an object.");
  const data = input as Record<string, unknown>;
  if (data.releaseVersion !== undefined && (typeof data.releaseVersion !== "string" || !/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(data.releaseVersion))) throw new Error("Version must use semantic versioning, such as 1.2.3.");
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
  for (const key of ["profileTagline", "profileRole", "profileBio", "profileFocus", "profileLocation", "profileAvailability", "featuredProjectName", "featuredProjectDescription", "aboutDescription", "homepageProjectsTitle", "homepageProjectsDescription", "homepageBlogTitle", "homepageBlogDescription"] as const) {
    if (data[key] !== undefined && (typeof data[key] !== "string" || !(data[key] as string).trim() || (data[key] as string).length > 500))
      throw new Error(`Invalid ${key}.`);
  }
  if (data.aboutParagraphs !== undefined && (!Array.isArray(data.aboutParagraphs) || data.aboutParagraphs.length > 20 || data.aboutParagraphs.some((item: unknown) => typeof item !== "string" || !item.trim() || item.length > 5000))) throw new Error("Invalid About paragraphs.");
  if (data.resumeUrl !== undefined) {
    if (typeof data.resumeUrl !== "string" || data.resumeUrl.length > 2048) throw new Error("Invalid resume URL.");
    let resume: URL;
    try { resume = new URL(data.resumeUrl); } catch { throw new Error("Enter a valid resume URL."); }
    if (resume.protocol !== "https:" || resume.username || resume.password) throw new Error("Resume URL must use HTTPS.");
  }
  if (data.featuredProjectUrl !== undefined) {
    if (typeof data.featuredProjectUrl !== "string" || data.featuredProjectUrl.length > 2048) throw new Error("Invalid featured project URL.");
    let url: URL;
    try { url = new URL(data.featuredProjectUrl); } catch { throw new Error("Enter a valid featured project URL."); }
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Featured project URL must use HTTPS.");
  }
  let socialLinks = defaultSiteSettings.socialLinks;
  if (data.socialLinks !== undefined) {
    if (!Array.isArray(data.socialLinks) || data.socialLinks.length > 30) throw new Error("Invalid social links.");
    socialLinks = data.socialLinks.map((item: unknown) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Invalid social link.");
      const link = item as Record<string, unknown>;
      if (typeof link.label !== "string" || !link.label.trim() || link.label.length > 80 || typeof link.handle !== "string" || link.handle.length > 160 || typeof link.href !== "string" || link.href.length > 2048) throw new Error("Invalid social link.");
      let url: URL;
      try { url = new URL(link.href); } catch { throw new Error("Enter a valid social link URL."); }
      if (!["https:", "mailto:"].includes(url.protocol) || url.username || url.password) throw new Error("Social links must use HTTPS or email.");
      return { label: link.label.trim(), handle: link.handle.trim(), href: link.href.trim() };
    });
  }
  let workExperience = defaultWorkExperience;
  if (data.workExperience !== undefined) {
    if (!Array.isArray(data.workExperience) || data.workExperience.length > 50) throw new Error("Invalid work experience.");
    workExperience = data.workExperience.map((entry: unknown) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Invalid employer.");
      const employer = entry as Record<string, unknown>;
      if (typeof employer.id !== "string" || !employer.id.trim() || employer.id.length > 100 || typeof employer.companyName !== "string" || !employer.companyName.trim() || employer.companyName.length > 200 || !Array.isArray(employer.positions) || employer.positions.length > 50 || (employer.isCurrentEmployer !== undefined && typeof employer.isCurrentEmployer !== "boolean")) throw new Error("Invalid employer.");
      for (const key of ["companyWebsite", "companyLogo"] as const) {
        const value = employer[key];
        if (value !== undefined && value !== "") {
          if (typeof value !== "string" || value.length > 2048) throw new Error("Invalid employer URL.");
          let url: URL;
          try { url = new URL(value); } catch { throw new Error("Enter a valid employer URL."); }
          if (url.protocol !== "https:" || url.username || url.password) throw new Error("Employer URLs must use HTTPS.");
        }
      }
      const positions = employer.positions.map((entry: unknown) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Invalid position.");
        const position = entry as Record<string, unknown>;
        const period = position.employmentPeriod as Record<string, unknown> | undefined;
        const validDate = (value: unknown) => typeof value === "string" && /^(?:(?:0[1-9]|1[0-2])\.)?\d{4}$/.test(value);
        if (typeof position.id !== "string" || !position.id.trim() || position.id.length > 100 || typeof position.title !== "string" || !position.title.trim() || position.title.length > 200 || !period || !validDate(period.start) || (period.end !== undefined && !validDate(period.end)) || (position.employmentType !== undefined && (typeof position.employmentType !== "string" || position.employmentType.length > 100)) || (position.description !== undefined && (typeof position.description !== "string" || position.description.length > 10000)) || (position.skills !== undefined && (!Array.isArray(position.skills) || position.skills.length > 50 || position.skills.some((skill: unknown) => typeof skill !== "string" || skill.length > 100)))) throw new Error("Invalid position.");
        return { id: position.id.trim(), title: position.title.trim(), employmentPeriod: { start: period.start as string, ...(period.end ? { end: period.end as string } : {}) }, ...(typeof position.employmentType === "string" ? { employmentType: position.employmentType } : {}), ...(typeof position.description === "string" ? { description: position.description } : {}), ...(Array.isArray(position.skills) ? { skills: position.skills as string[] } : {}) };
      });
      if (new Set(positions.map((position: WorkPosition) => position.id)).size !== positions.length) throw new Error("Duplicate position identifiers.");
      return { id: employer.id.trim(), companyName: employer.companyName.trim(), ...(typeof employer.companyWebsite === "string" && employer.companyWebsite ? { companyWebsite: employer.companyWebsite } : {}), ...(typeof employer.companyLogo === "string" && employer.companyLogo ? { companyLogo: employer.companyLogo } : {}), ...(employer.isCurrentEmployer === true ? { isCurrentEmployer: true } : {}), positions };
    });
    if (new Set(workExperience.map((employer) => employer.id)).size !== workExperience.length) throw new Error("Duplicate employer identifiers.");
  }
  let technologyStack = defaultTechnologyStack;
  if (data.technologyStack !== undefined) {
    if (!Array.isArray(data.technologyStack) || data.technologyStack.length > 30) throw new Error("Invalid technology stack.");
    technologyStack = data.technologyStack.map((entry: unknown) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Invalid technology group.");
      const group = entry as Record<string, unknown>;
      if (typeof group.label !== "string" || !group.label.trim() || group.label.length > 100 || !Array.isArray(group.items) || group.items.length > 100 || group.items.some((item: unknown) => typeof item !== "string" || !item.trim() || item.length > 100)) throw new Error("Invalid technology group.");
      return { label: group.label.trim(), items: (group.items as string[]).map((item) => item.trim()) };
    });
  }
  return {
    siteTitle: data.siteTitle.trim(),
    siteDescription: data.siteDescription.trim(),
    contactEmail: data.contactEmail.trim(),
    releaseVersion: typeof data.releaseVersion === "string" ? data.releaseVersion : defaultSiteSettings.releaseVersion,
    homepageProjectsTitle: typeof data.homepageProjectsTitle === "string" ? data.homepageProjectsTitle.trim() : defaultSiteSettings.homepageProjectsTitle,
    homepageProjectsDescription: typeof data.homepageProjectsDescription === "string" ? data.homepageProjectsDescription.trim() : defaultSiteSettings.homepageProjectsDescription,
    homepageBlogTitle: typeof data.homepageBlogTitle === "string" ? data.homepageBlogTitle.trim() : defaultSiteSettings.homepageBlogTitle,
    homepageBlogDescription: typeof data.homepageBlogDescription === "string" ? data.homepageBlogDescription.trim() : defaultSiteSettings.homepageBlogDescription,
    profileTagline: typeof data.profileTagline === "string" ? data.profileTagline.trim() : defaultSiteSettings.profileTagline,
    profileRole: typeof data.profileRole === "string" ? data.profileRole.trim() : defaultSiteSettings.profileRole,
    profileBio: typeof data.profileBio === "string" ? data.profileBio.trim() : defaultSiteSettings.profileBio,
    profileFocus: typeof data.profileFocus === "string" ? data.profileFocus.trim() : defaultSiteSettings.profileFocus,
    profileLocation: typeof data.profileLocation === "string" ? data.profileLocation.trim() : defaultSiteSettings.profileLocation,
    profileAvailability: typeof data.profileAvailability === "string" ? data.profileAvailability.trim() : defaultSiteSettings.profileAvailability,
    featuredProjectName: typeof data.featuredProjectName === "string" ? data.featuredProjectName.trim() : defaultSiteSettings.featuredProjectName,
    featuredProjectUrl: typeof data.featuredProjectUrl === "string" ? data.featuredProjectUrl.trim() : defaultSiteSettings.featuredProjectUrl,
    featuredProjectDescription: typeof data.featuredProjectDescription === "string" ? data.featuredProjectDescription.trim() : defaultSiteSettings.featuredProjectDescription,
    resumeUrl: typeof data.resumeUrl === "string" ? data.resumeUrl.trim() : defaultSiteSettings.resumeUrl,
    socialLinks,
    workExperience,
    technologyStack,
    aboutDescription: typeof data.aboutDescription === "string" ? data.aboutDescription.trim() : defaultSiteSettings.aboutDescription,
    aboutParagraphs: Array.isArray(data.aboutParagraphs) ? (data.aboutParagraphs as string[]).map((item) => item.trim()) : defaultSiteSettings.aboutParagraphs,
  };
}
