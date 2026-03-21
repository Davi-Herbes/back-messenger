import { Router } from "express";
import { login, logout } from "./controllers/auth.controller.js";

import userController from "./controllers/user.controller.js";
import conversationController from "./controllers/conversation.controller.js";
import messagesController from "./controllers/messages.controller.js";

import { loginRequired } from "./middlewares/login_required.js";

export const router = Router();

router.post("/auth/login", login);
router.get("/auth/logout", logout);

router.get("/user/:id", loginRequired, userController.find);
router.get("/user/search/:query", userController.search);
router.post("/user", userController.register);
router.post("/user/confirm", userController.registerConfirmation);

router.post("/conversations/addUser", conversationController.create);
router.get("/conversations/:userId", conversationController.findByUser);

router.get("/messages/:conversationId", messagesController.findByConversation);
router.post("/messages", messagesController.sendMessage);
