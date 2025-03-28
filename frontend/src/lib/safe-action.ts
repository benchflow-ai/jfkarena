import { createSafeActionClient } from 'next-safe-action'
import { authClient } from './auth/authClient'

export const actionClient = createSafeActionClient()

export const authorizedActionClient = actionClient.use(async ({ next }) => {
  const session = (await authClient.getSession()).data
  if (!session?.user.id)
    throw new Error('Unauthorized')

  return next({ ctx: { session } })
})
