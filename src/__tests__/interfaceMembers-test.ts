import { JSONSchema4 } from "json-schema";
import { generateInterface } from "../generateInterface";

const schemas: JSONSchema4 = {
  type: "object",
  properties: {
    name: {
      type: "string",
      required: false,
    },
    age: {
      type: "number",
    },
    body: {
      type: "object",
      properties: {
        child: {
          type: "string",
        },
      },
    },
  },
};

describe("Interface Generator", () => {
  it("Change Interface Name", () => {
    const name = "MyTestInterface";
    const expectResult = `interface ${name} {\n}\n`;
    const result = generateInterface({ name, schemas });
    console.log(JSON.stringify(result));
    expect(result).toBe(expectResult);
  });
});
