import { neonConfig, Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

// eslint-disable-next-line node/prefer-global/process
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

neonConfig.fetchEndpoint = (host) => {
  const [protocol, port] = host === 'localhost' ? ['http', 4444] : ['https', 443]
  return `${protocol}://${host}:${port}/sql`
}
const connectionStringUrl = new URL(connectionString)
neonConfig.useSecureWebSocket = connectionStringUrl.hostname !== 'localhost'
neonConfig.wsProxy = host => (host === 'localhost' ? `${host}:4444/v2` : `${host}/v2`)

const pool = new Pool({ connectionString })
export const db = drizzle(pool)
