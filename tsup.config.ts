import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts", "./src/api.ts", "./src/types.ts", "./src/templates.ts"],
  outDir: "esm",
  minify: false,
  target: "es2022",
  format: ["esm"],
  clean: true,
  dts: true,
  tsconfig: "./tsconfig.build.json",
  sourcemap: true,
});
