import { defineConfig } from "tsup";

export default defineConfig({
  target: "es2022",
  format: ["esm"],
  clean: true,
  dts: true,
});
