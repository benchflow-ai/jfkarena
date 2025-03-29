import { PostHog } from 'posthog-node'

// eslint-disable-next-line node/prefer-global/process
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ''
export function PostHogClient() {
  if (!POSTHOG_KEY) {
    return null
  }
  const posthogClient = new PostHog(POSTHOG_KEY, {
    host: 'https://us.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  })
  return posthogClient
}
