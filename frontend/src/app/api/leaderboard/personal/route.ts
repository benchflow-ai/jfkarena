import { getSession } from '@/features/auth/get-session'

export async function GET() {
  const session = await getSession()
  if (!session?.user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  // const userId = session.user.id
}
