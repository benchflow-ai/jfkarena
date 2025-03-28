import Header from '@/components/Header'
import Leaderboard from '@/features/leaderboard/Leaderboard'
import { Suspense } from 'react'

export default function LeaderboardPage() {
  return (
    <div className="container py-10">
      <div className="mt-16">
        <Header />
        <div className="mt-8">
          <Suspense fallback={(
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
          >
            <Leaderboard />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
