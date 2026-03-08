import jwt from "jsonwebtoken";
import { db } from "../db/database.js";
import type { NextFunction, Request, Response } from "express";

interface Payload {
	id: string;
	email: string;
}

export const loginRequired = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const token = req.signedCookies.auth_token;

	if (!token) {
		return res.status(401).json({
			errors: ["Login required"],
		});
	}

	try {
		const dados = jwt.verify(
			token,
			process.env.TOKEN_SECRET as any,
		) as unknown as Payload;

		const { id, email } = dados;

		const user = await db.query.users.findFirst({
			where: { email },
		});

		if (!user) {
			return res.status(401).json({
				errors: ["Usuário inválido"],
			});
		}
		next();
	} catch (e) {
		return res.status(401).json({
			errors: ["Token expirado ou inválido."],
		});
	}
};
