import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';

interface Frontmatter {
  title?: string;
  date?: string;
  [key: string]: unknown; // For any additional frontmatter fields
}

interface MDXFile {
  slug: string;
  content: string;
  frontmatter: Frontmatter;
}

export async function getMDXFiles(directory: string): Promise<MDXFile[]> {
  try {
    const files = fs.readdirSync(directory);
    const mdxFiles = files.filter((file) => file.endsWith('.mdx'));
    
    const posts = await Promise.all(
      mdxFiles.map(async (file) => {
        const filePath = path.join(directory, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { frontmatter } = await compileMDX({
          source: fileContent,
          options: { parseFrontmatter: true },
        });
        
        return {
          slug: file.replace(/\.mdx$/, ''),
          content: fileContent,
          frontmatter: {
            ...(frontmatter as Record<string, unknown>),
            title: frontmatter?.title || '',
            date: frontmatter?.date || new Date().toISOString(),
          } as Frontmatter,
        };
      })
    );
    
    // Sort posts by date in descending order (newest first)
    return posts.sort((a, b) => {
      const dateA = a.frontmatter.date ? new Date(a.frontmatter.date).getTime() : 0;
      const dateB = b.frontmatter.date ? new Date(b.frontmatter.date).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error reading MDX files:', error);
    return [];
  }
}

export async function getMDXFileBySlug(directory: string, slug: string): Promise<MDXFile | null> {
  try {
    const filePath = path.join(directory, `${slug}.mdx`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const { frontmatter } = await compileMDX({
      source: fileContent,
      options: { parseFrontmatter: true },
    });
    
    return {
      slug,
      content: fileContent,
      frontmatter: frontmatter as Record<string, any>,
    };
  } catch (error) {
    console.error(`Error reading MDX file ${slug}:`, error);
    return null;
  }
}
