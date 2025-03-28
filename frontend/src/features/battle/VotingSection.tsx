'use client'

import type { BattleResponse, VoteResult } from './types'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface VotingSectionProps {
  responses: BattleResponse | null
  voted: boolean
  onVote: (result: VoteResult) => void
}

export function VotingSection({ responses, voted, onVote }: VotingSectionProps) {
  const [selectedVote, setSelectedVote] = useState<VoteResult | null>(null)

  if (!responses || voted)
    return null

  const handleVote = (result: VoteResult) => {
    setSelectedVote(result)
    onVote(result)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote('model1')}
        disabled={voted || selectedVote !== null}
        className="text-xs"
      >
        Model A Wins
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote('model2')}
        disabled={voted || selectedVote !== null}
        className="text-xs"
      >
        Model B Wins
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote('draw')}
        disabled={voted || selectedVote !== null}
        className="text-xs"
      >
        Draw
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote('invalid')}
        disabled={voted || selectedVote !== null}
        className="text-xs"
      >
        Invalid
      </Button>
    </div>
  )
}
