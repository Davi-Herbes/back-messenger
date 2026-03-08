import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
	updatedAt: timestamp().$onUpdate(() => new Date()),
	createdAt: timestamp().defaultNow().notNull(),
	// deleted_at: timestamp(),
};
