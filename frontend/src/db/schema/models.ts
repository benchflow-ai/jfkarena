import { doublePrecision, integer, pgTable, serial, unique, varchar } from 'drizzle-orm/pg-core'

export const models = pgTable('models', {
  id: serial().primaryKey().notNull(),
  modelId: varchar('model_id'),
  name: varchar(),
  wins: integer(),
  losses: integer(),
  draws: integer(),
  invalid: integer(),
  elo: doublePrecision(),
}, table => [
  unique('models_model_id_key').on(table.modelId),
])
