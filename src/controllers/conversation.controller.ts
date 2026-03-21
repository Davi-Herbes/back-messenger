import type { Request, Response } from "express";
import { v4 as uuid } from "uuid";

import { db } from "../db/database.js";
import { conversations } from "../schemas/conversations.js";
import { participants } from "../schemas/participants.js";

const findByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string") {
    res.status(400);
    return res.json({ message: "Bad request." });
  }

  const conversations = await db.query.conversations.findMany({
    where: {
      participants: {
        userId,
      },
    },
    columns: { id: true },
    with: {
      messages: {
        columns: { id: true, text: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        with: {
          sender: {
            columns: {
              email: true,
              name: true,
            },
          },
        },
      },
      participants: {
        columns: {},
        with: {
          participant: {
            columns: {
              email: true,
              name: true,
            },
          },
        },
        where: {
          NOT: {
            userId,
          },
        },
      },
    },
  });

  return res.json(conversations);
};

const create = async (req: Request, res: Response) => {
  try {
    const { firstUserId, secondUserId } = req.body;

    if (
      !firstUserId ||
      typeof firstUserId !== "string" ||
      !secondUserId ||
      typeof secondUserId !== "string"
    ) {
      throw new Error("Bad Request");
    }

    const conversation = await db.query.conversations.findFirst({
      where: {
        AND: [
          {
            participants: {
              participant: { id: firstUserId },
            },
          },
          {
            participants: {
              participant: { id: secondUserId },
            },
          },
        ],
      },
    });

    if (!!conversation) {
      res.status(409);
      return res.json({ message: "Conflict" });
    }

    const conversationId = uuid();
    await db.insert(conversations).values({ id: conversationId });

    await db.insert(participants).values([
      { conversationId, userId: firstUserId },
      { conversationId, userId: secondUserId },
    ]);

    return res.json({ message: "Success" });
  } catch (e) {
    console.log(e);
    res.status(400);
    return res.json("Bad Request");
  }
};

export default { findByUser, create };
