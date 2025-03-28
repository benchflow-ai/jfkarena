import type { TransactionType } from '@/db'
import type { Model } from '../types'
import { DEFAULT_ELO } from '@/constants'
import { db } from '@/db'
import { models } from '@/db/schema/models'
import { and, eq, sql } from 'drizzle-orm'

const K_FACTOR = 32

// Calculate new ELO ratings for both models
function calculateEloChange({ model1, model2, model1Won }: {
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

// Update model statistics based on battle result
async function updateModelStats({ tx, winner, model1Id, model2Id, userId }: {
  tx: TransactionType
  winner: string
  model1Id: string
  model2Id: string
  userId: string
}) {
  if (winner === 'model1') {
    await Promise.all([
      tx.update(models)
        .set({ wins: sql`${models.wins} + 1` })
        .where(and(
          eq(models.modelId, model1Id),
          eq(models.userId, userId),
        )),
      tx.update(models)
        .set({ losses: sql`${models.losses} + 1` })
        .where(and(
          eq(models.modelId, model2Id),
          eq(models.userId, userId),
        )),
    ])
  }
  else if (winner === 'model2') {
    await Promise.all([
      tx.update(models)
        .set({ wins: sql`${models.wins} + 1` })
        .where(and(
          eq(models.modelId, model2Id),
          eq(models.userId, userId),
        )),
      tx.update(models)
        .set({ losses: sql`${models.losses} + 1` })
        .where(and(
          eq(models.modelId, model1Id),
          eq(models.userId, userId),
        )),
    ])
  }
  else if (winner === 'draw') {
    await Promise.all([
      tx.update(models)
        .set({ draws: sql`${models.draws} + 1` })
        .where(and(
          eq(models.modelId, model1Id),
          eq(models.userId, userId),
        )),
      tx.update(models)
        .set({ draws: sql`${models.draws} + 1` })
        .where(and(
          eq(models.modelId, model2Id),
          eq(models.userId, userId),
        )),
    ])
  }
  else {
    await Promise.all([
      tx.update(models)
        .set({ invalid: sql`${models.invalid} + 1` })
        .where(and(
          eq(models.modelId, model1Id),
          eq(models.userId, userId),
        )),
      tx.update(models)
        .set({ invalid: sql`${models.invalid} + 1` })
        .where(and(
          eq(models.modelId, model2Id),
          eq(models.userId, userId),
        )),
    ])
  }
}

// Update ELO ratings for both models
async function updateEloRatings({ tx, model1Id, model2Id, newElo1, newElo2, userId }: {
  tx: TransactionType
  model1Id: string
  model2Id: string
  newElo1: number
  newElo2: number
  userId: string
}) {
  await Promise.all([
    tx.update(models)
      .set({ elo: newElo1 })
      .where(and(
        eq(models.modelId, model1Id),
        eq(models.userId, userId),
      )),
    tx.update(models)
      .set({ elo: newElo2 })
      .where(and(
        eq(models.modelId, model2Id),
        eq(models.userId, userId),
      )),
  ])
}

// Fetch both global and personal models
async function fetchModels({ tx, userId, model1Id, model2Id }: {
  tx: TransactionType
  userId: string
  model1Id: string
  model2Id: string
}) {
  const allModelData = await tx.query.models.findMany({
    where: (models, { or, and, isNull }) => or(
      and(
        eq(models.modelId, model1Id),
        isNull(models.userId),
      ),
      and(
        eq(models.modelId, model2Id),
        isNull(models.userId),
      ),
      and(
        eq(models.userId, userId),
        or(
          eq(models.modelId, model1Id),
          eq(models.modelId, model2Id),
        ),
      ),
    ),
  })

  // Separate global and personal models
  const rawModel1Data = allModelData.find(m => m.modelId === model1Id && m.userId === null)
  const rawModel2Data = allModelData.find(m => m.modelId === model2Id && m.userId === null)
  const personalModel1Data = allModelData.find(m => m.modelId === model1Id && m.userId === userId)
  const personalModel2Data = allModelData.find(m => m.modelId === model2Id && m.userId === userId)

  if (!rawModel1Data || !rawModel2Data) {
    throw new Error('Model not found')
  }

  return {
    rawModel1Data,
    rawModel2Data,
    personalModel1Data,
    personalModel2Data,
  }
}

// Create personal models if they don't exist
async function ensurePersonalModels({ tx, userId, rawModel1Data, rawModel2Data, personalModel1Data, personalModel2Data }: {
  tx: TransactionType
  userId: string
  rawModel1Data: Model
  rawModel2Data: Model
  personalModel1Data: Model | undefined
  personalModel2Data: Model | undefined
}) {
  const missingModels = []

  if (!personalModel1Data) {
    missingModels.push({
      modelId: rawModel1Data.modelId,
      userId,
      name: rawModel1Data.name,
      wins: 0,
      losses: 0,
      draws: 0,
      invalid: 0,
      elo: DEFAULT_ELO,
    })
  }

  if (!personalModel2Data) {
    missingModels.push({
      modelId: rawModel2Data.modelId,
      userId,
      name: rawModel2Data.name,
      wins: 0,
      losses: 0,
      draws: 0,
      invalid: 0,
      elo: DEFAULT_ELO,
    })
  }

  if (missingModels.length === 0) {
    return {
      model1Personal: personalModel1Data,
      model2Personal: personalModel2Data,
    }
  }

  const insertedModels = await tx.insert(models)
    .values(missingModels)
    .returning()

  return {
    model1Personal: personalModel1Data ?? insertedModels.find(m => m.modelId === rawModel1Data.modelId),
    model2Personal: personalModel2Data ?? insertedModels.find(m => m.modelId === rawModel2Data.modelId),
  }
}

export async function updatePersonalLeaderboard({ userId, result, model1, model2 }: {
  userId: string
  result: string
  model1: string
  model2: string
}) {
  try {
    return await db.transaction(async (tx) => {
      // Get both global and personal models
      const { rawModel1Data, rawModel2Data, personalModel1Data, personalModel2Data }
        = await fetchModels({ tx, userId, model1Id: model1, model2Id: model2 })

      // Ensure personal models exist
      const { model1Personal, model2Personal }
        = await ensurePersonalModels({
          tx,
          userId,
          rawModel1Data,
          rawModel2Data,
          personalModel1Data,
          personalModel2Data,
        })

      if (!model1Personal || !model2Personal) {
        throw new Error('Failed to create personal models')
      }

      // Update personal model statistics
      await updateModelStats({
        tx,
        winner: result,
        model1Id: model1Personal.modelId!,
        model2Id: model2Personal.modelId!,
        userId,
      })

      // Update personal ELO ratings if there's a winner
      if (result === 'model1' || result === 'model2') {
        const model1Won = result === 'model1'
        const { newElo1, newElo2 } = calculateEloChange({
          model1: model1Personal,
          model2: model2Personal,
          model1Won,
        })
        await updateEloRatings({
          tx,
          model1Id: model1Personal.modelId!,
          model2Id: model2Personal.modelId!,
          newElo1,
          newElo2,
          userId,
        })
      }

      return { status: 'success' }
    })
  }
  catch (error) {
    console.error('Error in vote action:', error)
    throw error
  }
}
