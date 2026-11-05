# Navigation and public page visibility

## Navigation manager

- Admin → Settings → Navigation controls each link's label, URL, order, desktop placement (Primary or More), and whether it opens in a new tab.
- Desktop visibility applies at widths of 1280px and above. Tablet visibility applies from 640px through 1279px; mobile visibility applies below 640px. Tablet and mobile links are rendered in the dock menu.
- Internal site paths, homepage anchors, HTTPS links, and email links are supported. Unsafe schemes are rejected by settings validation.
- Published custom pages with “Show in More navigation” enabled are added automatically. A manually configured link to that page takes precedence so its device settings can be customized.

## Page visibility

- Admin → Pages controls visibility for Home, About, Projects, Blog, Journey, Achievements, and Contact.
- Hiding a section removes it from navigation and the sitemap and makes its route return not found. Hiding Projects, Blog, or Journey also hides that section's detail routes and suppresses its public data feeds.
- Individual posts, projects, journey entries, tracks, and custom pages can be made private in their own editors.
- Navigation and page visibility are stored in the existing CMS settings snapshot; no database migration is required.
