import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css"

// Using Inter as the primary font
const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: "#000000", 
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Aman Sagar - Full Stack Developer",
  description: "Personal portfolio of Aman Sagar, a Full Stack Developer with expertise in modern web technologies.",
  keywords: ["portfolio", "developer", "full stack", "web development", "react", "next.js"],
  authors: [{ name: 'Aman Sagar' }],
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans antialiased bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-200`}
      >
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          {/* Add your footer component here if you have one */}
        </div>
      </body>
    </html>
  );
}
