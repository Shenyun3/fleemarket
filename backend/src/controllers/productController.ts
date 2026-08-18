//backend/src/controllers/productController.ts

import { Context } from "hono";
import { prisma } from "../lib/prisma.js";
import { ProductStatus } from "@prisma/client";

/**
 * 1. 商品出品 (POST /api/products)
 */
export const createProduct = async (c: Context) => {
  try {
    // 从 JWT 中间件设置的 Context 获取当前登录用户 ID (假设 JWT 载荷中名为 id 或 sub)
    const user = c.get("jwtPayload");
    const sellerId = user?.sub || user?.id;

    if (!sellerId || typeof sellerId !== "string") {
      return c.json({ success: false, error: "認証が必要です。" }, 401);
    }

    // 解析 Request Body
    const body: {
      title: string;
      description: string;
      price: number | string;
      categoryId: string;
      tagIds?: string[];
      imageUrls: string[];
    } = await c.req.json();

    const {
      title,
      description,
      price,
      categoryId,
      tagIds = [],
      imageUrls = [],
    } = body;

    // --- 校验阶段 ---
    if (!title || !description || !price || !categoryId) {
      return c.json(
        {
          success: false,
          error:
            "必須項目（タイトル、説明、価格、カテゴリ）を入力してください。",
        },
        400,
      );
    }

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return c.json(
        {
          success: false,
          error: "商品画像を最低1枚アップロードしてください。",
        },
        400,
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return c.json(
        { success: false, error: "正しく価格を入力してください。" },
        400,
      );
    }

    // --- 数据库写入 (Prisma 级联创建) ---
    const createdProduct = await prisma.product.create({
      data: {
        sellerId,
        categoryId,
        title,
        description,
        price: numericPrice,
        status: ProductStatus.LISTED,
        // 1. 级联创建商品图片
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            sortOrder: index, // 按数组顺序存排序值
          })),
        },
        // 2. 级联关联多对多标签 (若有传递 tagIds)
        tags:
          tagIds.length > 0
            ? {
                connect: tagIds.map((id) => ({ id })),
              }
            : undefined,
      },
      include: {
        images: true,
        tags: true,
        category: true,
      },
    });

    return c.json(
      {
        success: true,
        message: "商品を出品しました。",
        product: createdProduct,
      },
      201,
    );
  } catch (error) {
    console.error("商品出品エラー:", error);
    return c.json(
      { success: false, error: "サーバー内部エラーが発生しました。" },
      500,
    );
  }
};

/**
 * 商品下架/削除
 * DELETE /api/products/:id
 */
export const deleteProduct = async (c: Context) => {
  try {
    const user = c.get("jwtPayload");
    const currentUserId = user?.sub || user?.id;

    if (!currentUserId) {
      return c.json({ success: false, error: "認証が必要です。" }, 401);
    }

    const productId = c.req.param("id");

    if (!productId) {
      return c.json(
        { success: false, error: "商品IDが指定されていません。" },
        400,
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return c.json(
        { success: false, error: "指定された商品が見つかりません。" },
        404,
      );
    }

    if (product.sellerId !== currentUserId) {
      return c.json(
        { success: false, error: "他人の商品を削除する権限がありません。" },
        403,
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status: ProductStatus.HIDDEN,
      },
    });

    return c.json(
      {
        success: true,
        message: "商品を取り下げました（下架）。",
        product: {
          id: updatedProduct.id,
          status: updatedProduct.status,
        },
      },
      200,
    );
  } catch (error) {
    console.error("商品削除エラー:", error);

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
 * 商品情報更新
 * PUT /api/products/:id
 */
export const updateProduct = async (c: Context) => {
  try {
    const user = c.get("jwtPayload") as
      | {
          sub?: string;
          id?: string;
        }
      | undefined;

    const currentUserId = user?.sub || user?.id;

    if (!currentUserId || typeof currentUserId !== "string") {
      return c.json(
        {
          success: false,
          error: "認証が必要です。",
        },
        401,
      );
    }

    const productId = c.req.param("id");

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product || product.status === ProductStatus.HIDDEN) {
      return c.json(
        {
          success: false,
          error: "指定された商品が見つかりません。",
        },
        404,
      );
    }

    if (product.sellerId !== currentUserId) {
      return c.json(
        {
          success: false,
          error: "他人の商品を編集する権限がありません。",
        },
        403,
      );
    }

    const body = await c.req.json<{
      title?: string;
      description?: string;
      price?: number | string;
      categoryId?: string;
      tagIds?: string[];
      imageUrls?: string[];
    }>();

    const { title, description, price, categoryId, tagIds, imageUrls } = body;

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        price: price !== undefined ? Number(price) : undefined,
        categoryId: categoryId ?? undefined,

        images: imageUrls
          ? {
              deleteMany: {},
              create: imageUrls.map((url, index) => ({
                url,
                sortOrder: index,
              })),
            }
          : undefined,

        tags: tagIds
          ? {
              set: tagIds.map((id) => ({
                id,
              })),
            }
          : undefined,
      },

      include: {
        images: true,
        tags: true,
        category: true,
      },
    });

    return c.json(
      {
        success: true,
        message: "商品情報を更新しました。",
        product: updatedProduct,
      },
      200,
    );
  } catch (error) {
    console.error("商品更新エラー:", error);

    return c.json(
      {
        success: false,
        error: "サーバー内部エラーが発生しました。",
      },
      500,
    );
  }
};

// GET /api/products
export const getProducts = async (c: Context) => {
  try {
    const categoryId = c.req.query("categoryId");
    const keyword = c.req.query("keyword");

    const products = await prisma.product.findMany({
      where: {
        status: ProductStatus.LISTED, // 必须只展示上架中的商品
        categoryId: categoryId || undefined,
        title: keyword ? { contains: keyword, mode: "insensitive" } : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 }, // 列表页只需带主图
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json({ success: true, data: products });
  } catch (error) {
    return c.json({ success: false, error: "商品列表获取失败" }, 500);
  }
};

// GET /api/products/:id
export const getProductById = async (c: Context) => {
  try {
    const id = c.req.param("id");

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } }, // 全部图片
        category: true,
        tags: true,
        seller: {
          select: {
            id: true,
            username: true,
            createdAt: true, // 仅暴露公开个人信息，不泄露 passwordHash
          },
        },
      },
    });

    if (!product || product.status === ProductStatus.HIDDEN) {
      return c.json({ success: false, error: "商品不存在或已下架" }, 404);
    }

    return c.json({ success: true, data: product });
  } catch (error) {
    return c.json({ success: false, error: "获取商品详情失败" }, 500);
  }
};
