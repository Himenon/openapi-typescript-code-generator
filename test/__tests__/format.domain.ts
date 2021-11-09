import * as fs from "fs";
import * as path from "path";

import * as Utils from "../utils";

describe("Format Types", () => {
  test("format.domain", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/format.domain/code.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
