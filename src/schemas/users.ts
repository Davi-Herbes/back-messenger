import { pgTable, varchar, uuid, boolean } from "drizzle-orm/pg-core";

import { timestamps } from "../db/helpers/columns.js";

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	passwordHash: varchar({ length: 255 }).notNull(),

	// valid: boolean().default(false),

	...timestamps,
});
