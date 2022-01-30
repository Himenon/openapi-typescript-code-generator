import * as fs from "fs";
import * as path from "path";

import * as Utils from "../utils";

describe("Multi Type", () => {
  test("types", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/mulit-type-test.domain/types.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });

  test("apiClient", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/mulit-type-test.domain/apiClient.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
