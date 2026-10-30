import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/ui/code-block";

const markdownComponents: Components = {
  // The page title already supplies h1; journal body headings begin at h2.
  h1: ({ children }) => <h2>{children}</h2>,
  pre: ({ children }) => {
    const code = Children.toArray(children)[0];
    const content = isValidElement<{ children?: ReactNode }>(code)
      ? code.props.children
      : children;
    return <CodeBlock>{content}</CodeBlock>;
  },
  table: ({ children }) => (
    <div
      className="max-w-full overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label="Scrollable table"
    >
      <table>{children}</table>
    </div>
  ),
};

/** Render editor Markdown as inert content, using the portfolio's article styling. */
export function ActivityMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-ncdai dark:prose-invert max-w-none min-w-0 break-words [&_img]:h-auto [&_img]:max-w-full [&_pre]:max-w-full [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:whitespace-pre">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
