import express from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/admin";
import { authenticate, authorizeAdmin } from "../utils/auth";

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.post("/users", createUser as express.RequestHandler);
router.get("/users", getUsers);
router.put("/users/:id", updateUser as express.RequestHandler);
router.delete("/users/:id", deleteUser as express.RequestHandler);

export default router;
