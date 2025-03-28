import { DEFAULT_ELO } from '@/constants'
import { db } from '@/db'
import { battles } from '@/db/schema/battles'
import { models } from '@/db/schema/models'
import { eq, sql } from 'drizzle-orm'

export async function updatePersonalLeaderboard({ userId, battleId, result, model1, model2 }: { userId: string, battleId: number, result: string, model1: string, model2: string }) {
  try {
    // Get current status of both models
    const [model1Data, model2Data] = await Promise.all([
      db.query.models.findFirst({
        where: (models, { eq }) => eq(models.modelId, model1),
      }),
      db.query.models.findFirst({
        where: (models, { eq }) => eq(models.modelId, model2),
      }),
    ])

    if (!model1Data || !model2Data) {
      throw new Error('Model not found')
    }

    // Determine battle result and winner
    let battleResult = null
    let winnerId = null
    if (result === 'model1') {
      winnerId = model1Data.id
      battleResult = 'model1_win'
    }
    else if (result === 'model2') {
      winnerId = model2Data.id
      battleResult = 'model2_win'
    }
    else if (result === 'draw') {
      battleResult = 'draw'
    }
    else {
      battleResult = 'invalid'
    }

    // Start transaction
    return await db.transaction(async (tx) => {
      // Update battle record
      await tx.update(battles)
        .set({
          userId,
          winnerId,
          result: battleResult,
          votedAt: new Date().toISOString(),
        })
        .where(eq(battles.id, battleId))

      // Update model statistics based on result
      if (result === 'model1') {
        // Update win/loss counts
        await Promise.all([
          tx.update(models)
            .set({ wins: sql`${models.wins} + 1` })
            .where(eq(models.modelId, model1)),
          tx.update(models)
            .set({ losses: sql`${models.losses} + 1` })
            .where(eq(models.modelId, model2)),
        ])

        // Calculate and update ELO scores
        const K_FACTOR = 32
        const elo1 = model1Data.elo ?? DEFAULT_ELO
        const elo2 = model2Data.elo ?? DEFAULT_ELO
        const r1 = 10 ** (elo1 / 400)
        const r2 = 10 ** (elo2 / 400)
        const e1 = r1 / (r1 + r2)
        const e2 = r2 / (r1 + r2)

        const newElo1 = elo1 + K_FACTOR * (1 - e1)
        const newElo2 = elo2 + K_FACTOR * (0 - e2)

        await Promise.all([
          tx.update(models)
            .set({ elo: newElo1 })
            .where(eq(models.modelId, model1)),
          tx.update(models)
            .set({ elo: newElo2 })
            .where(eq(models.modelId, model2)),
        ])
      }
      else if (result === 'model2') {
        // Update win/loss counts
        await Promise.all([
          tx.update(models)
            .set({ wins: sql`${models.wins} + 1` })
            .where(eq(models.modelId, model2)),
          tx.update(models)
            .set({ losses: sql`${models.losses} + 1` })
            .where(eq(models.modelId, model1)),
        ])

        // Calculate and update ELO scores
        const K_FACTOR = 32
        const elo1 = model1Data.elo ?? DEFAULT_ELO
        const elo2 = model2Data.elo ?? DEFAULT_ELO
        const r1 = 10 ** (elo1 / 400)
        const r2 = 10 ** (elo2 / 400)
        const e1 = r1 / (r1 + r2)
        const e2 = r2 / (r1 + r2)

        const newElo1 = elo1 + K_FACTOR * (0 - e1)
        const newElo2 = elo2 + K_FACTOR * (1 - e2)

        await Promise.all([
          tx.update(models)
            .set({ elo: newElo1 })
            .where(eq(models.modelId, model1)),
          tx.update(models)
            .set({ elo: newElo2 })
            .where(eq(models.modelId, model2)),
        ])
      }
      else if (result === 'draw') {
        // Update draw counts
        await Promise.all([
          tx.update(models)
            .set({ draws: sql`${models.draws} + 1` })
            .where(eq(models.modelId, model1)),
          tx.update(models)
            .set({ draws: sql`${models.draws} + 1` })
            .where(eq(models.modelId, model2)),
        ])
      }
      else if (result === 'invalid') {
        // Update invalid counts
        await Promise.all([
          tx.update(models)
            .set({ invalid: sql`${models.invalid} + 1` })
            .where(eq(models.modelId, model1)),
          tx.update(models)
            .set({ invalid: sql`${models.invalid} + 1` })
            .where(eq(models.modelId, model2)),
        ])
      }

      return { status: 'success' }
    })
  }
  catch (error) {
    console.error('Error in vote action:', error)
    throw error
  }
}
