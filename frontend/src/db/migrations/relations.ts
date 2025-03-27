import { relations } from "drizzle-orm/relations";
import { models, battles } from "./schema";

export const battlesRelations = relations(battles, ({one}) => ({
	model_model1Id: one(models, {
		fields: [battles.model1Id],
		references: [models.id],
		relationName: "battles_model1Id_models_id"
	}),
	model_model2Id: one(models, {
		fields: [battles.model2Id],
		references: [models.id],
		relationName: "battles_model2Id_models_id"
	}),
	model_winnerId: one(models, {
		fields: [battles.winnerId],
		references: [models.id],
		relationName: "battles_winnerId_models_id"
	}),
}));

export const modelsRelations = relations(models, ({many}) => ({
	battles_model1Id: many(battles, {
		relationName: "battles_model1Id_models_id"
	}),
	battles_model2Id: many(battles, {
		relationName: "battles_model2Id_models_id"
	}),
	battles_winnerId: many(battles, {
		relationName: "battles_winnerId_models_id"
	}),
}));