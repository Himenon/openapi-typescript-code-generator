import * as fs from "fs";
import * as path from "path";

import * as Utils from "../utils";

describe("Parameter", () => {
  test("api.test.domain", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/parameter/api.test.domain.json"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("infer.domain", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/parameter/infer.domain.json"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
