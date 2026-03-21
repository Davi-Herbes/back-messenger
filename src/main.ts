import "dotenv/config";

import express, { type Request } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { createServer } from "http";
import { Server } from "socket.io";

import { router } from "./router.js";

const app = express();
const server = createServer(app);

export const io = new Server(server);

app.use(
  cors({
    origin: ["http://localhost:9000"],
    credentials: true,
  }),
);

io.on("connection", (socket) => {
  socket.on("join_chat", (conversationId) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
      }
    }

    const roomName = `conversation_${conversationId}`;
    socket.join(roomName);
  });
});

app.use((req: Request & { io?: Server }, res, next) => {
  req.io = io;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || ""));

app.use(router);
// app.use('/images/', express.static(resolve(__dirname, '..', 'uploads', 'images')));

io.on("connection", (socket) => {
  console.log("a user connected");
});

server.listen(3000, () => {
  console.log("OPA");
});
