import ts from "typescript";

import type { OpenApi } from "../../../types";
import { JsonSchemaToTypeDefinition } from "../../../utils";

export interface ConvertToolkit {
  generateTypeNode: (schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition) => ts.TypeNode;
}

const converter = new JsonSchemaToTypeDefinition.Converter();

export const ConvertToolkit: ConvertToolkit = {
  generateTypeNode: converter.generateTypeNode.bind(converter),
};
