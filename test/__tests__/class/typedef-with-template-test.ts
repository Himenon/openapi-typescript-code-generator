import * as fs from "node:fs";
import { describe, expect, test } from "vitest";

import * as Utils from "../../utils";

describe("Typedef with template", () => {
  test("required フィールドを省略したパスパラメータは必須の型として生成されること", async () => {
    const generateCode = fs.readFileSync("test/code/class/typedef-with-template/path-parameter.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/typedef-with-template/path-parameter.ts");
  });
  test("api.test.domain", async () => {
    const generateCode = fs.readFileSync("test/code/class/typedef-with-template/api.test.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/typedef-with-template/api.test.domain.ts");
  });
  test("api.v2.domain", async () => {
    const generateCode = fs.readFileSync("test/code/class/typedef-with-template/api.v2.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/typedef-with-template/api.v2.domain.ts");
  });
  test("async-api.test.domain", async () => {
    const generateCode = fs.readFileSync("test/code/class/typedef-with-template/sync-api.test.domain.ts", {
      encoding: "utf-8",
    });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/typedef-with-template/sync-api.test.domain.ts");
  });
  test("infer.domain", async () => {
    const generateCode = fs.readFileSync("test/code/class/typedef-with-template/infer.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/typedef-with-template/infer.domain.ts");
  });
  test("ref-access", async () => {
    const generateCode = fs.readFileSync("test/code/class/typedef-with-template/ref-access.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/typedef-with-template/ref-access.ts");
  });
  test("remote-ref-access", async () => {
    const generateCode = fs.readFileSync("test/code/class/typedef-with-template/remote-ref-access.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/typedef-with-template/remote-ref-access.ts");
  });
});
