/* eslint-disable no-console */
/* eslint-disable node/prefer-global/process */
import { db } from '@/db'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { anonymous } from 'better-auth/plugins'

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
    // LINK DATA
    console.log('🚀 ~ onLinkAccount ~ anonymousUser:', anonymousUser)
    console.log('🚀 ~ onLinkAccount ~ newUser:', newUser)
  } })],
})
