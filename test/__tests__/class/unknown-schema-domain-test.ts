import * as fs from "node:fs";
import { describe, expect, test } from "vitest";

import * as Utils from "../../utils";

describe("Unknown", () => {
  test("client.ts", async () => {
    const generateCode = fs.readFileSync("test/code/class/unknown.schema.domain/client.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/unknown.schema.domain/client.ts");
  });
});
