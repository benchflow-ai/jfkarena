import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import { PostHogProvider } from '@/components/PostHogProvider'
import { AnonymouseSessionProvider } from '@/features/auth/AnonymouseSessionProvider'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JFK Arena',
  description: 'JFK RAG Battle Arena',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚖️</text></svg>',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>
          <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
            <AnonymouseSessionProvider />
            <Navigation />
            <main>{children}</main>
            <Toaster />
          </div>
        </PostHogProvider>
      </body>
    </html>
  )
}
