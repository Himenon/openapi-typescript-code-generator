import * as fs from "fs";
import * as path from "path";

import * as Utils from "../utils";

describe("Split Code", () => {
  test("types", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/split/types.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });

  test("apiClient", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/split/apiClient.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
