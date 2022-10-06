import * as fs from "fs";
import * as path from "path";

import * as Utils from "../utils";

describe("Typedef only", () => {
  test("typedef-api.test.domain", () => {
    const generateCode = fs.readFileSync("test/code/typedef-only/api.test.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("typedef-infer.domain", () => {
    const generateCode = fs.readFileSync("test/code/typedef-only/infer.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("Reference test that include fragments", () => {
    const generateCode = fs.readFileSync("test/code/typedef-only/json.properties.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
