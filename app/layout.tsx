import type { Metadata } from 'next'
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import PublicLayoutWrapper from "@/components/public-layout-wrapper"
import './globals.css'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Alkaff',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.className} rtl`}>
        <Providers>
          <PublicLayoutWrapper>
            {children}
          </PublicLayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
