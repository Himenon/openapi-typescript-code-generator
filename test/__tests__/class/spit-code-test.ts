import * as fs from "node:fs";
import { describe, expect, test } from "vitest";

import * as Utils from "../../utils";

describe("Split Code", () => {
  test("types", async () => {
    const generateCode = fs.readFileSync("test/code/class/split/types.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/split/types.ts");
  });

  test("apiClient", async () => {
    const generateCode = fs.readFileSync("test/code/class/split/apiClient.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/split/apiClient.ts");
  });
});
