import { relations } from 'drizzle-orm/relations'
import { battles } from '../schema/battles'
import { models } from '../schema/models'

export const modelsRelations = relations(models, ({ many }) => ({
  battles_model1Id: many(battles, {
    relationName: 'battles_model1Id_models_id',
  }),
  battles_model2Id: many(battles, {
    relationName: 'battles_model2Id_models_id',
  }),
  battles_winnerId: many(battles, {
    relationName: 'battles_winnerId_models_id',
  }),
}))
