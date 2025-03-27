import { nextCookies } from 'better-auth/next-js'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  // eslint-disable-next-line node/prefer-global/process
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [nextCookies()],
})
