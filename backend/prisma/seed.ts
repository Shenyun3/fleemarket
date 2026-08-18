// backend/prisma/seed.ts

import { prisma } from "../src/lib/prisma.js";
import { categories, type CategorySeed } from "./seed-data/categories.js";
import { tags } from "./seed-data/tags.js";

// 用来递归的把所有一级category以及子目录放入数据库
async function seedCategory(category: CategorySeed, parentId: string | null) {
  let parent = await prisma.category.findFirst({
    where: {
      parentId,
      name: category.name,
    },
  });

  if (!parent) {
    parent = await prisma.category.create({
      data: {
        name: category.name,
        parentId: parentId,
      },
    });
  }

  // deal with children notice the parent.id it is the parent.id that was just created and returned
  if (category.children) {
    for (let child of category.children) {
      await seedCategory(child, parent.id);
    }
  }
}

async function seedTag(tags: { name: string }[]) {
  for (let tag of tags) {
    await prisma.tag.upsert({
      where: {
        name: tag.name,
      },
      update: {},
      create: {
        name: tag.name,
      },
    });
  }
}

// write master data into db asynchrounously
async function main() {
  console.log("Starting to write master data(seeding");
  for (const level1Category of categories) {
    await seedCategory(level1Category, null);
  }
  await seedTag(tags);
  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
