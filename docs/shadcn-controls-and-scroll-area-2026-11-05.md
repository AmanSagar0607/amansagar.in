# shadcn controls and responsive scroll regions — 2026-11-05

## Checkbox alignment fix

The shared text `Input` component applied `h-10 w-full` to checkbox fields. Each checkbox therefore stretched across its grid cell and pushed its label out of alignment. A dedicated Radix-backed shadcn `Checkbox` now provides a consistent 16px control, and the shared `Input` also uses size-appropriate styles when used for checkbox or radio inputs.

Related track and project options now use compact, wrapping rows with bounded shadcn scroll areas. The project editor's duplicate “Pin to homepage” control was removed.

## Component audit

- Application form fields now use the shared shadcn Input, Select, Textarea, and Checkbox components, including the journey editor and contact form.
- Application buttons now use the shared shadcn Button component.
- Long application scroll regions use shadcn ScrollArea, including the admin navigation, media picker, article image settings, content tables, settings tabs, SEO proposal, table of contents, contribution graph, code blocks, and related-item lists.
- Radix-backed command and dropdown menu primitives retain their internal overflow handling for keyboard navigation and viewport positioning.

## Verification

- `npm run typecheck` passed.
- `npm run lint` passed with four existing warnings: two raw image warnings and two unused test-helper parameter warnings.
- Tests were not run.
