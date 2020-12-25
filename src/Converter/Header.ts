import ts from "typescript";
import { OpenApi } from "../OpenApiParser";
import { Factory } from "../TypeScriptCodeGenerator";
import { convert } from "./toTypeNode";

export const generatePropertySignatures = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  header: OpenApi.Header,
): ts.PropertySignature[] => {
  const signatures: ts.PropertySignature[] = [
    factory.Property({
      name: "required",
      optional: false,
      type: factory.LiteralTypeNode({ value: !!header.required }),
    }),
  ];

  if (header.schema) {
    signatures.push(
      factory.Property({
        name: "schema",
        optional: false,
        type: convert(entryPoint, currentPoint, factory, header.schema),
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
  header: OpenApi.Header,
): ts.InterfaceDeclaration => {
  return factory.Interface({
    export: true,
    name,
    deprecated: header.deprecated,
    comment: header.description,
    members: generatePropertySignatures(entryPoint, currentPoint, factory, header),
  });
};
