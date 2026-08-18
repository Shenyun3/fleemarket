import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import bcrypt from "bcryptjs";
import app from "../index.js";
import { prisma } from "../lib/prisma.js";

describe("Auth API Integration Tests (Real Database)", () => {
  // 💡 1. 测试前准备：确保 JWT 密钥存在，防止登录测试抛出 500
  beforeAll(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key";
  });

  // 💡 2. 每次测试前清空用户表
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  // 💡 3. 测试结束后断开数据库
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ==========================================
  // 1. 注册接口测试 (POST /api/auth/signup)
  // ==========================================
  describe("POST /api/auth/signup", () => {
    it("注册成功：传入符合强密码规范的数据，应返回 201 及用户信息", async () => {
      const res = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "newuser@example.com",
          password: "Password123!", // 满足：8~24位，含大小写字母、数字、符号
          username: "New User",
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.user.email).toBe("newuser@example.com");
      expect(body.user.username).toBe("New User");

      // 🔍 真实数据库验证
      const dbUser = await prisma.user.findUnique({
        where: { email: "newuser@example.com" },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.username).toBe("New User");
    });

    it("注册失败：密码过于简单（未包含特殊字符），应返回 400", async () => {
      const res = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "simple@example.com",
          password: "password123", // 缺少大写字母和特殊符号
          username: "Simple User",
        }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain("パスワード");
    });

    it("注册失败：邮箱已被占用，应返回 400", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      await prisma.user.create({
        data: {
          email: "exist@example.com",
          passwordHash: hashedPassword,
          username: "Existing User",
        },
      });

      const res = await app.request("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "exist@example.com",
          password: "Password123!",
          username: "Another User",
        }),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
    });
  });

  // ==========================================
  // 2. 登录接口测试 (POST /api/auth/login)
  // ==========================================
  describe("POST /api/auth/login", () => {
    it("登录成功：凭证正确，应返回 200 及 JWT Token", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      await prisma.user.create({
        data: {
          email: "login@example.com",
          passwordHash: hashedPassword,
          username: "Test User",
        },
      });

      const res = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "login@example.com",
          password: "Password123!",
        }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body).toHaveProperty("token");
      expect(body.user.email).toBe("login@example.com");
    });

    it("登录失败：密码错误，应返回 401", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      await prisma.user.create({
        data: {
          email: "login@example.com",
          passwordHash: hashedPassword,
          username: "Test User",
        },
      });

      const res = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "login@example.com",
          password: "WrongPassword123!",
        }),
      });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
    });
  });
});
