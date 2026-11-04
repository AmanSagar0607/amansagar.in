/** Shared by the editor, public renderer and article metadata. */
export function normalizeArticleMarkdown(content: string): string {
  // Legacy Notion-style callouts contain Markdown inside an HTML block. Turn
  // these into Markdown quotes before parsing, without touching fenced code.
  return content
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g)
    .map((part, index) =>
      index % 2
        ? part
        : part.replace(
            /<aside\b[^>]*>([\s\S]*?)<\/aside>/gi,
            (_, body: string) =>
              `\n\n${body
                .trim()
                .split(/\r?\n/)
                .map((line) => `> ${line}`)
                .join("\n")}\n\n`,
          ),
    )
    .join("");
}

export function isRichArticle(content: string): boolean {
  return /^\s*<(?:p|h[1-6]|blockquote|ul|ol|table|pre|div|figure|img)\b/i.test(
    content,
  );
}

export function articleText(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[#*_~`|>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function headingSlug(title: string): string {
  return (
    articleText(title)
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}

export function articleHeadings(content: string) {
  const used = new Map<string, number>();
  const source = normalizeArticleMarkdown(content).replace(
    /```[\s\S]*?```|~~~[\s\S]*?~~~/g,
    "",
  );
  const expression = /^(#{1,6})\s+(.+)$|<h([1-6])\b[^>]*>([\s\S]*?)<\/h\3>/gm;
  return Array.from(source.matchAll(expression), (match) => {
    const title = articleText(match[2] ?? match[4]);
    const base = headingSlug(title);
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    return {
      title,
      url: `#${base}${count ? `-${count}` : ""}`,
      depth: Math.max(2, match[1]?.length || Number(match[3])),
    };
  }).filter((heading) => heading.depth <= 3);
}
