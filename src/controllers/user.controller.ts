import type { Request, Response } from "express";
import { db } from "../db/database.js";
import { compare, hash } from "bcrypt";
import { users } from "../schemas/users.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { MailService } from "../mail/mailer_service.js";

const find = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || !(typeof id === "string")) {
    res.status(404);
    return res.json({
      error: "Page not found",
    });
  }

  const user = await db.query.users.findFirst({
    where: { id },
  });

  if (!user) {
    res.status(404);
    return res.json({
      error: "User not found",
    });
  }

  return res.json({ user });
};

const generateRandomSixDigitNumber = () => {
  const min = 0;
  const max = 999999;

  return `${Math.floor(Math.random() * (max - min + 1)) + min}`.padStart(
    6,
    "0",
  );
};

const register = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (
    !name ||
    !(typeof name === "string") ||
    !email ||
    !(typeof email === "string")
  ) {
    res.status(400);
    return res.json({
      error: "Bad request.",
    });
  }

  const code = generateRandomSixDigitNumber();
  const codeHash = await hash(code, 8);

  const mailService = new MailService();
  mailService.sendUserConfirmation(name, email, code);

  const payload = {
    email,
    name,
    codeHash,
  };

  res.cookie("registering_user", payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 10,
    signed: true,
  });

  return res.json({ message: "E-mail sendend." });
};

const registerConfirmation = async (req: Request, res: Response) => {
  const { code, password } = req.body;
  const { name, email, codeHash } = req.signedCookies["registering_user"];

  if (
    !name ||
    !(typeof name === "string") ||
    !email ||
    !(typeof email === "string") ||
    !codeHash ||
    !(typeof codeHash === "string") ||
    !code ||
    !(typeof code === "string") ||
    !password ||
    !(typeof password === "string")
  ) {
    res.status(400);
    res.clearCookie("registering_user");
    return res.json({
      error: "Bad request.",
    });
  }

  const isCodeValid = await compare(code, codeHash);

  if (!isCodeValid) {
    res.status(401);
    return res.json({
      error: "Invalid code.",
    });
  }

  try {
    const passwordHash = await hash(password, 8);

    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({ id: users.id });
    const { id } = user || { id: undefined };

    if (!id) {
      res.status(400);
      res.clearCookie("registering_user");

      return res.json({
        error: "Bad request.",
      });
    }

    const token = jwt.sign({ id, email }, process.env.TOKEN_SECRET as any, {
      expiresIn: process.env.TOKEN_EXPIRATION as any,
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
      signed: true,
    });
    res.json({
      userId: id,
    });
  } catch (e) {
    res.status(400);
    res.clearCookie("registering_user");

    return res.json({
      error: "Bad request.",
    });
  }
};

const search = async (req: Request, res: Response) => {
  const { query } = req.params;

  if (!query || !(typeof query === "string")) {
    res.status(400);
    return res.json({
      error: "Bad request.",
    });
  }

  const token = req.signedCookies["auth_token"];

  const payload = jwt.decode(token) as (JwtPayload & { email: string }) | null;

  if (
    !payload ||
    !payload.email ||
    typeof payload.email !== "string" ||
    !token ||
    !(typeof token === "string")
  ) {
    res.status(401);
    return res.json({
      error: "Bad request.",
    });
  }

  const users = await db.query.users.findMany({
    where: {
      NOT: {
        email: payload.email,
      },
      OR: [
        {
          name: {
            ilike: `%${query}%`,
          },
        },
        {
          email: {
            ilike: `%${query}%`,
          },
        },
      ],
    },
    columns: {
      id: true,
      name: true,
      email: true,
    },
  });

  return res.json(users);
};

export default { find, register, registerConfirmation, search };
