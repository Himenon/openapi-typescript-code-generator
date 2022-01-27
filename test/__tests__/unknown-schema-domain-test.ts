import * as fs from "fs";
import * as path from "path";

import * as Utils from "../utils";

describe("Unknown", () => {
  test("client.ts", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/unknown.schema.domain/client.ts"), { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
