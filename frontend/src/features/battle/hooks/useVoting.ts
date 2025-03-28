import type { Model, VoteResult } from '../types'
import { useState } from 'react'

interface UseVotingProps {
  battleId: number | null
  question: string
  selectedModels: {
    model1: Model | null
    model2: Model | null
  }
  isFlipped: boolean
}

export function useVoting({ battleId, question, selectedModels, isFlipped }: UseVotingProps) {
  const [voted, setVoted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVote = async (result: VoteResult) => {
    if (voted || !selectedModels.model1 || !selectedModels.model2 || !battleId)
      return

    try {
      let actualResult = result
      if (isFlipped && (result === 'model1' || result === 'model2')) {
        actualResult = result === 'model1' ? 'model2' : 'model1'
      }

      const response = await fetch('/api/proxy/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          result: actualResult,
          model1: selectedModels.model1.id,
          model2: selectedModels.model2.id,
          battle_id: battleId,
          question,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit vote')
      }

      setVoted(true)
    }
    catch (error) {
      console.error('Error voting:', error)
      setError('Failed to submit vote')
    }
  }

  return {
    voted,
    error,
    handleVote,
  }
}
