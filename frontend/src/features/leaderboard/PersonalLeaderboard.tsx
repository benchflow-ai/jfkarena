'use client'

import { useSession } from '../auth/use-session'

export function PersonalLeaderboard() {
  const { data: session } = useSession()
  const isSignedIn = !!session?.user.id && !session.user.isAnonymous

  if (!isSignedIn) {
    return <div>Sign in to see your personal leaderboard</div>
  }
}
