import { pgTable, unique, serial, varchar, integer, doublePrecision, foreignKey, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const models = pgTable("models", {
	id: serial().primaryKey().notNull(),
	modelId: varchar("model_id"),
	name: varchar(),
	wins: integer(),
	losses: integer(),
	draws: integer(),
	invalid: integer(),
	elo: doublePrecision(),
}, (table) => [
	unique("models_model_id_key").on(table.modelId),
]);

export const battles = pgTable("battles", {
	id: serial().primaryKey().notNull(),
	model1Id: integer("model1_id"),
	model2Id: integer("model2_id"),
	winnerId: integer("winner_id"),
	question: varchar(),
	response1: varchar(),
	response2: varchar(),
	result: varchar(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	votedAt: timestamp("voted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.model1Id],
			foreignColumns: [models.id],
			name: "battles_model1_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.model2Id],
			foreignColumns: [models.id],
			name: "battles_model2_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.winnerId],
			foreignColumns: [models.id],
			name: "battles_winner_id_fkey"
		}).onDelete("cascade"),
]);
