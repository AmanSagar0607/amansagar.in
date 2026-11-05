# Blog article image and navigation improvements

- Blog cover art uses a responsive 16:9 frame with `object-contain`, so diagrams and screenshots remain fully visible.
- MDX inline images keep their natural aspect ratio and author-provided dimensions, alignment, and classes while staying within the article width.
- The desktop article table of contents uses LineNav markers with a spring animated preview card on hover and active-section tracking while scrolling.
- The mobile article table of contents uses a compact shadcn popover with the same LineNav links; selecting a section closes the popover.
- TOC links smoothly scroll to the heading, update the URL hash, and keep keyboard semantics. Active headings are announced with `aria-current="location"`.
- Both navigation layouts use a bounded shadcn ScrollArea when the section list is long.
