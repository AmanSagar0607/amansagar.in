import type { Metadata } from "next";
export function journeyMetadata(
  title: string,
  description: string,
  path: string,
  indexable = true,
  keywords: string[] = [],
): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    robots: { index: indexable, follow: true },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}
