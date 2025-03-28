import { authClient } from '@/lib/auth/authClient'
import { useEffect } from 'react'

export function useSession() {
  const { data, isPending } = authClient.useSession()

  return { data, isPending }
}
