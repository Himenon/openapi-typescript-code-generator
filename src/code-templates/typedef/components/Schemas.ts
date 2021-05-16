import { OpenApi } from "../../../types";
import { JsonSchemaToTypeDefinition } from "../../../utils";

export interface Payload {
  entryPoint: string;
  currentPoint: string;
  schemas: Record<string, OpenApi.Schema | OpenApi.Reference>;
}

export class Convert {
  public static generateNameSpace() {

  }
}