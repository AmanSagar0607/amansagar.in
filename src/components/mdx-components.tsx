import type { MDXComponents } from 'mdx/types';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/ui/code-block';
import React from 'react';

// Helper function to create properly typed components
function createMDXComponent(
  Tag: keyof JSX.IntrinsicElements,
  defaultClassName: string
): MDXComponents[keyof MDXComponents] {
  const Component = ({
    className = '',
    ...props
  }: React.HTMLAttributes<HTMLElement> & { className?: string; children?: ReactNode }) => {
    return React.createElement(
      Tag as string,
      {
        className: cn(defaultClassName, className),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(props as Record<string, any>),
      }
    );
  };
  Component.displayName = `MDX${typeof Tag === 'string' ? Tag.toUpperCase() : ''}`;
  return Component as unknown as MDXComponents[keyof MDXComponents];
}


const components: Partial<MDXComponents> = {
  h1: createMDXComponent('h1', 'text-3xl font-bold mt-10 mb-6'),
  h2: createMDXComponent('h2', 'text-2xl font-bold mt-8 mb-4'),
  h3: createMDXComponent('h3', 'text-xl font-bold mt-6 mb-3'),
  p: createMDXComponent('p', 'text-base mb-4 leading-relaxed'),
  ul: createMDXComponent('ul', 'list-disc pl-6 mb-6 space-y-2'),
  ol: createMDXComponent('ol', 'list-decimal pl-6 mb-6 space-y-2'),
  li: createMDXComponent('li', 'mb-2'),
  a: ({
    className = '',
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { className?: string }) => (
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
  code: ({
    className = '',
    ...props
  }: React.HTMLAttributes<HTMLElement> & { className?: string }) => (
    <code
      className={cn(
        'bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono',
        className
      )}
      {...props}
    />
  ),
  pre: ({
    className = '',
    children,
    ...props
  }: React.HTMLAttributes<HTMLPreElement> & { className?: string; children?: ReactNode }) => (
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
  blockquote: ({
    className = '',
    ...props
  }: React.BlockquoteHTMLAttributes<HTMLElement> & { className?: string }) => (
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
  } as MDXComponents;
}