import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db/db";
import { z } from "zod";
import { JWT_SECRET } from "../config";

// zod schema

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// user controllers

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        registrationDate: true,
      },
    });

    if (!user) {
      res.status(500).json({ error: "Unable to create user" });
    }

    res
      .status(201)
      .json({ message: "User registered successfully", data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    // generate token
    const token = jwt.sign({ id: user.id }, JWT_SECRET as string, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // get user
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true, email: true, registrationDate: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ data: user });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
