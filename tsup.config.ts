import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/api.ts", "./src/index.ts", "./src/meta.ts", "./src/templates.ts", "./src/types.ts", "./src/utils.ts"],
  minify: false,
  target: "es2020",
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
  splitting: false,
  tsconfig: "./tsconfig.build.json",
  sourcemap: true,
});
