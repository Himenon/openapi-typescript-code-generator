import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import { convert } from "./toTypeNode";

export const generatePropertySignature = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  protocol: string,
  schema: OpenApi.Schema,
): ts.PropertySignature => {
  return factory.Property({
    name: `"${protocol}"`,
    type: convert(entryPoint, currentPoint, factory, schema),
  });
};
