# Blog article image and navigation improvements

- Blog cover art uses a responsive 16:9 frame with `object-contain`, so diagrams and screenshots remain fully visible.
- MDX inline images keep their natural aspect ratio and author-provided dimensions, alignment, and classes while staying within the article width.
- The article table of contents uses the existing LineNav marker pattern. Active headings are announced with `aria-current="location"`; links retain keyboard semantics and smooth in-page navigation.
- The TOC remains in its existing desktop hover panel and uses a bounded shadcn ScrollArea to avoid page overflow.
