import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Docker as DevDocker,
  FastAPI as DevFastAPI,
  Figma as DevFigma,
  Git as DevGit,
  GitHubDark as DevGitHub,
  NextJs as DevNextJs,
  Playwright as DevPlaywright,
  PostgreSQL as DevPostgreSQL,
  Python as DevPython,
  React as DevReact,
  Supabase as DevSupabase,
  TypeScript as DevTypeScript,
} from "developer-icons";
import {
  ArrowUpRight,
  Clock3,
  Code2,
  Github,
  Mail,
  MapPin,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import {
  IconBrandFramerMotion,
  IconBrandOpenai,
  type TablerIcon,
} from "@tabler/icons-react";
import {
  siBaseui,
  siBun,
  siClaude,
  siCursor,
  siDocker,
  siExpo,
  siFigma,
  siGit,
  siGooglegemini,
  siGithub,
  siMobxstatetree,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siNginx,
  siPostgresql,
  siPosthog,
  siPython,
  siReact,
  siRadixui,
  siRedis,
  siShadcnui,
  siTanstack,
  siTailwindcss,
  siVercel,
  type SimpleIcon,
} from "simple-icons";
import { GitHubActivityCard } from "@/components/github-activity-card";
import { GitHubContributionsFallback } from "@/components/github-contributions";
import { PortfolioProjectGrid } from "@/components/portfolio-project-grid";
import {
  WorkExperience,
  type ExperienceItemType,
} from "@/components/work-experience";
import { getCachedContributions } from "@/lib/get-cached-contributions";
import { type MDXFile } from "@/lib/mdx-utils";
import { getPublicPosts } from "@/lib/public-posts";
import { getPublicProjects } from "@/lib/public-projects";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { defaultSiteSettings } from "@/lib/admin/site-settings";

type BlogPostFrontmatter = {
  title: string;
  date: string;
  readTime?: string;
};

type BlogPost = Omit<MDXFile, "frontmatter"> & {
  frontmatter: BlogPostFrontmatter;
};

type StackIcon =
  | { type: "simple"; icon: SimpleIcon }
  | { type: "tabler"; icon: TablerIcon }
  | {
      type: "developer";
      icon: (props: {
        className?: string;
        size?: number;
        "aria-hidden"?: boolean;
      }) => React.ReactNode;
    }
  | { type: "badge"; label: string };

type StackItem = {
  label: string;
  icon: StackIcon;
};

const simpleIcon = (icon: SimpleIcon): StackIcon => ({ type: "simple", icon });
const tablerIcon = (icon: TablerIcon): StackIcon => ({ type: "tabler", icon });
const developerIcon = (
  icon: Extract<StackIcon, { type: "developer" }>["icon"],
): StackIcon => ({ type: "developer", icon });
const badgeIcon = (label: string): StackIcon => ({ type: "badge", label });

const techStack: { label: string; items: StackItem[] }[] = [
  {
    label: "Language",
    items: [
      { label: "TypeScript", icon: badgeIcon("TS") },
      { label: "JavaScript", icon: badgeIcon("JS") },
      { label: "Python", icon: simpleIcon(siPython) },
    ],
  },
  {
    label: "Frontend",
    items: [
      { label: "React", icon: simpleIcon(siReact) },
      { label: "Next.js", icon: simpleIcon(siNextdotjs) },
      { label: "Tailwind CSS", icon: simpleIcon(siTailwindcss) },
      { label: "shadcn/ui", icon: simpleIcon(siShadcnui) },
      { label: "Radix UI", icon: simpleIcon(siRadixui) },
      { label: "Base UI", icon: simpleIcon(siBaseui) },
      { label: "Motion", icon: tablerIcon(IconBrandFramerMotion) },
      { label: "Expo", icon: simpleIcon(siExpo) },
      { label: "TanStack", icon: simpleIcon(siTanstack) },
      { label: "MobX-State-Tree", icon: simpleIcon(siMobxstatetree) },
    ],
  },
  {
    label: "Backend & Database",
    items: [
      { label: "Node.js", icon: simpleIcon(siNodedotjs) },
      { label: "Python", icon: simpleIcon(siPython) },
      { label: "Bun", icon: simpleIcon(siBun) },
      { label: "PostgreSQL", icon: simpleIcon(siPostgresql) },
      { label: "MongoDB", icon: simpleIcon(siMongodb) },
      { label: "Redis", icon: simpleIcon(siRedis) },
      { label: "nginx", icon: simpleIcon(siNginx) },
    ],
  },
  {
    label: "Workflow & AI",
    items: [
      { label: "Cursor", icon: simpleIcon(siCursor) },
      { label: "Claude", icon: simpleIcon(siClaude) },
      { label: "Gemini", icon: simpleIcon(siGooglegemini) },
      { label: "ChatGPT", icon: tablerIcon(IconBrandOpenai) },
      { label: "Git", icon: simpleIcon(siGit) },
      { label: "GitHub", icon: simpleIcon(siGithub) },
      { label: "Docker", icon: simpleIcon(siDocker) },
      { label: "Vercel", icon: simpleIcon(siVercel) },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "OpenPanel", icon: badgeIcon("OI") },
      { label: "PostHog", icon: simpleIcon(siPosthog) },
    ],
  },
  {
    label: "Design",
    items: [
      { label: "Figma", icon: simpleIcon(siFigma) },
      { label: "Paper", icon: badgeIcon("P") },
      { label: "Photoshop", icon: badgeIcon("Ps") },
    ],
  },
];

const experiences: ExperienceItemType[] = [
  {
    id: "nirnaya",
    companyName: "Nirnaya - Ministry of Defence",
    isCurrentEmployer: true,
    positions: [
      {
        id: "nirnaya-sd",
        title: "Software Engineer",
        employmentType: "Full-time",
        employmentPeriod: { start: "10.2025" },
        description:
          "- Built secure internal web platforms and production dashboards for operational workflows.\n- Developed full-stack features across UI, APIs, and data pipelines.\n- Shipped product improvements with a strong focus on usability, performance, and delivery discipline.",
        skills: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
      },
    ],
  },
  {
    id: "triggrsweb",
    companyName: "TriggrsWeb Solutions",
    positions: [
      {
        id: "triggrsweb-mern",
        title: "MERN Stack Developer",
        employmentType: "Full-time",
        employmentPeriod: { start: "04.2025", end: "10.2025" },
        description:
          "- Built modular client-facing applications and worked across UI, APIs, and deployment flows.\n- Contributed to reusable systems and smoother release cycles across projects.",
        skills: ["React", "Node.js", "MongoDB", "Express"],
      },
    ],
  },
  {
    id: "khuladibba",
    companyName: "Khuladibba Enterprises",
    positions: [
      {
        id: "khuladibba-fsd",
        title: "Full Stack Developer",
        employmentType: "Full-time",
        employmentPeriod: { start: "10.2024", end: "03.2025" },
        description:
          "- Shipped e-commerce and product features with a focus on performance, UX, and delivery.\n- Helped turn business requirements into working product experiences quickly.",
        skills: ["Next.js", "React", "Node.js", "Tailwind CSS"],
      },
    ],
  },
];

const socialLinks = [
  {
    label: "GitHub",
    handle: "@AmanSagar0607",
    href: "https://github.com/AmanSagar0607",
  },
  {
    label: "LinkedIn",
    handle: "/in/amansagar0607",
    href: "https://www.linkedin.com/in/amansagar0607/",
  },
  {
    label: "X",
    handle: "@amansagar0607",
    href: "https://x.com/amansagar0607",
  },
  {
    label: "Medium",
    handle: "@amansagar0607",
    href: "https://medium.com/@amansagar0607",
  },
  {
    label: "Behance",
    handle: "@amansagar0607",
    href: "https://behance.net/amansagar0607",
  },
  {
    label: "Email",
    handle: "amansagar0307@gmail.com",
    href: "mailto:amansagar0307@gmail.com",
  },
];

const profileDetails = [
  {
    label: "Focus",
    value: "AI systems",
    icon: Sparkles,
  },
  {
    label: "Current",
    value: "Software Engineer",
    icon: Code2,
  },
  {
    label: "Location",
    value: "India",
    icon: MapPin,
  },
  {
    label: "Availability",
    value: "Open to product work",
    icon: Clock3,
  },
  {
    label: "GitHub",
    value: "AmanSagar0607",
    href: "https://github.com/AmanSagar0607",
    icon: Github,
  },
  {
    label: "Email",
    value: "amansagar0307@gmail.com",
    href: "mailto:amansagar0307@gmail.com",
    icon: Mail,
  },
];

function formatReadMeta(post: BlogPost) {
  if (post.frontmatter.readTime)
    return post.frontmatter.readTime.replace("Read", "read");

  return new Date(post.frontmatter.date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default async function Home() {
  const posts = ((await getPublicPosts()) as unknown as BlogPost[])
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    )
    .slice(0, 4);
  const projects = (await getPublicProjects()).sort(
    (a, b) =>
      Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
      Date.parse(b.date) - Date.parse(a.date),
  );
  const settings = await getPublicSiteSettings();
  const github = (
    settings.socialLinks ??
    defaultSiteSettings.socialLinks ??
    []
  ).find((link) => link.label.toLowerCase() === "github");
  const githubUsername = github?.href.match(
    /^https:\/\/github\.com\/([a-z\d](?:[a-z\d-]{0,38}))(?:\/)?$/i,
  )?.[1];
  const details = profileDetails
    .filter((item) => item.label !== "GitHub" || github)
    .map((item) => {
      if (item.label === "Focus")
        return { ...item, value: settings.profileFocus ?? item.value };
      if (item.label === "Current")
        return { ...item, value: settings.profileRole ?? item.value };
      if (item.label === "Location")
        return { ...item, value: settings.profileLocation ?? item.value };
      if (item.label === "Availability")
        return { ...item, value: settings.profileAvailability ?? item.value };
      if (item.label === "Email")
        return {
          ...item,
          value: settings.contactEmail,
          href: `mailto:${settings.contactEmail}`,
        };
      if (item.label === "GitHub" && github)
        return {
          ...item,
          value: github.handle || github.label,
          href: github.href,
        };
      return item;
    });
  const knownIcons = new Map(
    techStack.flatMap((group) =>
      group.items.map((item) => [item.label.toLowerCase(), item.icon] as const),
    ),
  );
  const developerIcons = new Map<string, StackIcon>([
    ["next.js", developerIcon(DevNextJs)],
    ["react", developerIcon(DevReact)],
    ["typescript", developerIcon(DevTypeScript)],
    ["python", developerIcon(DevPython)],
    ["fastapi", developerIcon(DevFastAPI)],
    ["postgresql", developerIcon(DevPostgreSQL)],
    ["supabase", developerIcon(DevSupabase)],
    ["git", developerIcon(DevGit)],
    ["github", developerIcon(DevGitHub)],
    ["docker", developerIcon(DevDocker)],
    ["playwright", developerIcon(DevPlaywright)],
    ["figma", developerIcon(DevFigma)],
  ]);
  const displayedStack =
    settings.technologyStack?.map((group) => ({
      label: group.label,
      items: group.items.map((label) => ({
        label,
        icon:
          developerIcons.get(label.toLowerCase()) ??
          knownIcons.get(label.toLowerCase()) ??
          badgeIcon(label.slice(0, 2)),
      })),
    })) ?? techStack;
  const contributions = githubUsername
    ? getCachedContributions(githubUsername)
    : null;

  return (
    <main className="page-shell">
      <section id="about" className="page-section">
        <div className="hero-stage screen-line-bottom">
          <div className="hero-stage-grid" aria-hidden>
            <div className="hero-stage-block hero-stage-block-large" />
            <div className="hero-stage-block hero-stage-block-mid" />
            <div className="hero-stage-block hero-stage-block-small" />
          </div>
          <div className="hero-stage-profile">
            <div className="hero-stage-avatar">
              <div className="hero-stage-avatar-inner">
                <Image
                  src="/aman-avatar.webp"
                  alt={settings.siteTitle}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
            <div className="hero-stage-title-wrap">
              <div className="hero-stage-title-row">
                <h1 className="hero-stage-name">{settings.siteTitle}</h1>
              </div>
              <div className="hero-stage-subline">
                {settings.profileTagline ?? defaultSiteSettings.profileTagline}
              </div>
            </div>
          </div>
        </div>

        <div className="page-heading">
          <div className="hero-minimal">
            <div className="hero-minimal-head">
              <div className="hero-role-row hero-role-row-inline">
                <span className="hero-role-label">
                  {settings.profileRole ?? defaultSiteSettings.profileRole}
                </span>
                {github && (
                  <Link
                    href={github.href}
                    target="_blank"
                    className="hero-role-link"
                  >
                    {github.handle || github.label}
                  </Link>
                )}
              </div>
              <div className="hero-role-row hero-role-row-build">
                <span className="hero-role-label">Building</span>
                <Link
                  href={
                    settings.featuredProjectUrl ??
                    defaultSiteSettings.featuredProjectUrl!
                  }
                  target="_blank"
                  className="hero-role-link"
                >
                  {settings.featuredProjectName ??
                    defaultSiteSettings.featuredProjectName}
                </Link>
                <span className="text-muted-foreground text-sm leading-6">
                  {settings.featuredProjectDescription ??
                    defaultSiteSettings.featuredProjectDescription}
                </span>
              </div>
              <p className="text-muted-foreground max-w-2xl text-sm leading-6">
                {settings.profileBio ?? defaultSiteSettings.profileBio}
              </p>
            </div>

            <div className="profile-detail-grid">
              {details.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <span className="profile-detail-icon" aria-hidden>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="profile-detail-label">{item.label}</span>
                    <span className="profile-detail-value">{item.value}</span>
                    {item.href ? (
                      <ArrowUpRight className="text-muted-foreground ml-auto h-4 w-4" />
                    ) : null}
                  </>
                );

                return item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    className="profile-detail-row"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={item.label} className="profile-detail-row">
                    {content}
                  </div>
                );
              })}
            </div>

            {contributions && github && (
              <Suspense fallback={<GitHubContributionsFallback />}>
                <GitHubActivityCard
                  contributions={contributions}
                  profileUrl={github.href}
                />
              </Suspense>
            )}
          </div>
        </div>
      </section>

      <div className="stripe-divider" />

      <section id="stack" className="page-section scroll-mt-24">
        <div className="section-bar screen-line-top screen-line-bottom">
          <h2 className="section-title">Stack</h2>
          <span className="mono-note">
            Tools I use to build digital products.
          </span>
        </div>
        <div className="stack-groups list-grid">
          {displayedStack.map((group, index) => (
            <div
              key={group.label}
              className="stack-group screen-line-bottom grid gap-4 p-4 sm:grid-cols-[12rem_1fr]"
            >
              <div className="text-muted-foreground flex items-center gap-3 transition-opacity duration-150">
                <span className="font-mono text-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-lg">{group.label}</span>
              </div>
              <div className="stack-chip-grid">
                {group.items.map((item: StackItem) => {
                  return (
                    <span key={item.label} className="stack-chip">
                      <StackLogo icon={item.icon} className="stack-chip-icon" />
                      <span>{item.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="stripe-divider" />

      <section id="projects" className="page-section scroll-mt-24">
        <div className="section-bar screen-line-top screen-line-bottom">
          <h2 className="section-title">
            {settings.homepageProjectsTitle ?? "Projects"}
          </h2>
          <span className="mono-note">
            {settings.homepageProjectsDescription ??
              "Selected work with product screenshots and deployment proof."}
          </span>
        </div>
        <div className="section-copy"></div>
        <PortfolioProjectGrid
          projects={projects}
          description={settings.homepageProjectsDescription}
        />
        <div className="screen-line-top flex justify-center p-4">
          <Link
            href="/projects"
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
          >
            View all projects
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="stripe-divider" />

      <section id="writing" className="page-section scroll-mt-24">
        <div className="section-bar screen-line-top screen-line-bottom">
          <h2 className="section-title">
            {settings.homepageBlogTitle ?? "Blog"}
          </h2>
          <span className="mono-note">
            {settings.homepageBlogDescription ??
              "Notes on AI agents, product engineering, and systems thinking."}
          </span>
        </div>
        <div className="list-grid">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="screen-line-bottom list-row"
            >
              <div className="flex items-start gap-3">
                <NotebookPen className="text-muted-foreground mt-1 h-4 w-4" />
                <span className="list-row-title">{post.frontmatter.title}</span>
              </div>
              <span className="list-row-meta">{formatReadMeta(post)}</span>
            </Link>
          ))}
        </div>
        <div className="screen-line-top flex justify-center p-4">
          <Link
            href="/blog"
            className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
          >
            All posts
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="stripe-divider" />

      <section id="experience" className="page-section scroll-mt-24">
        <div className="section-bar screen-line-top screen-line-bottom">
          <h2 className="section-title">Experience</h2>
          <span className="mono-note">
            Structured using the same grouped work-experience component pattern.
          </span>
        </div>
        <div className="section-copy">
          Real roles, grouped by company, with expandable detail, tech tags, and
          auto-calculated duration from employment dates.
        </div>
        <WorkExperience
          experiences={settings.workExperience ?? experiences}
          className="*:screen-line-bottom"
        />
      </section>

      <div className="stripe-divider" />

      <section id="socials" className="page-section scroll-mt-24">
        <div className="section-bar screen-line-top screen-line-bottom">
          <h2 className="section-title">Socials</h2>
          <span className="mono-note">
            Compact link rows aligned to the same monochrome system.
          </span>
        </div>
        <div className="social-grid">
          {(settings.socialLinks ?? socialLinks).map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              target="_blank"
              className="screen-line-bottom social-link"
            >
              <span className="social-label">{item.label}</span>
              <span className="social-handle">{item.handle}</span>
              <ArrowUpRight className="text-muted-foreground ml-auto h-4 w-4" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function StackLogo({
  icon,
  className,
}: {
  icon: StackIcon;
  className?: string;
}) {
  if (icon.type === "badge") {
    return (
      <span className={`${className ?? ""} stack-chip-badge`} aria-hidden>
        {icon.label}
      </span>
    );
  }

  if (icon.type === "tabler") {
    const Icon = icon.icon;

    return <Icon className={className} aria-hidden stroke={1.9} />;
  }

  if (icon.type === "developer") {
    const Icon = icon.icon;
    return <Icon className={className} size={20} aria-hidden />;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <path d={icon.icon.path} fill="currentColor" />
    </svg>
  );
}
