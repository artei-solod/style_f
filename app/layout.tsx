import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientSessionProvider from "@/components/client-session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StyleAI - Your Personal AI Stylist",
  description:
    "Analyze your wardrobe, discover perfect outfits, and shop smarter with AI-powered style recommendations.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ClientSessionProvider>
      </body>
    </html>
  )
}
