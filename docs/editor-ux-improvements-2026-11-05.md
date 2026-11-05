# Editor usability improvements — 2026-11-05

## Changes

- Made the article image action visible by name in the formatting toolbar.
- Added a short instruction near the article canvas showing the cursor, right-click, and keyboard shortcut workflows.
- Kept image insertion and editing contextual to the current cursor or selected image, with image controls in an accessible dialog.
- Added live character counts to the post title and description fields.
- Removed the duplicate version and last-edited status line in the post editor.

## Checks

- `npm run typecheck` passed.
- Targeted ESLint check passed for the changed editor and context-menu components.
- Tests were not run.

## Suggested next usability improvements

1. Add draft autosave with a clear “Saving”, “Saved”, and “Offline” state, plus an undoable restore action.
2. Generate the post slug from the title by default while keeping manual editing available.
3. Add a search-result preview for SEO title and description with length guidance.
4. Extend the contextual menu with common writing actions such as headings, links, and code blocks, based on the current selection.
