# Article table context actions

Right-clicking inside a table in the article editor now shows commands for inserting a row above or below the selected cell, inserting a column to the left or right, deleting the selected row or column, and deleting the full table. Existing table toolbar actions remain available.

The context menu uses the current ProseMirror cell selection so each action applies to the table under the pointer.

## Verification

- `npm run typecheck` passed.
- Targeted ESLint check passed for the rich article editor.
- Tests were not run.
