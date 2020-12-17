import { generateInterface } from "../generateInterface";

describe("Interface Generator", () => {
  it("Change Interface Name", () => {
    const name = "MyTestInterface";
    const expectResult = `export interface ${name} {\n}\n`;
    const result = generateInterface({ name, schema: {} });
    expect(result).toBe(expectResult);
  });
});
