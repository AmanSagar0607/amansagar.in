import type { MDXComponents } from 'mdx/types';
import { MDXProvider } from '@mdx-js/react';

/**
 * MDX Components configuration for the blog
 * Provides styled components for MDX content
 */
export const mdxComponents: MDXComponents = {
  // Headers
  h1: ({ children }) => (
    <h1 className="text-4xl font-bold mb-6 mt-10">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-3xl font-bold mb-4 mt-8 text-primary">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-2xl font-semibold mb-3 mt-6 text-secondary">
      {children}
    </h3>
  ),
  
  // Text elements
  p: ({ children }) => (
    <p className="mb-4 text-lg leading-relaxed">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic">
      {children}
    </em>
  ),
  
  // Lists
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-6 space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-6 space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="mb-2">
      {children}
    </li>
  ),
  
  // Code blocks
  code: ({ children, className }) => {
    const isInline = !className?.includes('language-');
    return isInline ? (
      <code className="bg-gray-800 text-pink-400 px-1.5 py-0.5 rounded text-sm">
        {children}
      </code>
    ) : (
      <code className={className}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <div className="mb-6 rounded-lg overflow-hidden">
      <pre className="bg-gray-900 p-4 overflow-x-auto text-sm">
        {children}
      </pre>
    </div>
  ),
  
  // Links
  a: ({ children, href }) => (
    <a 
      href={href} 
      className="text-blue-400 hover:text-blue-300 underline transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  
  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300 my-6">
      {children}
    </blockquote>
  ),
  
  // Horizontal Rule
  hr: () => (
    <hr className="my-8 border-t border-gray-700" />
  ),
  
  // Images
  img: ({ src, alt }) => (
    <div className="my-6">
      <img 
        src={src} 
        alt={alt || ''} 
        className="rounded-lg shadow-lg max-w-full h-auto"
      />
      {alt && (
        <p className="text-sm text-center text-gray-400 mt-2">
          {alt}
        </p>
      )}
    </div>
  ),
  
  // Tables
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-800">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-700">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-gray-800/50">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
      {children}
    </td>
  ),
};

// For backward compatibility
export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}

// MDX Provider component
export function MDXProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MDXProvider components={mdxComponents}>
      {children}
    </MDXProvider>
  );
}
