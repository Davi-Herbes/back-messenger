import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { db } from "../db/database.js";
import { compare } from "bcrypt";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log(email);

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

  const response = await authenticate(email, password);
  console.log(response);

  if (!response) {
    res.status(400);
    return res.json({
      error: "Login ou senha inválidos",
    });
  }

  const { token, user } = response;

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
    signed: true,
  });

  return res.json({
    token,
    user,
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
): Promise<
  | false
  | {
      token: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }
> => {
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

  const token = jwt.sign(payload, process.env.TOKEN_SECRET as any, {
    expiresIn: process.env.TOKEN_EXPIRATION as any,
  });

  return {
    token,
    user: {
      id: payload.id,
      name,
      email,
    },
  };
};
