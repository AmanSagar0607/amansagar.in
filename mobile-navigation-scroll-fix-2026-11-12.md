# Mobile Navigation Expansion and Scrolling

The mobile navigation menu calculated its height from a fixed 40-pixel row estimate. The rendered rows, spacing, and toggle control took more room, so the bottom of the collapsed menu could clip the View more control. When expanded, the toggle also scrolled away with the links.

The menu now reserves the View more/View less control in a fixed footer and lets the link list scroll independently. Its height adapts to the visible link count and viewport, while the expanded list stays within the screen and remains reachable by scrolling.
