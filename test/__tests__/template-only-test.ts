import * as fs from "fs";

import * as Utils from "../utils";

describe("Template Only", () => {
  test("api.test.domain", () => {
    const generateCode = fs.readFileSync("test/code/class/template-only/api.test.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("async-api.test.domain", () => {
    const generateCode = fs.readFileSync("test/code/class/template-only/sync-api.test.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("infer.domain", () => {
    const generateCode = fs.readFileSync("test/code/class/template-only/infer.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });

  test("functional-api.test.domain", () => {
    const generateCode = fs.readFileSync("test/code/functional/template-only/api.test.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("functional-async-api.test.domain", () => {
    const generateCode = fs.readFileSync("test/code/functional/template-only/sync-api.test.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
  test("functional-infer.domain", () => {
    const generateCode = fs.readFileSync("test/code/functional/template-only/infer.domain.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
