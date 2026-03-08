import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import { relations, schema } from "./schema.js";

const sql = neon(process.env.DATABASE_URL || "");

export const db = drizzle({
	client: sql,
	casing: "snake_case",
	schema,
	relations: {
		...relations.conversationMessagesRelations,
		...relations.participantsConversationsRelations,
		...relations.participantsUsersRelations,
		...relations.userMessagesRelations,
	},
});
