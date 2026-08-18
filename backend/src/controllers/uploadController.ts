// backend/src/controller/uploadController.ts

import { Context } from "hono";
import crypto from "node:crypto";
import path from "node:path";
import { writeFile, mkdir } from "node:fs/promises";

// 修正 MIME 类型的拼写
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadImage = async (c: Context) => {
  try {
    const body = await c.req.formData();

    // 建议 key 改为 file（或者与前端约定好的字段名）
    const file = body.get("file") || body.get("image");

    // 1. 校验：检查是否存在且必须是 File 类型对象
    if (!file || !(file instanceof File)) {
      return c.json(
        {
          success: false,
          error: "画像文件を選択してください。",
        },
        400,
      );
    }

    // 2. 校验：格式检查
    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json(
        {
          success: false,
          error: "許可されていない文件形式です。(JPG, PNG, WebP のみ可能)",
        },
        400,
      );
    }

    // 3. 校验：大小检查 (< 5MB)
    if (file.size > MAX_FILE_SIZE) {
      return c.json(
        {
          success: false,
          error: "文件サイズは 5MB 以下にしてください。",
        },
        400,
      );
    }

    // 4. 生成唯一文件名
    const ext = path.extname(file.name) || ".jpg";
    const fileName = `${crypto.randomUUID()}${ext}`;

    // 5. 存储位置：保存在 backend 根目录下的 uploads 文件夹
    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // 6. 返回 HTTP 访问路径 (例如: /uploads/xxxx-xxxx.jpg)
    return c.json(
      {
        success: true,
        message: "画像アップロード成功",
        url: `/uploads/${fileName}`,
      },
      201,
    );
  } catch (error) {
    console.error("画像アップロードエラー:", error);
    return c.json(
      {
        success: false,
        error: "サーバー内部エラーが発生しました。",
      },
      500,
    );
  }
};
