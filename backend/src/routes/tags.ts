// backend/src/routes/tags.ts
import { Hono } from "hono";
import { getTags } from "../controllers/categoryController.js";

const tagsRouter = new Hono();

// 公开接口：获取标签列表
tagsRouter.get("/", getTags);

export default tagsRouter;
