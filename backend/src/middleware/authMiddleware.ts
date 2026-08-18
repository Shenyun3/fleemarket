// backend/src/middleware/authMiddleware.ts

import type {
  Context,
  Next,
  MiddlewareHandler,
  ContextVariableMap,
} from "hono";
import { verify } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";

// 扩展 Hono 的 ContextVariableMap，让 c.get("jwtPayload") 有类型
declare module "hono" {
  interface ContextVariableMap {
    jwtPayload: {
      sub: string; // 用户ID
      email: string; // 邮箱
      exp: number; // 过期时间
      [key: string]: unknown;
    };
  }
}

/**
 * JWT 认证中间件
 * 验证 Header 中的 Bearer Token 是否有效
 */
export const authenticate = (): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    // 1. 获取 Authorization Header
    const authHeader = c.req.header("Authorization");

    // 2. 检查 Header 格式
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ success: false, error: "未提供有效的认证令牌" }, 401);
    }

    // 3. 截取 Token
    const token = authHeader.slice(7); // 比 split(" ")[1] 更稳妥

    // 4. 读取密钥（优先 c.env，兼容多平台）
    const secret = c.env?.JWT_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET 未配置");
      return c.json({ success: false, error: "服务器配置错误" }, 500);
    }

    try {
      // 5. 验证 Token（必须指定算法）
      const payload = await verify(token, secret, "HS256");

      // 6. 存入上下文，供后续路由使用
      c.set("jwtPayload", payload as ContextVariableMap["jwtPayload"]);

      // 7. 放行
      await next();
    } catch (error) {
      console.error("JWT 验证失败:", error);
      return c.json({ success: false, error: "令牌无效或已过期" }, 401);
    }
  };
};
