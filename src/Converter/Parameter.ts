import * as ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import { convert } from "./toTypeNode";

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  parameter: OpenApi.Parameter,
): ts.PropertySignature[] => {
  return [
    factory.Property({
      name: "name",
      type: factory.LiteralTypeNode({ value: parameter.name }),
    }),
    factory.Property({
      name: "in",
      type: factory.LiteralTypeNode({ value: parameter.in }),
    }),
    factory.Property({
      name: "required",
      type: factory.LiteralTypeNode({ value: parameter.required }),
    }),
    parameter.schema &&
      factory.Property({
        name: "schema",
        type: convert(entryPoint, currentPoint, factory, parameter.schema),
      }),
  ].filter(Boolean) as ts.PropertySignature[];
};

export const generateInterface = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  parameter: OpenApi.Parameter,
): ts.InterfaceDeclaration => {
  return factory.Interface({
    export: true,
    name,
    comment: parameter.description,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, parameter),
  });
};
