'use client'

import Header from '@/components/Header'
import Leaderboard from '@/features/leaderboard/Leaderboard'

export default function LeaderboardPage() {
  return (
    <div className="container py-10">
      <div className="mt-16">
        <Header />
        <div className="mt-8">
          <Leaderboard />
        </div>
      </div>
    </div>
  )
}
