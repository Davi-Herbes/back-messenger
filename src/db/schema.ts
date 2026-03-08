// export * from "../schemas/conversations.js";
// export * from "../schemas/messages.js";
// export * from "../schemas/participants.js";
// export * from "../schemas/users.js";

import { conversations } from "../schemas/conversations.js";
import { messages } from "../schemas/messages.js";
import { participants } from "../schemas/participants.js";
import { users } from "../schemas/users.js";

export const schema = { conversations, messages, participants, users };

import {
	conversationMessagesRelations,
	userMessagesRelations,
} from "../schemas/messages.js";

import {
	participantsConversationsRelations,
	participantsUsersRelations,
} from "../schemas/participants.js";

export const relations = {
	conversationMessagesRelations,
	userMessagesRelations,
	participantsConversationsRelations,
	participantsUsersRelations,
};
