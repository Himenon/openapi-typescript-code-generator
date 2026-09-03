import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/api.ts", "./src/index.ts", "./src/meta.ts", "./src/templates.ts", "./src/types.ts", "./src/utils.ts"],
  minify: false,
  target: "es2023",
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
  tsconfig: "./tsconfig.build.json",
  sourcemap: true,
});
