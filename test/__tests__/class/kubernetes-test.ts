import * as fs from "fs";

import * as Utils from "../../utils";

describe("Kubernetes", () => {
  test("client-v1.18.5.ts", () => {
    const generateCode = fs.readFileSync("test/code/class/kubernetes/client-v1.18.5.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
