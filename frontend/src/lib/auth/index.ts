/* eslint-disable node/prefer-global/process */
import { db } from '@/db'
import { battles } from '@/db/schema/battles'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      prompt: 'select_account',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      prompt: 'select_account',
    },
  },
  plugins: [anonymous({ async  onLinkAccount({ anonymousUser, newUser }) {
    const oldUserId = anonymousUser.user.id
    const newUserId = newUser.user.id

    if (!oldUserId || !newUserId) {
      // eslint-disable-next-line no-console
      console.info('No valid user IDs, skipping syncing logic')
      return
    }

    try {
      await db.update(battles).set({
        userId: newUserId,
      }).where(eq(battles.userId, oldUserId))
    }
    catch (error) {
      console.error('Error syncing battles', error)
    }
  } })],
})
