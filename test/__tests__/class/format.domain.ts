<<<<<<< HEAD
import { describe, expect, test } from "vitest";

import * as fs from "fs";
=======
import * as fs from "node:fs";
import { describe, expect, test } from "vitest";
>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879

import * as Utils from "../../utils";

describe("Format Types", () => {
  test("format.domain", () => {
    const generateCode = fs.readFileSync("test/code/class/format.domain/code.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
