<<<<<<< HEAD
import { describe, expect, test } from "vitest";

import * as fs from "fs";
=======
import * as fs from "node:fs";
import { describe, expect, test } from "vitest";
>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879

import * as Utils from "../../utils";

describe("Typedef only", () => {
  test("typedef-api.test.domain", () => {
    const generateCode = fs.readFileSync("test/code/functional/typedef-only/api.test.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("typedef-infer.domain", () => {
    const generateCode = fs.readFileSync("test/code/functional/typedef-only/infer.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("Reference test that include nested properties", () => {
    const generateCode = fs.readFileSync("test/code/functional/typedef-only/json.properties.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
