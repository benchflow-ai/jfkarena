import type { BattleResponse, VoteResult } from './types'
import { Button } from '@/components/ui/button'

interface VotingSectionProps {
  responses: BattleResponse | null
  voted: boolean
  onVote: (result: VoteResult) => void
}

export function VotingSection({ responses, voted, onVote }: VotingSectionProps) {
  if (!responses || voted)
    return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onVote('model1')}
        disabled={voted}
        className="text-xs"
      >
        Model A Wins
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onVote('model2')}
        disabled={voted}
        className="text-xs"
      >
        Model B Wins
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onVote('draw')}
        disabled={voted}
        className="text-xs"
      >
        Draw
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onVote('invalid')}
        disabled={voted}
        className="text-xs"
      >
        Invalid
      </Button>
    </div>
  )
}
