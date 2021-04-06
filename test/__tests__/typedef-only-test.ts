import * as fs from "fs";
import * as path from "path";

import * as Utils from "../utils";

describe("Typedef only", () => {
  test("typedef-api.test.domain", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/typedef-only/api.test.domain.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("typedef-infer.domain", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/typedef-only/infer.domain.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
