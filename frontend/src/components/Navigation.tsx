'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl">⚔️</span>
            <span className="font-medium">JFK RAG Arena</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6">
            <Link
              href="/battle"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/battle'
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              Battle
            </Link>
            <Link
              href="/leaderboard"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/leaderboard'
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              Leaderboard
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  )
}
