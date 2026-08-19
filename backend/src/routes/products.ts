// backend/src/routes/products.ts
import { Hono } from "hono";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  getProducts,
  getProductById,
} from "../controllers/productController.js";

const productRouter = new Hono();

// 公开接口：商品列表与详情
productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);

// 保护接口：发布、更新和下架必须经过 authenticate()
productRouter.post("/", authenticate(), createProduct);
productRouter.put("/:id", authenticate(), updateProduct);
productRouter.delete("/:id", authenticate(), deleteProduct);

export default productRouter;
