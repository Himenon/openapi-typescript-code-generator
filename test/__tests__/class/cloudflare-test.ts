import * as fs from "fs";
import { describe, expect, it, test } from "vitest";

import * as Utils from "../../utils";

describe("Unknown", () => {
  test("client.ts", () => {
    const generateCode = fs.readFileSync("test/code/class/cloudflare/client.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
