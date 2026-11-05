import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { headingSlug, normalizeArticleMarkdown } from "@/lib/article-content";
import type { Root, Element, RootContent } from "hast";
import { CodeBlock } from "@/components/ui/code-block";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
    <ScrollArea
      className="max-w-full"
      tabIndex={0}
      role="region"
      aria-label="Scrollable table"
    >
      <table>{children}</table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};

const articleSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [
      ...(defaultSchema.attributes?.["*"] || []),
      ["dataAlign", "left", "center", "right", "justify"],
    ],
    img: [
      ...(defaultSchema.attributes?.img || []),
      "width",
      "height",
      "dataCaption",
    ],
  },
};

/** Assign IDs in the syntax tree, keeping React renders pure under StrictMode. */
function articleAnchors() {
  return (tree: Root) => {
    const used = new Map<string, number>();
    const textOf = (node: RootContent): string =>
      node.type === "text"
        ? node.value
        : "children" in node
          ? node.children.map((child) => textOf(child as RootContent)).join("")
          : "";
    function visit(node: Root | RootContent) {
      if (node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
        const base = headingSlug(textOf(node));
        const count = used.get(base) || 0;
        used.set(base, count + 1);
        (node as Element).properties.id = `${base}${count ? `-${count}` : ""}`;
        if (node.tagName === "h1") node.tagName = "h2";
      }
      if ("children" in node)
        node.children.forEach((child) => visit(child as RootContent));
    }
    visit(tree);
  };
}

/** Render editor Markdown as inert content, using the portfolio's article styling. */
export function ActivityMarkdown({ content }: { content: string }) {
  return (
    <div className="article-content prose prose-ncdai dark:prose-invert max-w-none min-w-0 break-words [&_img]:max-w-full [&_pre]:max-w-full [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:whitespace-pre">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, articleSchema],
          articleAnchors,
        ]}
        components={{
          ...markdownComponents,
          img: ({ src, alt, width, height, ...props }) => {
            const attrs = props as Record<string, unknown>;
            const align = attrs["data-align"];
            const caption = attrs["data-caption"];
            const dimension = (value: unknown) =>
              /^\d{1,5}$/.test(String(value)) &&
              Number(value) > 0 &&
              Number(value) <= 10000
                ? Number(value)
                : undefined;
            return (
              <span
                className="article-image"
                data-align={typeof align === "string" ? align : "center"}
              >
                {/* Uploaded and referenced remote images need no Next image host configuration. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt || ""}
                  width={dimension(width)}
                  height={dimension(height)}
                  style={
                    dimension(width) && dimension(height)
                      ? {
                          aspectRatio: `${dimension(width)} / ${dimension(height)}`,
                          objectFit: "contain",
                        }
                      : undefined
                  }
                  loading="lazy"
                  decoding="async"
                />
                {typeof caption === "string" && caption && (
                  <span className="article-caption">{caption}</span>
                )}
              </span>
            );
          },
        }}
      >
        {normalizeArticleMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
