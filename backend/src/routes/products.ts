// backend/src/routes/product.ts
import { Hono } from "hono";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getProductById,
} from "../controllers/productController.js";

const productRouter = new Hono();

// 公开接口：任何人都能看商品列表
productRouter.get("/", getProducts);

// 保护接口：发布和下架必须经过 authenticate()
productRouter.post("/", authenticate(), createProduct);
productRouter.delete("/:id", authenticate(), deleteProduct);

export default productRouter;
