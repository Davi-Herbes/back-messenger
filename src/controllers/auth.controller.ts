import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { db } from "../db/database.js";
import { compare } from "bcrypt";

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;

	if (
		!email ||
		!password ||
		!(typeof email === "string") ||
		!(typeof password === "string")
	) {
		res.status(400);
		return res.json({
			error: "Login ou senha inválidos",
		});
	}

	const token = await authenticate(email, password);

	if (!token) {
		res.status(400);
		return res.json({
			error: "Login ou senha inválidos",
		});
	}

	res.cookie("auth_token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 1000 * 60 * 60 * 24,
		signed: true,
	});

	return res.json({
		token,
	});
};

export const logout = async (req: Request, res: Response) => {
	res.clearCookie("auth_token");
	return res.json({
		msg: "Logout efetuado",
	});
};

export const authenticate = async (
	email: string,
	password: string,
): Promise<boolean | string> => {
	const user = await db.query.users.findFirst({
		where: { email },
	});

	if (!user) {
		return false;
	}

	const isAValidPassword = await compare(password, user.passwordHash);

	if (!isAValidPassword) {
		return false;
	}

	const { createdAt, updatedAt, passwordHash, name, ...payload } = user;

	return jwt.sign(payload, process.env.TOKEN_SECRET as any, {
		expiresIn: process.env.TOKEN_EXPIRATION as any,
	});
};
