import express from "express";
import { register, login, getProfile } from "../controllers/user";
import { authenticate } from "../utils/auth";

const router = express.Router();

router.post("/register", register as express.RequestHandler);
router.post("/login", login as express.RequestHandler);
router.get("/profile", authenticate, getProfile as express.RequestHandler);

export default router;
