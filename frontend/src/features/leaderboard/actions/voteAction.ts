'use server'

import { authorizedActionClient } from '@/lib/safe-action'
import { z } from 'better-auth'

export const voteAction = authorizedActionClient.schema(z.object({
  result: z.enum(['model1', 'model2']),
  model1: z.string(),
  model2: z.string(),
  battleId: z.number(),
  question: z.string(),
})).action(async ({ ctx, input }) => {
  
})
