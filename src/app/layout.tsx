import type { Metadata, Viewport } from 'next'
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/navbar/footer";
import "./globals.css"
import { Toaster } from "sonner";
// Using Inter as the primary font
const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "Aman Sagar - Full Stack Developer",
  description: "Personal portfolio of Aman Sagar, a Full Stack Developer with expertise in modern web technologies.",
  keywords: ["portfolio", "developer", "full stack", "web development", "react", "next.js"],
  authors: [{ name: 'Aman Sagar' }]
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
          <Toaster position="top-center" richColors />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
