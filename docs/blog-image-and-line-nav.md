# Blog article image and navigation improvements

- Blog cover art uses a responsive 16:9 frame with `object-contain`, so diagrams and screenshots remain fully visible.
- MDX inline images keep their natural aspect ratio and author-provided dimensions, alignment, and classes while staying within the article width.
- The desktop article table of contents keeps the compact LineNav tick rail, with a spring expansion on the hovered and active marker.
- The expanded desktop and mobile section lists show one truncated title per row. Long titles have a shadcn chevron button to reveal the full heading.
- The mobile table of contents uses a compact shadcn popover; selecting a section smoothly scrolls to its heading, updates the URL hash, and closes the popover.
- Both section lists use an explicitly sized, bounded shadcn ScrollArea so long lists scroll inside the card instead of expanding beyond it.
- Active headings are tracked during scrolling and announced with `aria-current="location"`.
