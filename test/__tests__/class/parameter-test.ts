import * as fs from "node:fs";
import { describe, expect, test } from "vitest";

import * as Utils from "../../utils";

describe("Parameter", () => {
  test("api.test.domain", async () => {
    const generateCode = fs.readFileSync("test/code/class/parameter/api.test.domain.json", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/parameter/api.test.domain.json");
  });
  test("infer.domain", async () => {
    const generateCode = fs.readFileSync("test/code/class/parameter/infer.domain.json", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/parameter/infer.domain.json");
  });
  test("required フィールドを省略したパスパラメータは pickedParameters で required: true として扱われること", async () => {
    const generateCode = fs.readFileSync("test/code/class/parameter/path-parameter.json", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/parameter/path-parameter.json");
  });
});
