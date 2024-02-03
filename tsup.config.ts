import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts", "./src/api.ts", "./src/types.ts", "./src/templates.ts"],
  minify: false,
  target: "es2020",
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
  splitting: false,
  tsconfig: "./tsconfig.build.json",
  sourcemap: true,
});
