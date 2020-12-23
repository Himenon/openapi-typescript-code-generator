import { JSONSchema4 } from "json-schema";
import { generateInterface } from "../../generateInterface";

const schemas: JSONSchema4 = {
  type: "object",
  properties: {
    name: {
      type: "string",
      required: false,
    },
  },
};

const interfaceName = "MyTestInterface";
const expectResult = `export interface ${interfaceName} {
    name?: string;
}
`;

describe("Interface Generator", () => {
  it("Change Interface Name", () => {
    const result = generateInterface({ name: interfaceName, schema: schemas });
    expect(result).toBe(expectResult);
  });
});
