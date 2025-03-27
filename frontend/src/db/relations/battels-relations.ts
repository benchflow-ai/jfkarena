import { relations } from 'drizzle-orm/relations'
import { battles } from '../schema/battles'
import { models } from '../schema/models'

export const battlesRelations = relations(battles, ({ one }) => ({
  model_model1Id: one(models, {
    fields: [battles.model1Id],
    references: [models.id],
    relationName: 'battles_model1Id_models_id',
  }),
  model_model2Id: one(models, {
    fields: [battles.model2Id],
    references: [models.id],
    relationName: 'battles_model2Id_models_id',
  }),
  model_winnerId: one(models, {
    fields: [battles.winnerId],
    references: [models.id],
    relationName: 'battles_winnerId_models_id',
  }),
}))
