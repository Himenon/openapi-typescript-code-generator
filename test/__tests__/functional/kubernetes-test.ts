import * as fs from "node:fs";
import { describe, expect, test } from "vitest";

import * as Utils from "../../utils";

describe("Kubernetes", () => {
  test("client-v1.18.5.ts", () => {
    const generateCode = fs.readFileSync("test/code/functional/kubernetes/client-v1.18.5.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
