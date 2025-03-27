import { neonConfig, Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'

neonConfig.webSocketConstructor = ws
// eslint-disable-next-line node/prefer-global/process
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool)
