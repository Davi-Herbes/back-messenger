import { pgTable, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "../db/helpers/columns.js";

export const conversations = pgTable("conversations", {
	id: uuid().primaryKey().defaultRandom(),

	...timestamps,
});
