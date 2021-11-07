import * as fs from "fs";
import * as path from "path";

import * as Utils from "../utils";

describe("Kubernetes", () => {
  test("client-v1.18.5.ts", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/kubernetes/client-v1.18.5.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
