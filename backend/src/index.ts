// backend/src/index.ts

/**
 * 環境変数読み込み
 */
import "dotenv/config";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";

/**
 * 各機能ルーティングモジュール
 */
import auth from "./routes/auth.js";
import products from "./routes/products.js";
import users from "./routes/users.js";
import categories from "./routes/categories.js";
import tags from "./routes/tags.js";
import upload from "./routes/upload.js";

/**
 * Honoアプリケーション生成
 */
const app = new Hono();
export default app;

/**
 * CORS設定
 * フロントエンド（React）からのアクセスを許可する。
 */
app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

/**
 * ヘルスチェックAPI
 */
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "C2C Flea Market API is running!",
    timestamp: new Date().toISOString(),
  });
});

/**
 * APIルーティング登録
 */
app.route("/api/auth", auth);
app.route("/api/products", products);
app.route("/api/users", users);
app.route("/api/categories", categories);
app.route("/api/tags", tags);
app.route("/api/upload", upload);

/**
 * 静的ファイル配信 (画像アップロード)
 * 访问 http://localhost:3000/uploads/xxx.jpg 时直接读取 uploads 目录
 */
app.use("/uploads/*", serveStatic({ root: "./" }));

/**
 * サーバー待受ポート
 */
const port = 3000;

/**
 * HTTPサーバー起動
 */
if (process.env.NODE_ENV !== "test") {
  console.log(`サーバーを起動しました: http://localhost:${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}
