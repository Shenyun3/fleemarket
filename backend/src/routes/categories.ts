// backend/src/routes/categories.ts
import { Hono } from "hono";
import { getCategories } from "../controllers/categoryController.js";

const categoriesRouter = new Hono();

// 公开接口：获取分类树
categoriesRouter.get("/", getCategories);

export default categoriesRouter;
