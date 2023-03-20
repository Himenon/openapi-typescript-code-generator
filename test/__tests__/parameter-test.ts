import * as fs from "fs";

import * as Utils from "../utils";

describe("Parameter", () => {
  test("api.test.domain", () => {
    const generateCode = fs.readFileSync("test/code/class/parameter/api.test.domain.json", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("infer.domain", () => {
    const generateCode = fs.readFileSync("test/code/class/parameter/infer.domain.json", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("functional-api.test.domain", () => {
    const generateCode = fs.readFileSync("test/code/functional/parameter/api.test.domain.json", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("functional-infer.domain", () => {
    const generateCode = fs.readFileSync("test/code/functional/parameter/infer.domain.json", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
