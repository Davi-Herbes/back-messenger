import { Router } from "express";
import { login, logout } from "./controllers/auth.controller.js";

import userController from "./controllers/user.controller.js";
import { loginRequired } from "./middlewares/login_required.js";

export const router = Router();

router.post("/auth/login", login);
router.get("/auth/logout", logout);

router.get("/user/:id", loginRequired, userController.find);
router.post("/user", userController.register);
router.post("/user/confirm", userController.registerConfirmation);
