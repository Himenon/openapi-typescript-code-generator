import { transform } from "./transform";
import * as Traverse from "./traverse";
import { JSONSchema4 } from "json-schema";

interface Params {
  name: string;
  schemas: JSONSchema4;
}

const code = `
interface DummyInterface {

}
`;

export const generateInterface = (params: Params): string => {
  const result = transform(code, [
    Traverse.InterfaceName.traverse({ name: params.name }),
    Traverse.InterfaceAppendMembers.traverse({
      schemas: params.schemas,
    }),
  ]);
  console.log({ result });
  return result;
};
