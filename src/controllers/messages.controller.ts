import type { Request, Response } from "express";
import { db } from "../db/database.js";
import { messages } from "../schemas/messages.js";

import type { Server } from "socket.io";

import jwt, { type JwtPayload } from "jsonwebtoken";

const findByConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  if (!conversationId || typeof conversationId !== "string") {
    res.status(400);
    return res.json({ message: "Bad Request" });
  }

  const messages = await db.query.messages.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    with: {
      sender: {
        columns: {
          email: true,
        },
      },
    },
    columns: {
      id: true,
      text: true,
      createdAt: true,
    },
  });

  return res.json(messages);
};

const sendMessage = async (req: Request & { io?: Server }, res: Response) => {
  const { text, conversationId } = req.body;

  if (
    !conversationId ||
    !(typeof conversationId === "string") ||
    !text ||
    !(typeof text === "string")
  ) {
    res.status(400);
    return res.json({
      error: "Bad request.",
    });
  }

  const token = req.signedCookies["auth_token"];

  const payload = jwt.decode(token) as
    | (JwtPayload & { id: string; email: string; name: string })
    | null;
  console.log(payload);
  if (
    !token ||
    !(typeof token === "string") ||
    !payload ||
    typeof payload.id !== "string" ||
    typeof payload.email !== "string" ||
    !req.io
  ) {
    res.status(401);
    return res.json({
      error: "Unauthorized.",
    });
  }

  await db
    .insert(messages)
    .values({ senderId: payload.id, text, conversationId });

  // Se for implementar conversas em grupo:
  // Enviar um array com o id de todos os participantes da conversa
  // Ou
  // Fazer um find para pegar os participantes pelo conversationId
  req.io.to(`conversation_${conversationId}`).emit("receive_message", {
    conversationId,
    text,
    sender: { email: payload.email },
  });

  return res.json({ message: "Success" });
};

export default { findByConversation, sendMessage };
