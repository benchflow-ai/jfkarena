import { authClient } from '@/lib/auth/authClient'
import { useEffect } from 'react'

export function useSession() {
  const { data, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && !data?.user.id) {
      authClient.signIn.anonymous()
    }
  }, [isPending, data?.user.id])

  return { data, isPending }
}
