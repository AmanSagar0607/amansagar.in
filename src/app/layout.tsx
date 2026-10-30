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
  const { siteTitle, siteDescription } = await getPublicSiteSettings();
  return {
    metadataBase: new URL(siteUrl),
    applicationName: siteTitle,
    title: {
      default: `${siteTitle} | Software Engineer building AI tools and products`,
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
    authors: [{ name: "Aman Sagar", url: siteUrl }],
    creator: "Aman Sagar",
    publisher: "Aman Sagar",
    alternates: { canonical: "/" },
    icons: {
      icon: "/aman-favicon.ico",
      shortcut: "/aman-favicon.ico",
      apple: "/aman-avatar.webp",
    },
    openGraph: {
      title: `${siteTitle} | Software Engineer building AI tools and products`,
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
          alt: "Aman Sagar - Software Engineer building AI tools and products",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteTitle} | Software Engineer building AI tools and products`,
      description: siteDescription,
      creator: "@amansagar0607",
      images: ["/opengraph-image"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
              header={<Navbar />}
              dock={<MobileDock />}
              footer={<Footer />}
            >
              {children}
            </SiteChrome>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
