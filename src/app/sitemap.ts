import type { MetadataRoute } from "next";
import { getPublicProjects } from "@/lib/public-projects";
import { getPublicPosts } from "@/lib/public-posts";
import { getPublicActivities, getPublicTracks } from '@/lib/public-journey';
import { getPublicPages } from "@/lib/public-pages";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { isPagePathVisible } from "@/lib/public-page-visibility";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.amansagar.in";

type SitemapPost = {
  slug: string;
  frontmatter: {
    date?: string;
  };
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicSiteSettings();
  const staticRoutes = ["", "/about", "/projects", "/blog", "/contact", "/journey", "/achievements"].filter((route) => isPagePathVisible(route || "/", settings.hiddenPages)).map(
    (route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })
  );

  const projectRoutes = (await getPublicProjects()).map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: project.date ? new Date(project.date) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const posts = (await getPublicPosts()) as unknown as SitemapPost[];
  const postRoutes = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.frontmatter.date
      ? new Date(post.frontmatter.date)
      : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const activities = await getPublicActivities();
  const activityRoutes = isPagePathVisible("/journey", settings.hiddenPages) ? activities.filter(a => !a.blogSlug && a.content.trim().split(/\s+/).length >= 80).map(a => ({ url: `${siteUrl}/journey/activity/${a.slug}`, lastModified: new Date(a.updatedAt), changeFrequency: 'monthly' as const, priority: 0.7 })) : [];
  const trackRoutes = isPagePathVisible("/journey", settings.hiddenPages) ? (await getPublicTracks()).filter(t => activities.some(a => a.trackSlugs.includes(t.slug))).map(t => ({ url: `${siteUrl}/journey/${t.slug}`, changeFrequency: 'weekly' as const, priority: 0.7 })) : [];
  const customPageRoutes = (await getPublicPages()).filter((page) => isPagePathVisible(`/${page.slug}`, settings.hiddenPages)).map((page) => ({
    url: `${siteUrl}/${page.slug}`,
    lastModified: new Date(page.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...projectRoutes, ...postRoutes, ...activityRoutes, ...trackRoutes, ...customPageRoutes];
}
