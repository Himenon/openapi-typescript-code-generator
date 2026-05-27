import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["test/**/__tests__/**/*.{ts,tsx}", "test/**/*.{test,spec}.{ts,tsx}"],
    exclude: [...configDefaults.exclude, "test/**/__tests__/**/__snapshots__/**"],
    environment: "node",
  },
});
