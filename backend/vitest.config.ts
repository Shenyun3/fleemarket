// backend/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 忽略打包出来的 dist 目录和 node_modules
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
