# Article editor

The Studio post editor writes rich text into the existing post content field. No database migration is required. Older Markdown posts remain supported; legacy `<aside>` callouts render as quotes with their inner Markdown formatted. CMS content is sanitized and never executed as MDX.

## Writing and images

Open a post in Studio. Use the Article canvas to write, format headings, add links, lists, quotes, code blocks and tables. Use **Source / import** to paste a Markdown article or supported HTML, then **Apply source**. Apply or cancel a changed source before saving.

Choose **Insert image** in the formatting toolbar. Select an existing library image or upload one, enter alternative text and an optional caption/reference, then set width, height and alignment. Select an image in the canvas to update or remove it. Images fit within the article on mobile. Upload limits and accepted formats remain those of the existing media library (JPEG, PNG, WebP, GIF and AVIF; maximum 4 MB).

Use **Preview** to check the same sanitized rendering used by the public article. **Save post** retains the existing status, visibility and publication-date behavior. A public post with Published status and an eligible date becomes visible when saved. There is no automatic save.

Supported rich content includes paragraphs, headings, emphasis, links, lists, quotes, code, tables and images. Custom embeds, scripts, arbitrary CSS and MDX components are not supported. Keep a source copy when importing complex HTML. Existing content is not rewritten merely by opening a post; the editor serializes supported content after an edit.

## Search and AI readers

The sidebar checks title and description lengths, section headings, image alternatives and the social cover. It also previews the search title/description and shows word count and reading time. Metadata fields remain under **Metadata and related work**.

Public pages include canonical URLs, Open Graph/Twitter metadata and TechArticle structured data. Rich articles use semantic HTML, stable heading anchors, image alternative text and captions. These features help readers and crawlers interpret the article; they do not guarantee search rankings or inclusion in AI answers.

## Optional writing assistant

Set these server environment variables on the deployment and redeploy:

```dotenv
OPENAI_API_KEY=your-server-api-key
ARTICLE_AI_MODEL=your-responses-api-model-id
```

Choose a [Responses API](https://developers.openai.com/api/docs/guides/text) model available to your OpenAI account. Neither variable uses the `NEXT_PUBLIC_` prefix. Without both variables, the editor works and the assistant explains that it needs configuration.

Generating a suggestion sends the article, title and any custom instructions to OpenAI. Available actions improve clarity, create an outline, suggest SEO metadata, or follow a custom editing instruction. Requests require the existing admin session and same-origin protection. The endpoint does not save posts, browse references or publish articles.

Review the proposal before applying it. Applying changes only the current editor draft; saving remains explicit. A proposal based on an older title or article cannot overwrite newer edits. Incomplete model responses are rejected. Review claims and references yourself; the assistant does not verify sources.

## Verification

```bash
npm run typecheck
npm run lint
npm test
node scripts/test-article-renderer.cjs
npm run build
```

The renderer check requires Node 22 or newer and exercises the actual Markdown/HTML pipeline, including legacy callouts, tables, stable anchors, image properties and sanitization.
