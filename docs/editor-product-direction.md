# Product direction for a creator-friendly editor

## Recommended foundation

Keep Tiptap as the headless editing engine and use the open-source Simple Editor as the design and extension reference. Tiptap documents the Simple template and included open-source components as MIT licensed; that makes it the lowest-friction base for a product intended to become your own editor. Keep the UI in this repository's shadcn design system and adapt the interaction patterns rather than importing a second visual system wholesale.

Tiptap recommends persisting JSON for editor state because it is structured, easier to parse, and easier to edit programmatically than HTML. For a product, store a schema version with each document and render/export HTML or Markdown from that canonical state. Existing portfolio posts use HTML/Markdown strings, so migrating this app should be a separate, backward-compatible project rather than an incidental toolbar change.

## Implemented in this pass

- Removed the cursor-following image button.
- Reworked the formatting controls into one compact, grouped toolbar. On narrow screens the formatting groups scroll horizontally while Image and Add remain visible.
- Centered the writing canvas at a comfortable reading width and retained contextual right-click and keyboard image actions.

## Product patterns to adopt

- **Simple Editor as the default:** a stable compact toolbar, responsive writing canvas, undo/redo, image and link controls, and search/replace.
- **Notion-like interactions selectively:** slash commands, right-click/block actions, drag-to-reorder, and contextual formatting. Build these on open-source extensions first; Tiptap's Notion-like template requires a Start plan for production and is subject to its Terms of Service and Pro License.
- **Developer and creator workflow:** Markdown import/export, code blocks, tables, image alt text/captions/alignment, source references, word count/read time, and an SEO checklist kept outside the writing canvas.
- **AI assistance with editorial control:** suggestions should appear as a reviewable change or replacement preview; never overwrite a document or publish without the author's action.
- **Reliability before collaboration:** autosave status, recoverable drafts, version history, accessible keyboard navigation, mobile toolbars, and schema migrations should precede real-time collaboration.

## Paid template boundary

The Tiptap DOCX Editor template uses Pro extensions and requires a Team plan for production according to Tiptap's current docs. The Notion-like template requires a Start plan. Treat those as optional product integrations that need subscription and licensing review before copying them into a commercial launch.

## Official references

- [Tiptap Simple Editor template and MIT license](https://tiptap.dev/docs/ui-components/templates/simple-editor)
- [Tiptap UI component licensing](https://tiptap.dev/docs/ui-components/getting-started/overview)
- [Tiptap Notion-like editor and production plan requirements](https://tiptap.dev/docs/ui-components/templates/notion-like-editor)
- [Tiptap DOCX editor and Team plan requirements](https://tiptap.dev/docs/ui-components/templates/docx-editor)
- [Tiptap persistence guidance](https://tiptap.dev/docs/editor/core-concepts/persistence)
