'use client'

import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSession } from '@/features/auth/use-session'
import useSWR from 'swr'

interface ModelStats {
  id: string
  name: string
  wins: number
  losses: number
  draws: number
  invalid: number
  elo: number
}

async function fetcher(url: string) {
  // Fetch the actual data
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data')
  }
  return response.json()
}

export default function Leaderboard() {
  const { data: session } = useSession()
  const isSignedIn = !!session?.user.id

  const { data: models, error, isLoading } = useSWR<ModelStats[]>(isSignedIn ? '/api/proxy/leaderboard' : null, fetcher)

  if (!isSignedIn || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-destructive text-center p-4">
        Error:
        {' '}
        {error.message}
      </div>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="text-right">ELO</TableHead>
            <TableHead className="text-right">Wins</TableHead>
            <TableHead className="text-right">Losses</TableHead>
            <TableHead className="text-right">Draws</TableHead>
            <TableHead className="text-right">Invalid</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models?.map((model, index) => (
            <TableRow key={model.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{model.name}</TableCell>
              <TableCell className="text-right">{Math.round(model.elo)}</TableCell>
              <TableCell className="text-right text-green-600">{model.wins}</TableCell>
              <TableCell className="text-right text-red-600">{model.losses}</TableCell>
              <TableCell className="text-right text-yellow-600">{model.draws}</TableCell>
              <TableCell className="text-right text-muted-foreground">{model.invalid}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
