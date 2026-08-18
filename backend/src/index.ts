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
 * 認証関連ルート
 */
import auth from "./routes/auth.js";

import upload from "./routes/upload.js";
/**
 * Honoアプリケーション生成
 */
const app = new Hono();
export default app;

/**
 * CORS設定
 *
 * フロントエンド（React）からのアクセスを許可する。
 */
app.use(
  "*",
  cors({
    // 許可するオリジン
    origin: "http://localhost:5173",

    // 許可するHTTPヘッダー
    allowHeaders: ["Content-Type", "Authorization"],

    // 許可するHTTPメソッド
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

/**
 * ヘルスチェックAPI
 *
 * サーバー稼働状況確認用
 */
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "C2C Flea Market API is running!",
    timestamp: new Date().toISOString(),
  });
});

/**
 * 認証関連API
 *
 * ベースパス：
 * /api/auth
 */
app.route("/api/auth", auth);

// 访问 http://localhost:3000/uploads/xxx.jpg 时直接读取 uploads 目录
app.use("/uploads/*", serveStatic({ root: "./" }));

app.route("/api/upload", upload);
/**
 * サーバー待受ポート
 */
const port = 3000;

/**
 * サーバー起動ログ出力
 */
console.log(`サーバーを起動しました: http://localhost:${port}`);

/**
 * HTTPサーバー起動
 */
if (process.env.NODE_ENV !== "test") {
  serve({
    fetch: app.fetch,
    port,
  });
}
