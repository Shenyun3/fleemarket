// backend/src/routes/users.ts
import { Hono } from "hono";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getCurrentUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";

const usersRouter = new Hono();

// 保护接口：必须携带 JWT Token
usersRouter.use("*", authenticate());

// 查询当前用户个人资料
usersRouter.get("/me", getCurrentUserProfile);

// 更新当前用户个人资料
usersRouter.put("/me", updateUserProfile);

export default usersRouter;
