import type { TransactionType } from '@/db'
import type { Model } from '../types'
import { DEFAULT_ELO } from '@/constants'
import { db } from '@/db'
import { battles } from '@/db/schema/battles'
import { models } from '@/db/schema/models'
import { and, eq, sql } from 'drizzle-orm'

const K_FACTOR = 32

// Calculate new ELO ratings for both models
export function calculateEloChange({ model1, model2, model1Won }: {
  model1: Model
  model2: Model
  model1Won: boolean
}) {
  if (!model1.modelId || !model2.modelId) {
    throw new Error('Invalid model data')
  }

  const elo1 = model1.elo ?? DEFAULT_ELO
  const elo2 = model2.elo ?? DEFAULT_ELO

  const r1 = 10 ** (elo1 / 400)
  const r2 = 10 ** (elo2 / 400)
  const e1 = r1 / (r1 + r2)
  const e2 = r2 / (r1 + r2)

  const score1 = model1Won ? 1 : 0
  const score2 = model1Won ? 0 : 1

  return {
    newElo1: elo1 + K_FACTOR * (score1 - e1),
    newElo2: elo2 + K_FACTOR * (score2 - e2),
  }
}

// Update battle record
export async function updateBattleRecord({ battleId, userId, result, model1Id, model2Id }: {
  battleId: number
  userId: string
  result: string
  model1Id: string
  model2Id: string
}) {
  let battleResult = null
  let winnerId = null

  if (result === 'model1') {
    winnerId = model1Id
    battleResult = 'model1_win'
  }
  else if (result === 'model2') {
    winnerId = model2Id
    battleResult = 'model2_win'
  }
  else if (result === 'draw') {
    battleResult = 'draw'
  }
  else {
    battleResult = 'invalid'
  }

  const winnerModel = await db.query.models.findFirst({
    where: (models, { eq, and, isNull }) => and(
      eq(models.modelId, winnerId || ''),
      isNull(models.userId),
    ),
  })

  await db.update(battles)
    .set({
      userId,
      winnerId: winnerModel?.id,
      result: battleResult,
      votedAt: new Date().toISOString(),
    })
    .where(eq(battles.id, battleId))

  return battleResult
}

// Update model statistics based on battle result
export async function updateModelStats({ tx, winner, model1Id, model2Id, userId }: {
  tx: TransactionType
  winner: string
  model1Id: string
  model2Id: string
  userId?: string
}) {
  const whereClause = (modelId: string) => {
    const conditions = [eq(models.modelId, modelId)]
    if (userId) {
      conditions.push(eq(models.userId, userId))
    }
    return conditions.length > 1 ? and(...conditions) : conditions[0]
  }

  if (winner === 'model1') {
    await Promise.all([
      tx.update(models)
        .set({ wins: sql`${models.wins} + 1` })
        .where(whereClause(model1Id)),
      tx.update(models)
        .set({ losses: sql`${models.losses} + 1` })
        .where(whereClause(model2Id)),
    ])
  }
  else if (winner === 'model2') {
    await Promise.all([
      tx.update(models)
        .set({ wins: sql`${models.wins} + 1` })
        .where(whereClause(model2Id)),
      tx.update(models)
        .set({ losses: sql`${models.losses} + 1` })
        .where(whereClause(model1Id)),
    ])
  }
  else if (winner === 'draw') {
    await Promise.all([
      tx.update(models)
        .set({ draws: sql`${models.draws} + 1` })
        .where(whereClause(model1Id)),
      tx.update(models)
        .set({ draws: sql`${models.draws} + 1` })
        .where(whereClause(model2Id)),
    ])
  }
  else {
    await Promise.all([
      tx.update(models)
        .set({ invalid: sql`${models.invalid} + 1` })
        .where(whereClause(model1Id)),
      tx.update(models)
        .set({ invalid: sql`${models.invalid} + 1` })
        .where(whereClause(model2Id)),
    ])
  }
}

// Update ELO ratings for both models
export async function updateEloRatings({ tx, model1Id, model2Id, newElo1, newElo2, userId }: {
  tx: TransactionType
  model1Id: string
  model2Id: string
  newElo1: number
  newElo2: number
  userId?: string
}) {
  const whereClause = (modelId: string) => {
    const conditions = [eq(models.modelId, modelId)]
    if (userId) {
      conditions.push(eq(models.userId, userId))
    }
    return conditions.length > 1 ? and(...conditions) : conditions[0]
  }

  await Promise.all([
    tx.update(models)
      .set({ elo: newElo1 })
      .where(whereClause(model1Id)),
    tx.update(models)
      .set({ elo: newElo2 })
      .where(whereClause(model2Id)),
  ])
}
