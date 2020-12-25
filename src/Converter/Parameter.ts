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
  const signatures: ts.PropertySignature[] = [
    factory.Property({
      name: "name",
      optional: false,
      type: factory.LiteralTypeNode({ value: parameter.name }),
    }),
    factory.Property({
      name: "in",
      optional: false,
      type: factory.LiteralTypeNode({ value: parameter.in }),
    }),
    factory.Property({
      name: "required",
      optional: false,
      type: factory.LiteralTypeNode({ value: parameter.required }),
    }),
  ];

  if (parameter.schema) {
    signatures.push(
      factory.Property({
        name: "schema",
        optional: false,
        type: convert(entryPoint, currentPoint, factory, parameter.schema),
      }),
    );
  }

  return signatures;
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
