import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JFK Arena',
  description: 'JFK RAG Battle Arena',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
          <Navigation />
          <main className="py-8 px-4 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  )
}
