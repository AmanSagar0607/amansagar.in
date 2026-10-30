export type ContentKind =
  | "post"
  | "project"
  | "activity"
  | "track"
  | "challenge"
  | "achievement"
  | "settings";
export interface RevalidationTarget {
  path: string;
  type?: "page" | "layout";
}

/** Public routes that must be invalidated after a successful CMS commit. */
export function affectedPublicPaths(
  kind: ContentKind,
  identifier: string,
): RevalidationTarget[] {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(identifier))
    throw new Error("Invalid content identifier");
  const targets: RevalidationTarget[] = [
    { path: "/" },
    { path: "/sitemap.xml" },
    { path: "/journey" },
    { path: "/achievements" },
  ];
  if (kind === "settings")
    targets.push({ path: "/", type: "layout" }, { path: "/contact" });
  if (kind === "post")
    targets.push(
      { path: "/blog" },
      { path: `/blog/${identifier}` },
      { path: "/journey/[slug]", type: "page" },
      { path: "/journey/activity/[slug]", type: "page" },
      { path: "/projects/[slug]", type: "page" },
    );
  if (kind === "project")
    targets.push(
      { path: "/projects" },
      { path: `/projects/${identifier}` },
      { path: "/journey/[slug]", type: "page" },
      { path: "/journey/activity/[slug]", type: "page" },
      { path: "/blog/[slug]", type: "page" },
    );
  if (kind === "activity" || kind === "track")
    targets.push(
      {
        path:
          kind === "activity"
            ? `/journey/activity/${identifier}`
            : `/journey/${identifier}`,
      },
      { path: "/journey/[slug]", type: "page" },
      { path: "/journey/activity/[slug]", type: "page" },
      { path: "/projects/[slug]", type: "page" },
      { path: "/blog/[slug]", type: "page" },
    );
  return targets.filter(
    (target, index) =>
      targets.findIndex(
        (other) => other.path === target.path && other.type === target.type,
      ) === index,
  );
}
