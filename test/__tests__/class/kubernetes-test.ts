import * as fs from "node:fs";
import { describe, expect, test } from "vitest";

import * as Utils from "../../utils";

describe("Kubernetes", () => {
  test("client-v1.18.5.ts", async () => {
    const generateCode = fs.readFileSync("test/code/class/kubernetes/client-v1.18.5.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/kubernetes/client-v1.18.5.ts");
  });
  test("client-v1.28.6.ts", async () => {
    const generateCode = fs.readFileSync("test/code/class/kubernetes/client-v1.28.6.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    await expect(text).toMatchFileSnapshot("./__snapshots__/kubernetes/client-v1.28.6.ts");
  });
});
