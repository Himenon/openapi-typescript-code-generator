import * as fs from "fs";
import * as path from "path";

describe("Generate Code Snapshot Test", () => {
  test("api.test.domain", () => {
    const generateCode = fs.readFileSync(path.join(__dirname, "../code/api.test.domain.ts"), { encoding: "utf-8" });
    expect(generateCode).toMatchSnapshot();
  });
});
