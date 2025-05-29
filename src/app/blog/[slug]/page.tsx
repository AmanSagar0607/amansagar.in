import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { components } from '@/components/mdx-components';

interface PostProps {
  params: {
    slug: string;
  };
}

// Calculate read time in minutes (average reading speed: 200 words per minute)
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const filePath = path.join(process.cwd(), `src/content/posts/${slug}.mdx`);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { frontmatter } = await compileMDX({
      source: fileContent,
      options: { parseFrontmatter: true },
    });

    const metadata = frontmatter as {
      title: string;
      description: string;
      date: string;
      author?: string;
      category?: string;
      readTime?: string;
      views?: number;
      tags?: string[];
    };

    return {
      title: `${metadata.title} | Aman's Blog`,
      description: metadata.description,
      openGraph: {
        title: metadata.title,
        description: metadata.description,
        type: 'article',
        publishedTime: metadata.date,
        authors: [metadata.author || 'Aman'],
      },
    };
  } catch (error) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), `src/content/posts/${slug}.mdx`);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract content without frontmatter for read time calculation
    const contentWithoutFrontmatter = fileContent.replace(/^---[\s\S]*?---\s*/, '');
    const readTime = calculateReadTime(contentWithoutFrontmatter);
    
    const { content, frontmatter } = await compileMDX({
      source: fileContent,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeHighlight],
        },
      },
      components,
    });

    const metadata = frontmatter as {
      title: string;
      description: string;
      date: string;
      author?: string;
      category?: string;
      readTime?: string;
      views?: number;
      tags?: string[];
    };

    return (
      <article className="max-w-3xl mx-auto py-6 px-4">
        <header className="mb-8">
          {/* Category */}
          {metadata.category && (
            <div className="mb-3">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary-foreground hover:bg-primary/20 transition-colors">
                {metadata.category}
              </span>
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
            {metadata.title}
          </h1>
          
          {/* Description */}
          {metadata.description && (
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {metadata.description}
            </p>
          )}
          
          {/* Author and Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-muted-foreground border-b pb-6 mb-6">
            <div className="flex items-center gap-3">
              {/* Author Avatar - You can add an avatar here if you have one */}
              
              {/* <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" /> */}
              <div>
                <div className="font-medium text-foreground">
                  {metadata.author}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={metadata.date}>
                    {new Date(metadata.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                  <span>•</span>
                  <span>{readTime}</span>
                  <span>•</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              {metadata.views !== undefined && (
                <div className="flex items-center gap-1">
                  <span>👁️</span>
                  <span>{metadata.views} {metadata.views === 1 ? 'view' : 'views'}</span>
                </div>
              )}
              {/* Add social sharing buttons here if needed */}
              <div className="flex items-center gap-2">
                <span>Share:</span>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20v-7m0 0v-2m0 2h7m-7 0h-2m2 7v2m0 4v-2m0 4h7m-7 0h-2m2 4v2m0 4v-2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          
          {/* Tags */}
          {metadata.tags && metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
        <div className="prose dark:prose-invert max-w-none">
          {content}
        </div>
      </article>
    );
  } catch (error) {
    console.error('Error rendering post:', error);
    return notFound();
  }
}

export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), 'src/content/posts');
  
  try {
    const files = fs.readdirSync(postsDir);
    return files
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => ({
        slug: file.replace(/\.mdx$/, ''),
      }));
  } catch (error) {
    console.error('Error reading posts directory:', error);
    return [];
  }
}
