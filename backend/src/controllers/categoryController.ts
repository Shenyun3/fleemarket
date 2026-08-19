// backend/src/controllers/categoryController.ts
import { Context } from "hono";
import { prisma } from "../lib/prisma.js";

/**
 * 1. 获取全量分类树 (GET /api/categories)
 * 逻辑：查询所有顶层分类 (parentId 为 null)，并递归嵌套查询其下层 children
 */
export const getCategories = async (c: Context) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // 只取顶级大类
      },
      include: {
        children: {
          include: {
            children: true, // 支持三级分类展开
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return c.json({ success: true, data: categories });
  } catch (error) {
    console.error("获取分类失败:", error);
    return c.json({ success: false, error: "分类列表获取失败" }, 500);
  }
};

/**
 * 2. 获取标签列表 (GET /api/tags)
 */
export const getTags = async (c: Context) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return c.json({ success: true, data: tags });
  } catch (error) {
    console.error("获取标签失败:", error);
    return c.json({ success: false, error: "标签列表获取失败" }, 500);
  }
};
