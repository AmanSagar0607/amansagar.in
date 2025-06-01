import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/ui/code-block';

// Define the components directly since we don't need to extend from next-mdx-remote
const components: MDXComponents = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        'text-3xl font-bold mt-10 mb-6',
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        'text-2xl font-bold mt-8 mb-4',
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        'text-xl font-bold mt-6 mb-3',
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn(
        'text-base mb-4 leading-relaxed',
        className
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        'list-disc pl-6 mb-6 space-y-2',
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        'list-decimal pl-6 mb-6 space-y-2',
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li
      className={cn(
        'mb-2',
        className
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline',
        className
      )}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        'bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono',
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, children, ...props }) => (
    <pre
      className={cn(
        'rounded-lg mb-6 overflow-x-auto',
        className
      )}
      {...props}
    >
      <CodeBlock {...props}>{children}</CodeBlock>
    </pre>
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        'border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-6',
        className
      )}
      {...props}
    />
  ),
};

export { components };

// For backward compatibility
export function useMDXComponents(providedComponents: MDXComponents = {}): MDXComponents {
  return {
    ...components,
    ...providedComponents,
  };
}
