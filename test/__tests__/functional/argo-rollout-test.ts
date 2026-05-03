import * as fs from "fs";
import { describe, expect, it, test } from "vitest";

import * as Utils from "../../utils";

describe("Argo Rollout", () => {
  test("client.ts", () => {
    const generateCode = fs.readFileSync("test/code/functional/argo-rollout/client.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
