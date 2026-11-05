# External link navigation

- The command menu receives the configured GitHub, X, and resume URLs from server-rendered site settings and opens external destinations directly in a browser tab.
- Mobile dock social shortcuts use the configured HTTPS destinations directly.
- Navigation items marked to open in a new tab use plain anchors, avoiding Next.js RSC prefetch for redirect routes.
- The `/resume` route responds with a no-store 307 redirect to the configured HTTPS resume URL for direct visits.
- The internal `/social/{platform}` redirect remains available for older links, while the site UI no longer uses it for external navigation.
