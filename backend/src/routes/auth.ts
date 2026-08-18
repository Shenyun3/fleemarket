// backend/src/routes/auth.ts

import { Hono } from "hono";
import { signupUser, loginUser } from "../controllers/userController.js";

/**
 * 認証関連ルーティング
 */
const auth = new Hono();

/**
 * ユーザー新規登録API
 *
 * ユーザー情報を登録する。
 */
auth.post("/signup", signupUser);

/**
 * ログインAPI
 *
 * 認証成功時にJWTを発行する。
 */
auth.post("/login", loginUser);

export default auth;
