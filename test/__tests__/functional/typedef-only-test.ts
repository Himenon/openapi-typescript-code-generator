import * as fs from "node:fs";
import { describe, expect, test } from "vitest";

import * as Utils from "../../utils";

describe("Typedef only", () => {
  test("typedef-api.test.domain", async () => {
    const generateCode = fs.readFileSync("test/code/functional/typedef-only/api.test.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/typedef-only/api.test.domain.ts");
  });
  test("typedef-infer.domain", async () => {
    const generateCode = fs.readFileSync("test/code/functional/typedef-only/infer.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/typedef-only/infer.domain.ts");
  });
  test("Reference test that include nested properties", async () => {
    const generateCode = fs.readFileSync("test/code/functional/typedef-only/json.properties.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/typedef-only/json.properties.ts");
  });
});
