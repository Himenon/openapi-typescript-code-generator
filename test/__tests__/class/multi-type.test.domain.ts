import * as fs from "node:fs";
import { describe, expect, test } from "vitest";

import * as Utils from "../../utils";

describe("Multi Type", () => {
  test("types", async () => {
    const generateCode = fs.readFileSync("test/code/class/mulit-type-test.domain/types.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/mulit-type-test.domain/types.ts");
  });

  test("apiClient", async () => {
    const generateCode = fs.readFileSync("test/code/class/mulit-type-test.domain/apiClient.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/mulit-type-test.domain/apiClient.ts");
  });
});
