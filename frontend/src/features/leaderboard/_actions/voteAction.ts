'use server'

import { authorizedActionClient } from '@/lib/safe-action'
import { z } from 'zod'
import { updateOverallLeaderboard } from '../_mutations/updateOverallLeaderboard'

export const voteAction = authorizedActionClient.schema(z.object({
  result: z.string(),
  model1: z.string(),
  model2: z.string(),
  battleId: z.number(),
})).action(async ({ ctx, parsedInput }) => {
  const { result, model1, model2, battleId } = parsedInput
  const userId = ctx.session.user.id

  await updateOverallLeaderboard({ userId, battleId, result, model1, model2 })
})
