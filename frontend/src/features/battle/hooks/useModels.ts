import type { Model } from '../types'
import { useSession } from '@/features/auth/use-session'
import { authClient } from '@/lib/auth/authClient'
import { useEffect } from 'react'
import useSWR from 'swr'

async function fetchModels() {
  const response = await fetch('/api/proxy/models')
  if (!response.ok)
    throw new Error('Failed to fetch models')

  return response.json()
}

export function useModels() {
  const { data: session, isPending } = useSession()

  const isSignedIn = !!session?.user.id
  const { data: models = [], error } = useSWR<Model[]>(isSignedIn ? '/api/proxy/models' : null, fetchModels)

  useEffect(() => {
    if (!isPending && !isSignedIn) {
      authClient.signIn.anonymous()
    }
  }, [isPending, isSignedIn])

  return {
    models,
    error: error?.message || null,
  }
}
