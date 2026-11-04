// Run with Node 22+: node scripts/test-article-renderer.cjs
// Exercise the real ESM Markdown pipeline, which Jest's CommonJS runner cannot load.
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const assert = require("node:assert/strict");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { JSDOM } = require("jsdom");
const root = path.resolve(__dirname, "..");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return resolve.call(
    this,
    name.startsWith("@/") ? path.join(root, "src", name.slice(2)) : name,
    ...args,
  );
};
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        target: ts.ScriptTarget.ES2022,
      },
    });
    module._compile(result.outputText, filename);
  };
}
const {
  ActivityMarkdown,
} = require("../src/components/journey/activity-markdown.tsx");
const render = (content) =>
  renderToStaticMarkup(React.createElement(ActivityMarkdown, { content }));
const markdown =
  "## Context\n\n<aside> **Introducing TrueMemory**\n\nRead [the source](https://example.com).\n</aside>\n\n| Feature | Status |\n| --- | --- |\n| Memory | Available |";
const legacy = new JSDOM(render(markdown)).window.document;
assert.equal(
  legacy.querySelector("blockquote strong").textContent,
  "Introducing TrueMemory",
);
assert.equal(legacy.querySelector("blockquote a").href, "https://example.com/");
assert.equal(legacy.querySelectorAll("table tbody tr").length, 1);
assert.equal(legacy.querySelector("h2").id, "context");
const html =
  '<h2>Reference</h2><p data-align="right">Aligned</p><img src="/example.png" alt="Diagram" width="600" height="300" data-align="right" data-caption="Source: project docs"><h2>Reference</h2><script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(1)"><a href="javascript:alert(1)">unsafe</a><iframe src="https://example.com"></iframe>';
const safe = new JSDOM(render(html)).window.document;
assert.deepEqual(
  [...safe.querySelectorAll("h2")].map((h) => h.id),
  ["reference", "reference-1"],
);
assert.equal(safe.querySelector("p").dataset.align, "right");
assert.equal(safe.querySelector("img").width, 600);
assert.equal(safe.querySelector("img").height, 300);
assert.equal(safe.querySelector(".article-image").dataset.align, "right");
assert.equal(
  safe.querySelector(".article-caption").textContent,
  "Source: project docs",
);
assert.equal(
  safe.querySelectorAll(
    'script, iframe, [onerror], [src^="javascript:"], [href^="javascript:"]',
  ).length,
  0,
);
assert.equal(
  render(html),
  render(html),
  "Heading IDs must be stable on repeated renders",
);
console.log(
  "Article renderer: legacy callouts, GFM tables, anchors, media properties and HTML sanitization passed.",
);
