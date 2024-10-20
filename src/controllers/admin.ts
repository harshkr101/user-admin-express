import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db/db";
import { z } from "zod";

// zod schemas
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

// admin controllers

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    res.status(201).json({ message: "User created successfully", data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // check filters
    if (req.query.name)
      where.name = { contains: req.query.name as string, mode: "insensitive" };
    if (req.query.email)
      where.email = {
        contains: req.query.email as string,
        mode: "insensitive",
      };
    if (req.query.role) where.role = req.query.role;

    // get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        registrationDate: true,
      },
      skip,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    res.json({
      data: {
        users,
        page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = updateUserSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }
    // update user
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email, role },
    });

    res.json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.id === req.user!.id) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    // delete user
    await prisma.user.delete({ where: { id: Number(id) } });

    res.json({ message: "User deleted successfully" });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
