import {
  articleHeadings,
  articleText,
  normalizeArticleMarkdown,
} from "../article-content";

describe("article compatibility", () => {
  it("converts pasted HTML callouts into parseable Markdown without changing code examples", () => {
    const input =
      "<aside> **Introducing TrueMemory**\n\nRead [the source](https://example.com).\n</aside>\n\n```html\n<aside>example</aside>\n```";
    const normalized = normalizeArticleMarkdown(input);
    expect(normalized).toContain("> **Introducing TrueMemory**");
    expect(normalized).toContain("> Read [the source](https://example.com).");
    expect(normalized).toContain("```html\n<aside>example</aside>\n```");
  });
  it("provides unique Unicode heading anchors for both formats", () => {
    expect(
      articleHeadings(
        "## Hello **world**\n\n## Hello world\n```\n## Ignore\n```",
      ),
    ).toEqual([
      { title: "Hello world", url: "#hello-world", depth: 2 },
      { title: "Hello world", url: "#hello-world-1", depth: 2 },
    ]);
    expect(
      articleHeadings("<h2>Hello <strong>world</strong></h2><h3>नमस्ते</h3>"),
    ).toEqual([
      { title: "Hello world", url: "#hello-world", depth: 2 },
      { title: "नमस्ते", url: "#नमस्ते", depth: 3 },
    ]);
  });
  it("counts readable text rather than HTML attributes", () => {
    expect(
      articleText(
        '<p>Hello <strong>world</strong> &amp; friends.</p><img src="/image.png" width="600">',
      ),
    ).toBe("Hello world & friends.");
  });
});
