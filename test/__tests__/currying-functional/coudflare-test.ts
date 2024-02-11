import * as fs from "fs";

import * as Utils from "../../utils";

describe("Unknown", () => {
  test("client.ts", () => {
    const generateCode = fs.readFileSync("test/code/currying-functional/cloudflare/client.ts", { encoding: "utf-8" });
    const text = Utils.replaceVersionInfo(generateCode);
    expect(text).toMatchSnapshot();
  });
});
