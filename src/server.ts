import express from "express";
import userRoutes from "./routes/user";
import adminRoutes from "./routes/admin";
import { prisma } from "./db/db";
import { SERVER_PORT } from "./config";

const app = express();

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);

// Service to fetch users registered within the last 7 days
const fetchRecentUsers = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentUsers = await prisma.user.findMany({
    where: {
      registrationDate: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      id: true,
    },
  });
  console.log("Users registered in the last 7 days:", recentUsers);
};

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
  fetchRecentUsers();
});
