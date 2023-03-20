import * as fs from "fs";

import * as Utils from "../utils";

describe("Split Code", () => {
  test("types", () => {
    const generateCode = fs.readFileSync("test/code/class/split/types.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });

  test("apiClient", () => {
    const generateCode = fs.readFileSync("test/code/class/split/apiClient.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });

  test("functional-types", () => {
    const generateCode = fs.readFileSync("test/code/functional/split/types.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });

  test("functional-apiClient", () => {
    const generateCode = fs.readFileSync("test/code/functional/split/apiClient.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
