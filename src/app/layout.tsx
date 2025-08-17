import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Video Generator",
  description: "Generate stunning videos from text prompts using advanced AI technology",
  keywords: ["AI", "video generation", "text to video", "artificial intelligence"],
  authors: [{ name: "AI Video Generator" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "AI Video Generator",
    description: "Generate stunning videos from text prompts using advanced AI technology",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Video Generator",
    description: "Generate stunning videos from text prompts using advanced AI technology",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800`}>
        <div className="relative min-h-screen">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <a className="mr-6 flex items-center space-x-2" href="/">
                  <div className="h-6 w-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                  <span className="hidden font-bold sm:inline-block">
                    AI Video Generator
                  </span>
                </a>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t py-6 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
              <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Built with Next.js and AI technology. Generate amazing videos from text.
                </p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  )
}