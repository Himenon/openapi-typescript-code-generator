import { transform } from "./transform";
import * as Traverse from "./traverse";
import { JSONSchema4 } from "json-schema";

interface Params {
  name: string;
  schema?: JSONSchema4;
}

const code = `export class Client {
  constructor(private baseUrl: string) {

  }
}`;

export const generateClass = (params: Params): string => {
  const result = transform(code, [
    Traverse.InterfaceName.traverse({ name: params.name }),
    Traverse.InterfaceAppendMembers.traverse({
      schemas: params.schema || {},
    }),
    Traverse.AddExport.traverse(),
  ]);
  return result;
};
