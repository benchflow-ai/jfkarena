'use client'

import type { VoteResult } from './types'
import Header from '@/components/Header'
import { useAction } from 'next-safe-action/hooks'
import { useEffect } from 'react'
import { voteAction } from '../leaderboard/_actions/voteAction'
import { BattleForm } from './BattleForm'
import { BattleResponses } from './BattleResponses'
import { useBattle } from './hooks/useBattle'
import { useModels } from './hooks/useModels'
import { ResultsCard } from './ResultsCard'
import { VotingSection } from './VotingSection'

export function Battle() {
  const { models, error: authError } = useModels()
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
  const { executeAsync: vote, hasSucceeded, reset } = useAction(voteAction)

  const voted = !!hasSucceeded

  useEffect(() => {
    if (battleId === null) {
      reset()
    }
  }, [battleId, reset])

  const handleVote = async (result: VoteResult) => {
    if (!battleId || !question || !selectedModels || !selectedModels.model1 || !selectedModels.model2)
      return

    await vote({ result, model1: selectedModels.model1.id, model2: selectedModels.model2.id, battleId })
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
