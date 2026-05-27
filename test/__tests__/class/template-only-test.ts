import * as fs from "node:fs";
import { describe, expect, test } from "vitest";

import * as Utils from "../../utils";

describe("Template Only", () => {
  test("api.test.domain", async () => {
    const generateCode = fs.readFileSync("test/code/class/template-only/api.test.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/template-only/api.test.domain.ts");
  });
  test("async-api.test.domain", async () => {
    const generateCode = fs.readFileSync("test/code/class/template-only/sync-api.test.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/template-only/sync-api.test.domain.ts");
  });
  test("infer.domain", async () => {
    const generateCode = fs.readFileSync("test/code/class/template-only/infer.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/template-only/infer.domain.ts");
  });
});
