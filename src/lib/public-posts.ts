import "server-only";
import matter from "gray-matter";
import { getCmsPublicContent } from "@/lib/cms-public-content";
import { getMDXFileBySlug, getMDXFiles, type MDXFile } from "@/lib/mdx-utils";
import { isPublicPageVisible } from "@/lib/public-page-visibility";

const directory = "src/content/posts";
export type PublicPost = MDXFile & { format: "trusted-mdx" | "markdown" };
/** Public read boundary; migration keeps the existing MDX files as source until configured. */
export async function getPublicPosts(): Promise<MDXFile[]> {
  if (!(await isPublicPageVisible("/blog"))) return [];
  const cms = await getCmsPublicContent();
  if (cms) return cms.posts();
  return getMDXFiles(directory);
}
export async function getPublicPost(slug: string): Promise<PublicPost | null> {
  if (!(await isPublicPageVisible("/blog"))) return null;
  const cms = await getCmsPublicContent();
  if (cms) return cms.post(slug);
  const post = await getMDXFileBySlug(directory, slug);
  if (!post) return null;
  return {
    ...post,
    content: matter(post.content).content,
    format: "trusted-mdx",
  };
}
