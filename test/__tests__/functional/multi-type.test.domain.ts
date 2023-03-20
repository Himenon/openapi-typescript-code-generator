import * as fs from "fs";

import * as Utils from "../../utils";

describe("Multi Type", () => {
  test("types", () => {
    const generateCode = fs.readFileSync("test/code/functional/mulit-type-test.domain/types.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });

  test("apiClient", () => {
    const generateCode = fs.readFileSync("test/code/functional/mulit-type-test.domain/apiClient.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
