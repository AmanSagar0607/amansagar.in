import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/navbar/footer";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { MobileDock } from "@/components/mobile-dock";
import "./globals.css";

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
const siteTitle = "Aman Sagar";
const siteDescription =
  "Software Engineer from India building Context-OS, AI agents, RAG pipelines, retrieval systems, and GenAI product infrastructure.";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteTitle,
  title: {
    default: "Aman Sagar | Software Engineer building AI tools and products",
    template: "%s | Aman Sagar",
  },
  description: siteDescription,
  keywords: ["Aman Sagar", "Software Engineer India", "AI agents", "Context-OS", "RAG pipelines", "retrieval systems", "GenAI products"],
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
    title: "Aman Sagar | Software Engineer building AI tools and products",
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
    title: "Aman Sagar | Software Engineer building AI tools and products",
    description: siteDescription,
    creator: "@amansagar0607",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`app-body ${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="app-frame min-h-screen bg-background text-foreground">
            <Toaster position="top-center" richColors />
            <Navbar />
            <MobileDock />
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
