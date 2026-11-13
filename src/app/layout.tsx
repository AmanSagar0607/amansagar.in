import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/navbar/footer";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { MobileDock } from "@/components/mobile-dock";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";
import { getPublicSiteSettings } from "@/lib/public-site-settings";
import { getPublicPages } from "@/lib/public-pages";
import { defaultSiteSettings, type NavigationItem } from "@/lib/admin/site-settings";
import { isPagePathVisible } from "@/lib/public-page-visibility";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.amansagar.in";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle, siteDescription, profileRole, socialLinks } = await getPublicSiteSettings();
  const role = profileRole || "Software Engineer";
  const title = `${siteTitle} | ${role === "Software Engineer" ? "Software Engineer building AI tools and products" : role}`;
  const xHandle = socialLinks?.find((link) => link.label.toLowerCase() === "x")?.handle;
  return {
    metadataBase: new URL(siteUrl),
    applicationName: siteTitle,
    title: {
      default: title,
      template: `%s | ${siteTitle}`,
    },
    description: siteDescription,
    keywords: [
      "Aman Sagar",
      "Software Engineer India",
      "AI agents",
      "Context-OS",
      "RAG pipelines",
      "retrieval systems",
      "GenAI products",
    ],
    authors: [{ name: siteTitle, url: siteUrl }],
    creator: siteTitle,
    publisher: siteTitle,
    alternates: { canonical: "/" },
    icons: {
      icon: "/aman-favicon.ico",
      shortcut: "/aman-favicon.ico",
      apple: "/aman-avatar.webp",
    },
    openGraph: {
      title,
      description: siteDescription,
      url: siteUrl,
      siteName: siteTitle,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: siteDescription,
      ...(xHandle && /^@[A-Za-z0-9_]{1,15}$/.test(xHandle) ? { creator: xHandle } : {}),
      images: ["/opengraph-image"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPublicSiteSettings();
  const hiddenPages = settings.hiddenPages ?? [];
  const externalLinks = {
    github: settings.socialLinks?.find((link) => link.label.toLowerCase() === "github")?.href ?? "https://github.com/AmanSagar0607",
    x: settings.socialLinks?.find((link) => link.label.toLowerCase() === "x")?.href ?? "https://x.com/amansagar0607",
    resume: settings.resumeUrl ?? defaultSiteSettings.resumeUrl ?? "/resume",
  };
  const navigationItems = [
    ...(settings.navigationItems ?? defaultSiteSettings.navigationItems ?? []),
    ...(await getPublicPages())
      .filter((page) => page.showInNavigation && !(settings.navigationItems ?? []).some((item) => item.href === `/${page.slug}`))
      .map((page): NavigationItem => ({
        id: `page-${page.slug}`,
        label: page.navigationTitle?.trim() || page.title,
        href: `/${page.slug}`,
        placement: "more",
        desktop: true,
        tablet: true,
        mobile: true,
      })),
  ].map((item) => item.id === "resume"
    ? { ...item, href: externalLinks.resume, external: true }
    : item).filter((item) => isPagePathVisible(item.href, hiddenPages));
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`app-body ${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="app-frame bg-background text-foreground min-h-screen">
            <Toaster position="top-center" richColors />
            <SiteChrome
              header={<Navbar items={navigationItems} externalLinks={externalLinks} />}
              dock={<MobileDock items={navigationItems} externalLinks={externalLinks} />}
              footer={<Footer />}
            >
              {children}
            </SiteChrome>
          </div>
        </ThemeProvider>
      
<script data-crease-install dangerouslySetInnerHTML={{ __html: "window.addEventListener('crease:consent', function () { var s = document.createElement('script'); s.src = \"https://crease-bice.vercel.app/crease.js\"; s.onload = function () { if (window.crease) window.crease.init({ projectId: \"752c8641-2616-4a38-88f3-2dade631f6d3\", endpoint: \"https://crease-bice.vercel.app/api/events\" }); }; document.head.appendChild(s); }, { once: true });" }} />
</body>
    </html>
  );
}
