'use client'

import Header from '@/components/Header'
import { BattleForm } from './BattleForm'
import { BattleResponses } from './BattleResponses'
import { useAuth } from './hooks/useAuth'
import { useBattle } from './hooks/useBattle'
import { useVoting } from './hooks/useVoting'
import { ResultsCard } from './ResultsCard'
import { VotingSection } from './VotingSection'
import { useAction } from "next-safe-action/hooks";
import { voteAction } from '../leaderboard/actions/voteAction'
import type { VoteResult } from './types'

export function Battle() {
  const { models, error: authError } = useAuth()
  const {
    question,
    responses,
    loading,
    isFlipped,
    battleId,
    selectedModels,
    error: battleError,
    handleSubmit,
  } = useBattle({ models })
  const { executeAsync: vote, result: voteResult } = useAction(voteAction)

  const voted = !!voteResult

  const handleVote = async (result: VoteResult) => {
    if (!battleId || !question || !selectedModels || !selectedModels.model1 || !selectedModels.model2)
      return

    await vote({ result: result === 'model1' ? 'model1' : 'model2', model1: selectedModels.model1.id, model2: selectedModels.model2.id, battleId, question })
  }

  const error = authError || battleError

  return (
    <div className="container py-10">
      <Header />
      <div className="mt-8 space-y-6 max-w-3xl mx-auto">
        {error && (
          <div className="text-destructive text-center p-4">
            Error:
            {' '}
            {error}
          </div>
        )}

        <BattleForm onSubmit={handleSubmit} loading={loading} />

        <BattleResponses
          responses={responses}
          voted={voted}
          isFlipped={isFlipped}
          selectedModels={selectedModels}
        />

        <VotingSection
          responses={responses}
          voted={voted}
          onVote={handleVote}
        />

        <ResultsCard
          voted={voted}
          isFlipped={isFlipped}
          selectedModels={selectedModels}
        />
      </div>
    </div>
  )
}
