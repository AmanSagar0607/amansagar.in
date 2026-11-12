# Mobile and tablet dock layout

- Anchor the responsive navigation panel to the centered dock wrapper so its position follows the dock rather than the full viewport.
- Keep the dock at a bounded viewport width and prevent the fixed control buttons from shrinking.
- Give the shadcn ScrollArea a bounded height so longer menus scroll inside the panel instead of expanding the dock.
- Keep the overlay and dock in one positioning context and mark the expanded state for assistive technology.
- Show configured Primary links first; reveal More links with a shadcn Collapsible “View more” control and a reduced-motion-aware height transition.
- Resolve mobile versus tablet link visibility from the active viewport breakpoint before sizing the menu.
