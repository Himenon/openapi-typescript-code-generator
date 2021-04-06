import * as fs from "fs";
import * as path from "path";

import * as Utils from "../utils";

describe("Template Only", () => {
  test("api.test.domain", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/template-only/api.test.domain.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("async-api.test.domain", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/template-only/sync-api.test.domain.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("infer.domain", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/template-only/infer.domain.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
