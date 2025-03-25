'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end h-16">
          <div className="flex items-center gap-6 pr-16">
            <Link
              href="/battle"
              className={`flex items-center gap-2 ${pathname === '/battle' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-500`}
            >
              <span className="text-2xl">⚔️</span>
              <span>Battle</span>
            </Link>
            <Link
              href="/leaderboard"
              className={`flex items-center gap-2 ${pathname === '/leaderboard' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-500`}
            >
              <span className="text-2xl">🏆</span>
              <span>Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 