import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db/db";
import { JWT_SECRET } from "../config";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      role: string;
    };
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> | void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as {
      id: number;
    };
    return (
      prisma.user
        .findUnique({ where: { id: decoded.id } })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((user: any) => {
          if (!user) {
            throw new Error("User not found");
          }
          req.user = { id: user.id, role: user.role };
          next();
        })
        .catch(() => {
          res.status(401).json({ error: "Invalid token" });
        })
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};
