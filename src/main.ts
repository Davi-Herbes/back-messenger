import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";

import { createServer } from "http";
import { Server } from "socket.io";

import { router } from "./router.js";

const app = express();
const server = createServer(app);
export const io = new Server(server);

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
