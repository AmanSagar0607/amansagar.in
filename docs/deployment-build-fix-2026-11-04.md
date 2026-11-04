# Production build fix — 2026-11-04

## Incident

The Vercel build for commit `a560e3299ce66ef4fdded2c2ed6ed6592f4664be` failed during TypeScript validation. `src/types/project.ts` declared `pinned?: boolean` twice on the `Project` interface, producing a duplicate identifier error.

## Resolution

The duplicate declaration was removed. The corrected source was included in commit `2e75b71622f751cc3feef33456672a904194d739` (`feat(admin): add media management and technology tooling`) and pushed to `main`.

## Deployment status

Vercel reports the production deployment for `2e75b71622f751cc3feef33456672a904194d739` as `READY`. The failed deployment corresponds to the earlier commit and does not reflect the current production build.

The unused-import and image optimization messages in the supplied log were lint warnings; the duplicate `pinned` declaration was the build-stopping error.
