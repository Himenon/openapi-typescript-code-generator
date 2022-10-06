import * as fs from "fs";

import * as Utils from "../utils";

describe("Format Types", () => {
  test("format.domain", () => {
    const generateCode = fs.readFileSync("test/code/format.domain/code.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
