'use client'

import { useSession } from '@/features/auth/use-session'
import { authClient } from '@/lib/auth/authClient'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session, isPending } = useSession()

  return (
    <nav className="fixed top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm">
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
          {!isPending && (
            <>
              {session?.user.id
                ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Avatar className="size-6">
                          <AvatarImage src={session.user.image ?? undefined} />
                          <AvatarFallback>
                            {session.user.name?.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background">
                        <DropdownMenuLabel className="text-sm font-normal">{session.user.email}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Button variant="ghost" onClick={() => authClient.signOut()}>Logout</Button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                : (
                    <Button asChild size="sm">
                      <Link href="/login">Login</Link>
                    </Button>
                  )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
