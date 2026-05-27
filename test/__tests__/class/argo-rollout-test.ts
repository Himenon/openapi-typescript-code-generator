import * as fs from "node:fs";
import { describe, expect, test } from "vitest";

import * as Utils from "../../utils";

describe("Argo Rollout", () => {
  test("client.ts", async () => {
    const generateCode = fs.readFileSync("test/code/class/argo-rollout/client.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/argo-rollout/client.ts");
  });
});
