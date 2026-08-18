// backend/src/controller/userController.ts

import { Context } from "hono";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { sign } from "hono/jwt";

/**
 * パスワード形式チェック
 *
 * 条件：
 * ・8～24文字
 * ・英小文字を含む
 * ・英大文字を含む
 * ・数字を含む
 * ・記号を含む
 *
 * @param password パスワード
 * @returns エラーメッセージ（正常時は null）
 */
function validatePassword(password: string): string | null {
  if (password.length < 8 || password.length > 24) {
    return "パスワードは8文字以上24文字以下で入力してください。";
  }

  if (!/[a-z]/.test(password)) {
    return "パスワードには英小文字を含めてください。";
  }

  if (!/[A-Z]/.test(password)) {
    return "パスワードには英大文字を含めてください。";
  }

  if (!/\d/.test(password)) {
    return "パスワードには数字を含めてください。";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "パスワードには記号を含めてください。";
  }

  return null;
}

/**
 * ユーザー新規登録処理
 */
export const signupUser = async (c: Context) => {
  try {
    /**
     * リクエストボディ取得
     */
    const requestBody: {
      email: string;
      password: string;
      username: string;
    } = await c.req.json();

    /**
     * 必須項目チェック
     */
    if (!requestBody.email || !requestBody.password || !requestBody.username) {
      return c.json(
        {
          success: false,
          error: "メールアドレス、パスワード、ユーザー名は必須です。",
        },
        400,
      );
    }

    /**
     * パスワード形式チェック
     */
    const validationError = validatePassword(requestBody.password);

    if (validationError) {
      return c.json(
        {
          success: false,
          error: validationError,
        },
        400,
      );
    }

    /**
     * メールアドレス重複チェック
     */
    const registeredUser = await prisma.user.findUnique({
      where: {
        email: requestBody.email,
      },
    });

    if (registeredUser) {
      return c.json(
        {
          success: false,
          error: "このメールアドレスは既に登録されています。",
        },
        400,
      );
    }

    /**
     * パスワードハッシュ化
     *
     * セキュリティ対策として平文保存を禁止する。
     */
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(requestBody.password, salt);

    /**
     * ユーザー情報登録
     */
    const createdUser = await prisma.user.create({
      data: {
        email: requestBody.email,
        passwordHash: hashedPassword,
        username: requestBody.username,
      },
    });

    return c.json(
      {
        success: true,
        message: "ユーザー登録が完了しました。",
        user: {
          id: createdUser.id,
          email: createdUser.email,
          username: createdUser.username,
        },
      },
      201,
    );
  } catch (error) {
    console.error("ユーザー登録処理エラー", error);

    return c.json(
      {
        success: false,
        error: "サーバー内部エラーが発生しました。",
      },
      500,
    );
  }
};

/**
 * ログイン処理
 */
export const loginUser = async (c: Context) => {
  try {
    /**
     * リクエストボディ取得
     */
    const requestBody: {
      email: string;
      password: string;
    } = await c.req.json();

    /**
     * 必須項目チェック
     */
    if (!requestBody.email || !requestBody.password) {
      return c.json(
        {
          success: false,
          error: "メールアドレスとパスワードを入力してください。",
        },
        400,
      );
    }

    /**
     * ユーザー情報取得
     */
    const loginUser = await prisma.user.findUnique({
      where: {
        email: requestBody.email,
      },
    });

    /**
     * ユーザー存在チェック
     */
    if (!loginUser) {
      return c.json(
        {
          success: false,
          error: "メールアドレスまたはパスワードが正しくありません。",
        },
        401,
      );
    }

    /**
     * パスワード照合
     */
    const isPasswordValid = await bcrypt.compare(
      requestBody.password,
      loginUser.passwordHash,
    );

    if (!isPasswordValid) {
      return c.json(
        {
          success: false,
          error: "メールアドレスまたはパスワードが正しくありません。",
        },
        401,
      );
    }

    /**
     * JWTシークレット取得
     */
    const jwtSecretKey = process.env.JWT_SECRET;

    if (!jwtSecretKey) {
      throw new Error("JWT_SECRET が設定されていません。");
    }

    /**
     * JWTペイロード生成
     *
     * 有効期限：7日
     */
    const jwtPayload = {
      sub: loginUser.id,
      email: loginUser.email,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    /**
     * JWT発行
     */
    const accessToken = await sign(jwtPayload, jwtSecretKey);

    return c.json(
      {
        success: true,
        message: "ログインに成功しました。",
        token: accessToken,
        user: {
          id: loginUser.id,
          email: loginUser.email,
          username: loginUser.username,
        },
      },
      200,
    );
  } catch (error) {
    console.error("ログイン処理エラー", error);

    return c.json(
      {
        success: false,
        error: "サーバー内部エラーが発生しました。",
      },
      500,
    );
  }
};
