import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';

interface MDXFile {
  slug: string;
  content: string;
  frontmatter: Record<string, any>;
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
          frontmatter: frontmatter as Record<string, any>,
        };
      })
    );
    
    // Sort posts by date in descending order (newest first)
    return posts.sort((a, b) => 
      new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
    );
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
