import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="text-4xl font-bold my-6">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-bold my-5">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-semibold my-4">{children}</h3>,
    p: ({ children }) => <p className="my-4 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>,
    li: ({ children }) => <li className="my-1">{children}</li>,
    code: ({ children, className }) => {
      if (className) {
        const language = className.replace('language-', '');
        return (
          <pre className="bg-primary dark:bg-secondary text-neutral-100 dark:text-neutral-900 p-4 rounded-lg overflow-x-auto my-6">
            <code className={`language-${language} text-sm`}>
              {children}
            </code>
          </pre>
        );
      }
      return <code className="bg-gray-800 px-2 py-1 rounded text-sm">{children}</code>;
    },
    pre: ({ children }) => <>{children}</>,
    a: ({ children, href }) => (
      <a href={href} className="text-blue-400 hover:underline">
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          {children}
        </table>
      </div>
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
    ...components,
  };
}