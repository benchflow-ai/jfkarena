import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { db } from '@/db'
import { battles } from '@/db/schema/battles'
import { models } from '@/db/schema/models'
import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getSession } from '../auth/get-session'

export async function PersonalLeaderboard() {
  const session = await getSession()
  const isSignedIn = !!session?.user.id && !session.user.isAnonymous

  if (!isSignedIn) {
    return (
      redirect('/login?next=/leaderboard/personal')
    )
  }

  const data = await db.query.battles.findMany({
    where: eq(battles.userId, session.user.id),
    with: {
      model_model1Id: true,
      model_model2Id: true,
    },
    orderBy: desc(battles.createdAt),
  })

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Question</TableHead>
            <TableHead>Model 1</TableHead>
            <TableHead>Model 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((model, index) => (
            <TableRow key={model.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                {model.model_model1Id?.name}
                {' '}
                {model.winnerId === model.model_model1Id?.id && '🏆'}
              </TableCell>
              <TableCell>
                {model.model_model2Id?.name}
                {' '}
                {model.winnerId === model.model_model2Id?.id && '🏆'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
