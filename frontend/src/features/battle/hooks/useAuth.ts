import type { Model } from '../types'
import { useEffect, useState } from 'react'

export function useAuth() {
  const [models, setModels] = useState<Model[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const authenticate = async () => {
      try {
        const authResponse = await fetch('/api/auth')
        if (!authResponse.ok) {
          const loginResponse = await fetch('/api/auth', { method: 'POST' })
          if (!loginResponse.ok) {
            throw new Error('Failed to authenticate')
          }
        }
      }
      catch (err) {
        console.error('Authentication error:', err)
        return false
      }
      return true
    }

    const fetchModels = async () => {
      try {
        const isAuthenticated = await authenticate()
        if (!isAuthenticated) {
          setError('Failed to authenticate')
          return
        }

        const response = await fetch('/api/proxy/models')
        if (!response.ok) {
          throw new Error('Failed to fetch models')
        }
        const data = await response.json()
        setModels(data)
      }
      catch (error) {
        console.error('Error fetching models:', error)
        setError('Failed to load models')
      }
    }

    fetchModels()
  }, [])

  return { models, error }
}
